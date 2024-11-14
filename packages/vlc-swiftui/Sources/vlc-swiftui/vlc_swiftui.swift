import SwiftUI
import Combine
import VLCKitSPM
import AVFoundation

// MARK: - Player States
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
public enum PlayerState: Equatable {
    case idle
    case loading
    case playing
    case paused
    case stopped
    case buffering
    case seeking
    case error(String)
    
    var isInterruptible: Bool {
        switch self {
        case .playing, .paused, .buffering:
            return true
        default:
            return false
        }
    }
}

private func formatTime(_ seconds: Float) -> String {
    if seconds.isInfinite || seconds.isNaN {
        return "00:00"
    }
    
    let hours = Int(seconds) / 3600
    let minutes = Int(seconds) / 60 % 60
    let seconds = Int(seconds) % 60
    
    if hours > 0 {
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    } else {
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

// MARK: - Time Structure
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
public struct PlayerTime: Equatable {
    public let current: Float
    public let total: Float
    public var bufferedTime: Float = 0
    public var isLive: Bool = false
    
    public var progress: Float {
        guard total > 0 else { return 0 }
        return current / total
    }
    
    public var bufferedProgress: Float {
        guard total > 0 else { return 0 }
        return bufferedTime / total
    }
    
    public var remainingTime: Float {
        total - current
    }
}

// MARK: - Configuration
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
public struct VLCPlayerConfiguration {
    public let autoPlay: Bool
    public let showsBackButton: Bool
    public let showsFullscreenButton: Bool
    public let allowPictureInPicture: Bool
    public let defaultVolume: Int32
    public let hideControlsDelay: TimeInterval
    public let onBackButton: (() -> Void)?
    
    public init(
        autoPlay: Bool = true,
        showsBackButton: Bool = true,
        showsFullscreenButton: Bool = true,
        allowPictureInPicture: Bool = true,
        defaultVolume: Int32 = 100,
        hideControlsDelay: TimeInterval = 3.0,
        onBackButton: (() -> Void)? = nil
    ) {
        self.autoPlay = autoPlay
        self.showsBackButton = showsBackButton
        self.showsFullscreenButton = showsFullscreenButton
        self.allowPictureInPicture = allowPictureInPicture
        self.defaultVolume = defaultVolume
        self.hideControlsDelay = hideControlsDelay
        self.onBackButton = onBackButton
    }
}

// MARK: - ViewModel
@MainActor
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
public final class VLCPlayerViewModel: NSObject, ObservableObject {
    @Published public private(set) var playerState: PlayerState = .idle
    @Published public private(set) var playerTime = PlayerTime(current: 0, total: 0)
    @Published public var isControlsVisible = true
    @Published public private(set) var isUserSeeking = false
    @Published public private(set) var volume: Int32
    @Published public private(set) var isFullscreen = false
    @Published public var seekPosition: Float = 0
    @Published public private(set) var isMenuActive = false
    @Published public private(set) var videoScale: VideoScale = .fit
    @Published public private(set) var subtitleSize: SubtitleSize = .medium
    
    public let player: VLCMediaPlayer
    public let configuration: VLCPlayerConfiguration
    
    private var timeUpdateTimer: Timer?
    private var controlsTimer: Timer?
    private var seekDebouncer: Timer?
    private var volumeDebouncer: Timer?
    
    private static let emptyAspectRatio: UnsafeMutablePointer<Int8> = {
        let str = "".cString(using: .utf8)!
        let pointer = UnsafeMutablePointer<Int8>.allocate(capacity: str.count)
        pointer.initialize(from: str, count: str.count)
        return pointer
    }()
    
    private var cancellables = Set<AnyCancellable>()
    
    public func setVideoScale(_ scale: VideoScale) {
        videoScale = scale
        switch scale {
        case .fit:
            player.videoAspectRatio = nil
            player.scaleFactor = 0
        case .fill:
            player.videoAspectRatio = nil
            player.scaleFactor = 1
        case .stretch:
            player.videoAspectRatio = Self.emptyAspectRatio
            player.scaleFactor = 1
        }
        setMenuActive(false)
    }
    
    public func setSubtitleSize(_ size: SubtitleSize) {
    }
    
    
    public init(configuration: VLCPlayerConfiguration = VLCPlayerConfiguration()) {
        self.player = VLCMediaPlayer()
        self.configuration = configuration
        self.volume = configuration.defaultVolume
        super.init()
        setupPlayer()
    }
    
    public func cleanup() {
        timeUpdateTimer?.invalidate()
        controlsTimer?.invalidate()
        seekDebouncer?.invalidate()
        volumeDebouncer?.invalidate()
        player.stop()
    }
    
    private func setupPlayer() {
        player.delegate = self
        player.audio?.volume = volume
        startTimeUpdateTimer()
        
#if os(iOS)
        setupAudioSession()
        setupBackgroundPlayback()
#endif
    }
    
#if os(iOS)
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(
                AVAudioSession.Category.playback,
                mode: AVAudioSession.Mode.moviePlayback
            )
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    private func setupBackgroundPlayback() {
        do {
            try AVAudioSession.sharedInstance().setCategory(
                AVAudioSession.Category.playback,
                mode: AVAudioSession.Mode.moviePlayback,
                options: [
                    AVAudioSession.CategoryOptions.allowAirPlay,
                    AVAudioSession.CategoryOptions.allowBluetooth,
                    AVAudioSession.CategoryOptions.allowBluetoothA2DP
                ]
            )
        } catch {
            print("Failed to setup background playback: \(error)")
        }
    }
#endif
    
    private func startTimeUpdateTimer() {
        timeUpdateTimer?.invalidate()
        timeUpdateTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.updatePlayerTime()
            }
        }
    }
    
    private func stopAllTimers() {
        timeUpdateTimer?.invalidate()
        controlsTimer?.invalidate()
        seekDebouncer?.invalidate()
        volumeDebouncer?.invalidate()
    }
    
    private func updatePlayerTime() {
        guard !isUserSeeking else { return }
        let current = Float(player.time.intValue) / 1000
        let total = Float(player.media?.length.intValue ?? 0) / 1000
        // Remove buffering since it's not available in VLCMedia
        let isLive = player.media?.length.intValue == 0
        
        playerTime = PlayerTime(
            current: current,
            total: total,
            bufferedTime: 0, // Set to 0 since buffering info isn't available
            isLive: isLive
        )
        seekPosition = playerTime.progress
    }
    
    // MARK: - Public Methods
    public func loadMedia(url: URL) {
        playerState = .loading
        let media = VLCMedia(url: url)
        player.media = media
        if configuration.autoPlay {
            play()
        }
    }
    
    public func togglePlayPause() {
        if player.isPlaying {
            pause()
        } else {
            play()
        }
        showControlsTemporarily()
    }
    
    public func play() {
        player.play()
        playerState = .playing
    }
    
    public func pause() {
        player.pause()
        playerState = .paused
    }
    
    public func stop() {
        player.stop()
        playerState = .stopped
    }
    
    public func startSeeking() {
        isUserSeeking = true
        playerState = .seeking
    }
    
    public func seek(to percentage: Float) {
        seekPosition = percentage
        seekDebouncer?.invalidate()
        
        seekDebouncer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: false) { [weak self] _ in
            Task { @MainActor in
                guard let self = self else { return }
                self.player.position = percentage
                self.isUserSeeking = false
                self.playerState = self.player.isPlaying ? .playing : .paused
            }
        }
    }
    
    public func seekForward() {
        let currentTime = Float(player.time.intValue) / 1000
        let totalTime = Float(player.media?.length.intValue ?? 0) / 1000
        let newTime = min(currentTime + 10, totalTime)
        player.time = VLCTime(int: Int32(newTime * 1000))
    }
    
    public func seekBackward() {
        let currentTime = Float(player.time.intValue) / 1000
        let newTime = max(currentTime - 10, 0)
        player.time = VLCTime(int: Int32(newTime * 1000))
    }
    
    public func setVolume(_ newVolume: Int32) {
        volume = max(0, min(200, newVolume))
        volumeDebouncer?.invalidate()
        
        player.audio?.volume = newVolume
    }
    
    public func toggleFullscreen() {
        isFullscreen.toggle()
    }
    
    public func showControlsTemporarily() {
        // Don't hide controls if menu is active
        guard !isMenuActive else { return }
        
        isControlsVisible = true
        controlsTimer?.invalidate()
        
        if playerState == .playing {
            controlsTimer = Timer.scheduledTimer(withTimeInterval: configuration.hideControlsDelay, repeats: false) { [weak self] _ in
                Task { @MainActor in
                    guard let self = self, !self.isMenuActive else { return }
                    self.isControlsVisible = false
                }
            }
        }
    }
    
    public func setMenuActive(_ active: Bool) {
        isMenuActive = active
        if active {
            controlsTimer?.invalidate()
        } else {
            showControlsTemporarily()
        }
    }
}

