import SwiftUI
import streamio_addon_sdk

struct DetailView: View {
    let meta: AddonMetaMeta
    @State private var selectedVideoId: String?
    @State private var fullMeta: AddonMetaMeta?
    @State private var isLoading = false
    @State private var error: Error?
    @Environment(\.colorScheme) private var colorScheme
    @StateObject private var addonManager = AddonManager.shared
    @StateObject private var coordinator = NavigationCoordinator.shared
    
    private func loadFullMeta() async {
        guard let manifests = addonManager.getActiveManifests() else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        // Find all supporting addons instead of just the first one
        let supportingAddons = manifests.filter { manifest in
            manifest.idPrefixes?.contains { prefix in
                meta.id.hasPrefix(prefix)
            } ?? false
        }
        
        guard !supportingAddons.isEmpty else {
            error = NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "No addon found supporting this content"])
            return
        }
        
        // Try each addon until one succeeds
        for addon in supportingAddons {
            do {
                let addonMeta = try await addonManager.getMeta(from: addon.id, type: meta.type.rawValue, id: meta.id)
                fullMeta = addonMeta.meta
                return // Successfully got metadata, exit the function
            } catch {
                // Continue to next addon if this one fails
                continue
            }
        }
        
        // If we get here, all addons failed
        self.error = NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to load metadata from all supporting addons"])
    }
    
    private var isShowingSheet: Binding<Bool> {
        Binding(
            get: { selectedVideoId != nil },
            set: { if !$0 { selectedVideoId = nil } }
        )
    }
    
    
    private func handlePlayButton() {
        switch meta.type {
        case .movie:
            selectedVideoId = meta.id
            print("DEBUG: Movie ID selected: \(meta.id)")
            
        case .series:
            if let videos = (fullMeta ?? meta).videos,
               let firstVideo = videos.first {
                let newVideoId = "\(meta.id):\(String(describing: firstVideo.season)):\(String(describing: firstVideo.episode))"
                selectedVideoId = newVideoId
                print("DEBUG: Series ID selected: \(newVideoId)")
            } else {
                print("DEBUG: No videos found for series")
                return
            }
            
        default:
            print("DEBUG: Unsupported content type")
            return
        }
    }
    
    private func handleTrailerSelection(_ trailer: AddonMetaTrailer) {
        // Implementation for trailer selection
    }
    
    private func parseVideoComponents(_ videoId: String) -> (String, Int?, Int?) {
        let components = videoId.split(separator: ":")
        if components.count == 3 {
            return (
                String(components[0]),
                Int(components[1]),
                Int(components[2])
            )
        }
        return (videoId, nil, nil)
    }
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: true) {
            LazyVStack(spacing: 0) {
                // Hero Section
                VideoHeroSection(meta: fullMeta ?? meta) {
                    handlePlayButton()
                }
                
                if isLoading {
                    ProgressView()
                        .padding()
                } else {
                    // Content Section
                    VStack(spacing: 32) {
                        // Series Episode Selector
                        if meta.type == .series {
                            MaxWidthContent {
                                SeasonEpisodeSelector(meta: fullMeta ?? meta) { season, episode in
                                    let newVideoId = "\(meta.id):\(season):\(episode)"
                                    selectedVideoId = newVideoId
                                }
                            }
                        }
                        
                        // Trailers Section
                        if let videos = (fullMeta ?? meta).videos {
                            MaxWidthContent {
                                TrailerSection(videos: videos) { trailer in
                                    // handleTrailerSelection(trailer)
                                }
                            }
                        }
                        
                        // Meta Information
                        MaxWidthContent {
                            MetaSectionView(meta: fullMeta ?? meta)
                        }
                    }
                    .padding(.vertical, 32)
#if os(iOS)
                    .background(Color(.systemBackground))
#endif
                }
            }
        }
        .ignoresSafeArea(edges: .top)
#if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
#endif
        .toolbar(id: "detailViewToolbar") {
#if os(iOS)
            ToolbarItem(id: "title", placement: .principal) {
                Text(fullMeta?.name ?? meta.name)
                    .font(.headline)
                    .foregroundColor(.white)
                    .lineLimit(1)
            }
#else
            ToolbarItem(id: "title", placement: .navigation) {
                Text(fullMeta?.name ?? meta.name)
                    .font(.headline)
                    .lineLimit(1)
            }
#endif
        }
        
        .task {
            await loadFullMeta()
        }
        .sheet(isPresented: isShowingSheet) {
            if #available(iOS 16.0, *) {
                Group {
                    if let videoId = selectedVideoId {
                        let (id, season, episode) = parseVideoComponents(videoId)
                        StreamListView(
                            type: meta.type,
                            id: id,
                            season: season,
                            episode: episode,
                            meta: fullMeta ?? meta,
                            onStreamSelected: {
                                stream in
                                coordinator.navigateToVideoPlayer(NavigationStream(stream: stream, meta: meta))
                            }
                        )
                        .navigationTitle("Available Streams")
#if os(iOS)
                        .navigationBarTitleDisplayMode(.inline)
#endif
#if os(macOS)
                        .frame(minWidth: 600, minHeight: 400)
                        .toolbar {
                            ToolbarItem(placement: .automatic) {
                                Button("Dismiss") {
                                    selectedVideoId = nil
                                }
                            }
                        }
#endif
                    } else {
                        Text("Video is not selected")
                    }
                }
            } else {
                if let videoId = selectedVideoId {
                    let (id, season, episode) = parseVideoComponents(videoId)
                    StreamListView(
                        type: meta.type,
                        id: id,
                        season: season,
                        episode: episode,
                        meta: fullMeta ?? meta,
                        onStreamSelected: {
                            stream in
                            coordinator.navigateToVideoPlayer(NavigationStream(stream: stream, meta: meta))
                        }
                    )
                    .navigationTitle("Available Streams")
#if os(iOS)
                    .navigationBarTitleDisplayMode(.inline)
#endif
                } else {
                    Text("Video is not selected")
                }
            }
        }
        .alert("Error", isPresented: Binding(
            get: { error != nil },
            set: { if !$0 { error = nil } }
        )) {
            Button("OK") { error = nil }
        } message: {
            Text(error?.localizedDescription ?? "Unknown error")
        }
    }
}
