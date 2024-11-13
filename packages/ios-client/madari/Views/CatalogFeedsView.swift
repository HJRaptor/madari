import SwiftUI
import StreamioAddonSDK

struct CatalogFeedsView: View {
    let type: ContentType
    @State private var catalogs: [CatalogWithFeeds] = []
    @State private var isLoading = true
    @State private var error: Error?
    
    // AddonManager instance should be passed from parent
    let addonManager: AddonManager
    
    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 24) {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = error {
                    ErrorView(error: error)
                } else {
                    ForEach(catalogs, id: \.catalogId) { catalog in
                        VStack(alignment: .leading, spacing: 16) {
                            Text("\(catalog.addonName) - \(catalog.catalogId)")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                LazyHStack(spacing: 16) {
                                    ForEach(catalog.items, id: \.id) { item in
                                        VideoCard(meta: item)
                                            .frame(width: 200)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
            }
        }
        .task {
            await loadCatalogs()
        }
    }
    
    private func loadCatalogs() async {
        do {
            // Create AsyncStream from AddonManager
            let stream = addonManager.catalogsWithFeeds(type: type)
            
            // Reset state
            catalogs = []
            isLoading = true
            error = nil
            
            // Process the stream
            for await catalog in stream {
                // Append new catalogs to our array
                catalogs.append(catalog)
            }
            
            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
    }
}

// Error View Component
struct ErrorView: View {
    let error: Error
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.red)
            
            Text("Error loading catalogs")
                .font(.headline)
            
            Text(error.localizedDescription)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity)
    }
}

// Preview Provider
struct CatalogFeedsView_Previews: PreviewProvider {
    static var previews: some View {
        // Create a mock AddonManager for preview
        let mockAddonManager = try! AddonManager(containerIdentifier: "preview.container")
        
        CatalogFeedsView(type: .movie, addonManager: mockAddonManager)
            .previewDisplayName("Movies Catalog")
        
        CatalogFeedsView(type: .series, addonManager: mockAddonManager)
            .previewDisplayName("Series Catalog")
    }
}