// MARK: - VLC Delegate
// MARK: - VLC Delegate
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
extension VLCPlayerViewModel: VLCMediaPlayerDelegate {
    @MainActor
    private func handleStateChange(_ state: VLCMediaPlayerState) {
        switch state {
        case .playing:
            self.playerState = .playing
        case .paused:
            self.playerState = .paused
        case .stopped:
            self.playerState = .stopped
        case .buffering:
            // Only show buffering if we're not already playing
            if self.playerState != .playing {
                self.playerState = .buffering
            }
        case .error:
            self.playerState = .error("Playback error occurred")
        default:
            if self.isUserSeeking {
                self.playerState = .seeking
            } else {
                self.playerState = .idle
            }
        }
    }
    
    public nonisolated func mediaPlayerStateChanged(_ notification: Notification) {
        guard let player = notification.object as? VLCMediaPlayer else { return }
        let currentState = player.state // Capture the state value
        
        Task { @MainActor [weak self] in
            self?.handleStateChange(currentState)
        }
    }
    
    public nonisolated func mediaPlayerTimeChanged(_ notification: Notification) {
        Task { @MainActor [weak self] in
            self?.updatePlayerTime()
        }
    }
}

// MARK: - Main Player View
@available(iOS 14.0, macOS 12.0, tvOS 14.0, *)
public struct VLCPlayerView: View {
    @StateObject private var viewModel: VLCPlayerViewModel
    @Environment(\.scenePhase) private var scenePhase
    public let url: URL
    public var onBackButton: (() -> Void)?
    
