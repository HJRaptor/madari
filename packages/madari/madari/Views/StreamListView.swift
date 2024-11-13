import SwiftUI
import streamio_addon_sdk

struct StreamListView: View {
    let type: AddonMetaMetaType
    let id: String
    let season: Int?
    let episode: Int?
    let meta: AddonMetaMeta
    @Environment(\.dismiss) var dismiss
    
    @StateObject private var addonManager = AddonManager.shared
    @State private var streams: [streamio_addon_sdk.AddonStreamItem] = []
    @State private var isLoading = true
    @State private var error: Error?
    @State private var noAddonsEnabled = false
    let onStreamSelected: (streamio_addon_sdk.AddonStreamItem) -> Void
    
    init(type: AddonMetaMetaType, id: String, season: Int? = nil, episode: Int? = nil, meta: AddonMetaMeta, onStreamSelected: @escaping (streamio_addon_sdk.AddonStreamItem) -> Void) {
        self.type = type
        self.id = id
        self.season = season
        self.episode = episode
        self.meta = meta
        self.onStreamSelected = onStreamSelected
    }
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView()
            } else if streams.isEmpty {
                if noAddonsEnabled {
                    Text("No addons enabled")
                } else {
                    Text("No streams found")
                }
            } else {
                List(streams, id: \.uniqueId) { stream in
                    StreamItemView(stream: stream)
                        .onTapGesture {
                            onStreamSelected(stream)
                            dismiss()
                        }
                }
            }
        }
        .task {
            await loadStreams()
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
    
    private var initializingView: some View {
        VStack(spacing: 12) {
            ProgressView()
            Text("Initializing Addons...")
                .font(.headline)
        }
    }
    
    private var noAddonsView: some View {
        VStack(spacing: 12) {
            Image(systemName: "puzzlepiece.extension")
                .font(.system(size: 40))
                .foregroundColor(.secondary)
            Text("No Addons Enabled")
                .font(.headline)
            Text("Enable some addons to start streaming")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var streamList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(streams, id: \.uniqueId) { stream in
                    StreamItemView(stream: stream)
                }
            }
            .padding()
        }
    }
    
    private var emptyView: some View {
        VStack(spacing: 12) {
            Image(systemName: "play.slash")
                .font(.system(size: 40))
                .foregroundColor(.secondary)
            Text("No Streams Found")
                .font(.headline)
            Text("No available streams found from enabled addons")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func errorView(_ error: Error) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 40))
                .foregroundColor(.red)
            Text("Failed to load streams")
                .font(.headline)
            Text(error.localizedDescription)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func loadStreams() async {
        guard addonManager.isReady else {
            print("DEBUG: AddonManager not ready")
            return
        }
        
        isLoading = true
        defer { isLoading = false }
        
        var allStreams: [AddonStreamItem] = []
        let addonIds = addonManager.getAllActiveAddonIds()
        
        if addonIds.isEmpty {
            print("DEBUG: No enabled addons found")
            noAddonsEnabled = true
            return
        }
        
        noAddonsEnabled = false
        
        // Construct the dynamic ID based on content type
        let dynamicId: String
        if type == .series, let season = season, let episode = episode {
            dynamicId = "\(id):\(season):\(episode)"
        } else {
            dynamicId = id
        }
        
        print("DEBUG: Using dynamic ID: \(dynamicId)")
        
        for addonId in addonIds {
            
            let manifest = addonManager.getManifest(for: addonId)
            
            if let extractedManifest = manifest {
                if (!isAddonSupported(manifest: extractedManifest)) {
                    continue
                }
            }
            
            do {
                print("DEBUG: Fetching streams from addon: \(addonId)")
                let stream = try await addonManager.getStream(
                    from: addonId,
                    type: type.rawValue,
                    id: dynamicId
                )
                
                print("DEBUG: Found \(stream.streams.count) streams from \(addonId)")
                allStreams.append(contentsOf: stream.streams)
            } catch {
                print("DEBUG: Error loading streams from addon \(addonId): \(error.localizedDescription)")
                continue
            }
        }
        
        self.streams = allStreams
        print("DEBUG: Total streams found: \(allStreams.count)")
        
    }
    
    // Helper function to check if addon supports the content type
    private func isAddonSupported(manifest: AddonManifest) -> Bool {
        let resources = manifest.resources
        
        // Find stream resource
        for resource in resources {
            switch resource {
            case .simple:
                continue // Skip simple resources
            case .complex(let complexResource):
                // Check if it's a stream resource
                guard complexResource.name == "stream" else { continue }
                
                // Check content type support
                let supportsType = complexResource.types.contains(type.rawValue)
                
                // Check ID prefix support
                let supportsIdPrefix = complexResource.idPrefixes.contains(where: { id.hasPrefix($0) })
                
                if supportsType && supportsIdPrefix {
                    return true
                }
            }
        }
        
        return false
    }
}

struct StreamItemView: View {
    let stream: streamio_addon_sdk.AddonStreamItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header with stream type and quality
            HStack {
                streamTypeIcon
                Spacer()
                streamQuality
            }
            
            // Title and name
            if let title = stream.title {
                Text(title)
                    .font(.headline)
            }
            if let name = stream.name {
                Text(name)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            // Stream details
            streamDetails
            
            // Behavior hints
            if let behaviorHints = stream.behaviorHints {
                streamHints(behaviorHints)
            }
        }
        .padding()
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
    
    private var streamTypeIcon: some View {
        Group {
            if stream.ytId != nil {
                Label("YouTube", systemImage: "play.rectangle.fill")
                    .foregroundColor(.red)
            } else if stream.infoHash != nil {
                Label("Torrent", systemImage: "arrow.down.circle.fill")
                    .foregroundColor(.green)
            } else if stream.url != nil {
                Label("Direct", systemImage: "play.circle.fill")
                    .foregroundColor(.blue)
            }
        }
        .font(.headline)
    }
    
    private var streamQuality: some View {
        Text(stream.name?.contains("HD") == true ? "HD" : "SD")
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(stream.name?.contains("HD") == true ? Color.blue : Color.gray)
            .foregroundColor(.white)
            .clipShape(Capsule())
    }
    
    private var streamDetails: some View {
        VStack(alignment: .leading, spacing: 4) {
            if stream.url != nil {
                Text("Direct Stream")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
            
            if stream.infoHash != nil {
                HStack {
                    Text("Torrent")
                    if let fileIdx = stream.fileIdx {
                        Text("File: \(fileIdx)")
                    }
                }
                .font(.caption)
                .foregroundColor(.green)
            }
        }
    }
    
    private func streamHints(_ hints: AddonStreamBehaviorHints) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            if let notWebReady = hints.notWebReady, notWebReady {
                Label("Not Web Ready", systemImage: "exclamationmark.triangle")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if let bingeGroup = hints.bingeGroup {
                Label(bingeGroup, systemImage: "play.square.stack")
                    .font(.caption)
                    .foregroundColor(.purple)
            }
        }
    }
}

// Extension to create unique identifiers for streams
extension AddonStreamItem {
    var uniqueId: String {
        let components = [
            name ?? "",
            url ?? "",
            ytId ?? "",
            infoHash ?? "",
            String(fileIdx ?? 0)
        ]
        return components.joined(separator: "-")
    }
}