    public init(url: URL, configuration: VLCPlayerConfiguration = VLCPlayerConfiguration(), onBackButton: (() -> Void)? = nil) {
        _viewModel = StateObject(wrappedValue: VLCPlayerViewModel(configuration: configuration))
        self.url = url
        self.onBackButton = onBackButton
    }
    
    public var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Video Content
                VideoContentView(player: viewModel.player, videoScale: viewModel.videoScale)
                    .onTapGesture {
                        if viewModel.isControlsVisible && !viewModel.isMenuActive {
                            viewModel.isControlsVisible = false
                        } else {
                            viewModel.showControlsTemporarily()
                        }
                    }
                    .gesture(
                        DragGesture(minimumDistance: 0)
                            .onChanged { _ in
                                viewModel.showControlsTemporarily()
                            }
                    )
#if os(macOS)
                    .onHover { _ in
                        viewModel.showControlsTemporarily()
                    }
#endif
                    .contentShape(Rectangle())
                
                if viewModel.playerState == .buffering {
                    BufferingView()
                }
                
                VStack {
                    if viewModel.isControlsVisible {
                        HStack {
                            if let onBackButton = onBackButton {
                                HStack {
                                    Button(action: onBackButton) {
                                        Image(systemName: "chevron.backward")
                                            .font(.system(size: 16, weight: .semibold))
                                            .frame(width: 24, height: 24)
                                            .foregroundColor(.white)
                                            .padding(8)
                                            .background(
                                                Circle()
                                                    .fill(Color.black.opacity(0.6))
                                            )
                                    }
                                    .buttonStyle(.plain)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 32)
                                    Spacer()
                                }
                                .padding(.top, geometry.safeAreaInsets.top)
                            }
                            Spacer()
                        }
                    }
                    
                    Spacer()
                    
                    if viewModel.isControlsVisible {
                        // Controls Card at the bottom
                        VStack(spacing: 0) {
                            // Scrubber and Time
                            VStack(spacing: 0) {
                                ScrubberBar(
                                    progress: viewModel.seekPosition,
                                    bufferedProgress: viewModel.playerTime.bufferedProgress,
                                    isLive: viewModel.playerTime.isLive,
                                    onStartSeeking: { viewModel.startSeeking() },
                                    onSeek: { viewModel.seek(to: $0) }
                                )
                                
                                // Time indicators
                                HStack {
                                    Text(formatTime(viewModel.playerTime.current))
                                        .font(.system(size: 12, weight: .medium))
                                    Spacer()
                                    if viewModel.playerTime.isLive && viewModel.playerState != .buffering {
                                        Text("LIVE")
                                            .font(.system(size: 12, weight: .bold))
                                            .foregroundColor(.red)
                                    } else {
                                        Text(formatTime(viewModel.playerTime.total))
                                            .font(.system(size: 12, weight: .medium))
                                    }
                                }
                                .foregroundColor(.white.opacity(0.9))
                            }
                            .padding(.horizontal, 16)
                            .padding(.top, 12)
                            
                            // Playback Controls
                            CompactPlayerControls(viewModel: viewModel)
                        }
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.black.opacity(0.8))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .strokeBorder(Color.white.opacity(0.1), lineWidth: 0.5)
                                )
                        )
                        .padding(.horizontal, 16)
                        .padding(.bottom, 16)
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadMedia(url: url)
        }
        .onDisappear {
            viewModel.cleanup()
        }
    }
}

// MARK: - Compact Player Controls
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
struct CompactPlayerControls: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    @State private var isVolumeExpanded = false
    
    var body: some View {
        ZStack {
            // Left: Volume Control
            HStack {
                VolumeControlGroup(viewModel: viewModel, isExpanded: $isVolumeExpanded)
                Spacer()
            }
            
            // Middle: Playback Controls
            HStack {
                Spacer()
                PlaybackControls(viewModel: viewModel)
                Spacer()
            }
            
            // Right: Track Selectors
            HStack {
                Spacer()
                TrackSelectors(viewModel: viewModel)
            }
        }
        .foregroundColor(.white)
        .buttonStyle(ScaledButtonStyle())
        .padding(.horizontal, 16)
        .padding(.bottom, 24)
    }
}

// MARK: - Volume Control Group
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
private struct VolumeControlGroup: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    @Binding var isExpanded: Bool
    
    private var volumeIconName: String {
        switch viewModel.volume {
        case 0:
            return "speaker.slash.fill"
        case 1...66:
            return "speaker.wave.1.fill"
        case 67...133:
            return "speaker.wave.2.fill"
        default:
            return "speaker.wave.3.fill"
        }
    }
    
    var body: some View {
        HStack(spacing: 8) {
            Button(action: {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    isExpanded.toggle()
                    viewModel.setMenuActive(true)
                }
            }) {
                Image(systemName: volumeIconName)
                    .font(.system(size: 16, weight: .semibold))
                    .frame(width: 24, height: 24)
            }
            
            if isExpanded {
                Slider(
                    value: Binding(
                        get: { Double(viewModel.volume) },
                        set: { viewModel.setVolume(Int32($0)) }
                    ),
                    in: 0...200,
                    step: 1
                )
                .frame(width: 100)
                .accentColor(.white)
                .transition(.move(edge: .leading).combined(with: .opacity))
            }
        }
    }
}

// MARK: - Playback Controls
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
private struct PlaybackControls: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        HStack(spacing: 32) {
            Button(action: viewModel.seekBackward) {
                Image(systemName: "gobackward.10")
                    .font(.system(size: 16, weight: .semibold))
                    .frame(width: 24, height: 24) // Fixed frame
            }
#if os(macOS)
            .focusable()
            .keyboardShortcut(.leftArrow, modifiers: [])
#endif
            Button(action: viewModel.togglePlayPause) {
                Image(systemName: viewModel.playerState == .playing ? "pause.fill" : "play.fill")
                    .font(.system(size: 22, weight: .semibold))
                    .frame(width: 24, height: 24) // Fixed frame
                    .contentShape(Rectangle())
            }
#if os(macOS)
            .focusable()
            .keyboardShortcut(.space, modifiers: [])
#endif
            Button(action: viewModel.seekForward) {
                Image(systemName: "goforward.10")
                    .font(.system(size: 16, weight: .semibold))
                    .frame(width: 24, height: 24) // Fixed frame
            }
#if os(macOS)
            .focusable()
            .keyboardShortcut(.rightArrow, modifiers: [])
#endif
        }
    }
}

// MARK: - Track Selectors
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
private struct TrackSelectors: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        HStack(spacing: 16) {
            AudioTrackSelector(viewModel: viewModel)
            SubtitleTrackSelector(viewModel: viewModel)
            MoreOptionsMenu(viewModel: viewModel)
        }
    }
}

// MARK: - More Options Menu
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
private struct MoreOptionsMenu: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        Menu {
            // Video Scale Options
            Menu("Video Scale") {
                Button(action: { viewModel.setVideoScale(.fit) }) {
                    HStack {
                        Text("Fit to Screen")
                        if viewModel.videoScale == .fit {
                            Image(systemName: "checkmark")
                        }
                    }
                }
                
                Button(action: { viewModel.setVideoScale(.fill) }) {
                    HStack {
                        Text("Fill Screen")
                        if viewModel.videoScale == .fill {
                            Image(systemName: "checkmark")
                        }
                    }
                }
                
                Button(action: { viewModel.setVideoScale(.stretch) }) {
                    HStack {
                        Text("Stretch")
                        if viewModel.videoScale == .stretch {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            }
            
            // Subtitle Size Options
            Menu("Subtitle Size") {
                ForEach(SubtitleSize.allCases, id: \.self) { size in
                    Button(action: { viewModel.setSubtitleSize(size) }) {
                        HStack {
                            Text(size.displayName)
                            if viewModel.subtitleSize == size {
                                Image(systemName: "checkmark")
                            }
                        }
                    }
                }
            }
        } label: {
            Image(systemName: "ellipsis.circle")
                .font(.system(size: 16, weight: .semibold))
        }
        .onTapGesture {
            viewModel.setMenuActive(true)
        }
    }
}

// MARK: - Audio Track Selector
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
private struct AudioTrackSelector: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        Menu {
            if let audioTrackIndexes = viewModel.player.audioTrackIndexes as? [Int32],
               let audioTrackNames = viewModel.player.audioTrackNames as? [String] {
                ForEach(0..<audioTrackNames.count, id: \.self) { i in
                    Button(action: {
                        viewModel.player.currentAudioTrackIndex = audioTrackIndexes[i]
                        viewModel.setMenuActive(false)
                    }) {
                        Text(audioTrackNames[i])
                    }
                }
            }
        } label: {
            Image(systemName: "speaker.wave.2")
                .font(.system(size: 16, weight: .semibold))
        }
        .onTapGesture {
            viewModel.setMenuActive(true)
        }
    }
}

// MARK: - Subtitle Track Selector
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
private struct SubtitleTrackSelector: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        Menu {
            Button(action: {
                viewModel.player.currentVideoSubTitleIndex = -1
                viewModel.setMenuActive(false)
            }) {
                Text("Off")
            }
            
            if let subtitleIndexes = viewModel.player.videoSubTitlesIndexes as? [Int32],
               let subtitleNames = viewModel.player.videoSubTitlesNames as? [String] {
                ForEach(0..<subtitleNames.count, id: \.self) { i in
                    Button(action: {
                        viewModel.player.currentVideoSubTitleIndex = subtitleIndexes[i]
                        viewModel.setMenuActive(false)
                    }) {
                        Text(subtitleNames[i])
                    }
                }
            }
        } label: {
            Image(systemName: "text.bubble")
                .font(.system(size: 16, weight: .semibold))
        }
        .onTapGesture {
            viewModel.setMenuActive(true)
        }
    }
}

@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
struct ScrubberBar: View {
    let progress: Float
    let bufferedProgress: Float
    let isLive: Bool
    let onStartSeeking: () -> Void
    let onSeek: (Float) -> Void
    
    @State private var dragProgress: Float?
    @State private var isDragging = false
    @State private var isHovering = false
    
    var body: some View {
        GeometryReader { geometry in
            // Container to center everything
            ZStack(alignment: .leading) {
                // Track Group
                ZStack(alignment: .leading) {
                    // Background track
                    Capsule()
                        .fill(Color.white.opacity(0.2))
                    
                    // Buffered progress
                    if !isLive {
                        Capsule()
                            .fill(Color.white.opacity(0.3))
                            .frame(width: geometry.size.width * CGFloat(bufferedProgress))
                    }
                    
                    // Progress bar
                    Capsule()
                        .fill(isLive ? Color.red : Color.white)
                        .frame(width: geometry.size.width * CGFloat(dragProgress ?? progress))
                }
                .frame(height: 4)
                .frame(maxHeight: .infinity, alignment: .center) // Center the track vertically
                
                // Scrubber handle
                Circle()
                    .fill(Color.white)
                    .frame(width: isHovering || isDragging ? 16 : 12,
                           height: isHovering || isDragging ? 16 : 12)
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
                    .frame(maxHeight: .infinity, alignment: .center) // Center the handle vertically
                    .offset(x: geometry.size.width * CGFloat(dragProgress ?? progress) - (isHovering || isDragging ? 8 : 6)) // Adjust offset based on handle size
                    .opacity((isDragging || isHovering) ? 1 : 0)
                    .animation(.easeInOut(duration: 0.2), value: isHovering || isDragging)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        if dragProgress == nil {
                            isDragging = true
                            onStartSeeking()
                        }
                        dragProgress = Float(max(0, min(1, value.location.x / geometry.size.width)))
                    }
                    .onEnded { _ in
                        if let progress = dragProgress {
                            onSeek(progress)
                            dragProgress = nil
                            isDragging = false
                        }
                    }
            )
            .onHover { hovering in
                withAnimation(.easeInOut(duration: 0.2)) {
                    isHovering = hovering
                }
            }
        }
        .frame(height: 20) // Fixed height for the entire control
        .padding(.vertical, 4) // Add some padding around the control
    }
}

// MARK: - Buffering View
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
struct BufferingView: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
            
            VStack(spacing: 12) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.0) // Reduced from 1.5 to match toolbar style
                
                Text("Loading...")
                    .foregroundColor(.white)
                    .font(.system(size: 14, weight: .medium))
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.black.opacity(0.8))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .strokeBorder(Color.white.opacity(0.1), lineWidth: 0.5)
                    )
            )
        }
    }
}

// MARK: - Video Content View
#if os(iOS) || os(tvOS)
@available(iOS 13.0, tvOS 13.0, *)
public struct VideoContentView: UIViewRepresentable {
    let player: VLCMediaPlayer
    let videoScale: VideoScale
    
    
    public func makeUIView(context: Context) -> UIView {
        let view = UIView()
        view.backgroundColor = .black
        player.drawable = view
        updateScaling(view)
        return view
    }
    
    public func updateUIView(_ uiView: UIView, context: Context) {
        updateScaling(uiView)
    }
    
    private func updateScaling(_ view: UIView) {
        view.contentMode = videoScale == .fit ? .scaleAspectFit :
        videoScale == .fill ? .scaleAspectFill : .scaleToFill
    }
    
}
#elseif os(macOS)
@available(macOS 12.0, *)
public struct VideoContentView: NSViewRepresentable {
    let player: VLCMediaPlayer
    let videoScale: VideoScale
    
    // Store the C-string pointer
    private static let emptyAspectRatio: UnsafeMutablePointer<Int8> = {
        let str = "".cString(using: .utf8)!
        let pointer = UnsafeMutablePointer<Int8>.allocate(capacity: str.count)
        pointer.initialize(from: str, count: str.count)
        return pointer
    }()
    
    public func makeNSView(context: Context) -> NSView {
        let view = NSView()
        view.wantsLayer = true
        view.layer?.backgroundColor = .black
        player.drawable = view
        updateScaling(view)
        return view
    }
    
    public func updateNSView(_ nsView: NSView, context: Context) {
        updateScaling(nsView)
    }
    
    private func updateScaling(_ view: NSView) {
        switch videoScale {
        case .fit:
            view.layer?.contentsGravity = .resizeAspect
            player.videoAspectRatio = nil
            player.scaleFactor = 0
        case .fill:
            view.layer?.contentsGravity = .resizeAspectFill
            player.videoAspectRatio = nil
            player.scaleFactor = 1
        case .stretch:
            player.videoAspectRatio = Self.emptyAspectRatio
            player.scaleFactor = 1
            view.layer?.contentsGravity = .resize
        }
    }
}
#endif

// MARK: - Controls View
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
public struct PlayerControls: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    public var body: some View {
        VStack(spacing: 0) {
            Spacer()
            
            // Bottom Controls Container
            VStack(spacing: 8) {
                // Playback Controls
                HStack(spacing: 32) {
                    Button(action: viewModel.seekBackward) {
                        Image(systemName: "gobackward.10")
                            .font(.system(size: 22))
                    }
                    
                    Button(action: viewModel.togglePlayPause) {
                        Image(systemName: viewModel.playerState == .playing ? "pause.fill" : "play.fill")
                            .font(.system(size: 26))
                    }
                    
                    Button(action: viewModel.seekForward) {
                        Image(systemName: "goforward.10")
                            .font(.system(size: 22))
                    }
                }
                .foregroundColor(.white)
                .buttonStyle(ScaledButtonStyle())
                
                // Progress Bar and Time Labels
                VStack(spacing: 4) {
                    CustomProgressBar(
                        progress: viewModel.seekPosition,
                        bufferedProgress: viewModel.playerTime.bufferedProgress,
                        isLive: viewModel.playerTime.isLive,
                        onStartSeeking: { viewModel.startSeeking() },
                        onSeek: { viewModel.seek(to: $0) }
                    )
                    
                    HStack {
                        Text(formatTime(viewModel.playerTime.current))
                            .font(.caption)
                        Spacer()
                        if viewModel.playerTime.isLive {
                            Text("LIVE")
                                .foregroundColor(.red)
                        } else {
                            Text(formatTime(viewModel.playerTime.total))
                                .font(.caption)
                        }
                    }
                    .foregroundColor(.white)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 20)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.black.opacity(0), Color.black.opacity(0.7)]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
        }
    }
}

// MARK: - Top Control Bar
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
struct TopControlBar: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        HStack {
            if viewModel.configuration.showsBackButton {
                Button(action: {
                    viewModel.configuration.onBackButton?()
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .frame(width: 24, height: 24)
                        .foregroundColor(.white)
                }
            }
            
            Spacer()
            
            // Volume Control
            VolumeControl(volume: viewModel.volume) { newVolume in
                viewModel.setVolume(newVolume)
            }
            
            if viewModel.configuration.showsFullscreenButton {
                Button(action: viewModel.toggleFullscreen) {
                    Image(systemName: viewModel.isFullscreen ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right")
                        .font(.system(size: 16, weight: .semibold))
                        .frame(width: 24, height: 24)
                        .foregroundColor(.white)
                }
            }
        }
    }
}

// MARK: - Volume Control
@available(iOS 14.0, macOS 12.0, tvOS 13.0, *)
struct VolumeControl: View {
    let volume: Int32
    let onVolumeChange: (Int32) -> Void
    
    @State private var isExpanded = false
    
    var body: some View {
        HStack(spacing: 8) {
            Button(action: { isExpanded.toggle() }) {
                Image(systemName: volumeIconName)
                    .font(.title3)
                    .foregroundColor(.white)
            }
            
            if isExpanded {
                Slider(
                    value: Binding(
                        get: { Double(volume) },
                        set: { onVolumeChange(Int32($0)) }
                    ),
                    in: 0...200,
                    step: 1
                )
                .frame(width: 100)
                .accentColor(.white)
            }
        }
        .padding(.horizontal)
        .transition(.opacity)
        .animation(.easeInOut, value: isExpanded)
    }
    
    private var volumeIconName: String {
        switch volume {
        case 0:
            return "speaker.slash.fill"
        case 1...66:
            return "speaker.wave.1.fill"
        case 67...133:
            return "speaker.wave.2.fill"
        default:
            return "speaker.wave.3.fill"
        }
    }
}

// MARK: - Center Play Button
@available(iOS 13.0, macOS 12, tvOS 13.0, *)
struct CenterPlayButton: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        Button(action: viewModel.togglePlayPause) {
            Image(systemName: viewModel.playerState == .playing ? "pause.circle.fill" : "play.circle.fill")
                .font(.system(size: 72))
                .foregroundColor(.white)
                .shadow(radius: 5)
        }
        .buttonStyle(ScaledButtonStyle())
    }
}

// MARK: - Bottom Control Bar
@available(iOS 14.0, macOS 12, tvOS 13.0, *)
struct BottomControlBar: View {
    @ObservedObject var viewModel: VLCPlayerViewModel
    
    var body: some View {
        VStack(spacing: 8) {
            // Playback Controls
            HStack(spacing: 20) {
                Button(action: viewModel.seekBackward) {
                    Image(systemName: "gobackward.10")
                        .font(.title3)
                }
                
                Button(action: viewModel.togglePlayPause) {
                    Image(systemName: viewModel.playerState == .playing ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 44))
                }
                
                Button(action: viewModel.seekForward) {
                    Image(systemName: "goforward.10")
                        .font(.title3)
                }
            }
            .foregroundColor(.white)
            .buttonStyle(ScaledButtonStyle())
            .padding(.bottom, 4)
            
            // Progress Bar and Time Labels
            VStack(spacing: 4) {
                CustomProgressBar(
                    progress: viewModel.seekPosition,
                    bufferedProgress: viewModel.playerTime.bufferedProgress,
                    isLive: viewModel.playerTime.isLive,
                    onStartSeeking: { viewModel.startSeeking() },
                    onSeek: { viewModel.seek(to: $0) }
                )
                
                HStack {
                    Text(formatTime(viewModel.playerTime.current))
                    Spacer()
                    if viewModel.playerTime.isLive {
                        Text("LIVE")
                            .foregroundColor(.red)
                    } else {
                        Text(formatTime(viewModel.playerTime.total))
                    }
                }
                .font(.caption)
                .foregroundColor(.white)
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - Custom Progress Bar
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
struct CustomProgressBar: View {
    let progress: Float
    let bufferedProgress: Float
    let isLive: Bool
    let onStartSeeking: () -> Void
    let onSeek: (Float) -> Void
    
    @State private var dragProgress: Float?
    @State private var isDragging = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background
                Rectangle()
                    .fill(Color.white.opacity(0.3))
                
                // Buffered Progress
                if !isLive {
                    Rectangle()
                        .fill(Color.white.opacity(0.5))
                        .frame(width: geometry.size.width * CGFloat(bufferedProgress))
                }
                
                // Progress
                Rectangle()
                    .fill(isLive ? Color.red : Color.white)
                    .frame(width: geometry.size.width * CGFloat(dragProgress ?? progress))
            }
            .frame(height: 3) // Made thinner
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        if dragProgress == nil {
                            isDragging = true
                            onStartSeeking()
                        }
                        dragProgress = Float(max(0, min(1, value.location.x / geometry.size.width)))
                    }
                    .onEnded { _ in
                        if let progress = dragProgress {
                            onSeek(progress)
                            dragProgress = nil
                            isDragging = false
                        }
                    }
            )
        }
        .frame(height: 3) // Made thinner
    }
}

// MARK: - Button Style
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
struct ScaledButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Orientation Lock (iOS only)
#if os(iOS)
@available(iOS 13.0, *)
struct DeviceRotationViewModifier: ViewModifier {
    let orientation: UIInterfaceOrientationMask
    
    func body(content: Content) -> some View {
        content
            .onAppear()
            .onDisappear()
    }
}

@available(iOS 13.0, *)
extension View {
    func lockOrientation(_ orientation: UIInterfaceOrientationMask) -> some View {
        modifier(DeviceRotationViewModifier(orientation: orientation))
    }
}
#endif
