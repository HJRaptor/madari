import SwiftUI
import Combine
import streamio_addon_sdk

struct SearchView: View {
    @StateObject private var viewModel: SearchViewModel
    @StateObject private var manager = AddonManager.shared
    @State private var searchText = ""
    @StateObject private var searchTextDebouncer = TextDebouncer()

    
    private var config: ViewConfig {
#if os(macOS)
        ViewConfig(itemsPerRow: 5, horizontalPadding: 24, minWindowWidth: 800)
#else
        ViewConfig(itemsPerRow: 4, horizontalPadding: 0, minWindowWidth: nil)
#endif
    }
    
    init() {
        _viewModel = StateObject(wrappedValue: SearchViewModel())
    }
    var body: some View {
        VStack(spacing: 0) {
            searchBar
            
            Divider()
            
            if searchText.isEmpty {
                emptyStateView
            } else {
                resultsView
            }
        }
        .onReceive(searchTextDebouncer.$debouncedText) { debouncedText in
            Task {
                await viewModel.performSearch(query: debouncedText, manager: manager)
            }
        }
    }

    
    private var searchBar: some View {
        HStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                    .font(.system(size: 16))
                
                TextField("Search movies and shows...", text: $searchText)
                    .textFieldStyle(.plain)
                    .font(.system(size: 16))
                    .onChange(of: searchText) { _, newValue in
                        searchTextDebouncer.text = newValue
                    }
                
                if !searchText.isEmpty {
                    Button(action: {
                        searchText = ""
                        searchTextDebouncer.text = ""
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                            .font(.system(size: 16))
                    }
                }
            }
            .padding(10)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
            
            // Add Cancel button
            if !searchText.isEmpty {
                Button(action: {
                    withAnimation {
                        searchText = ""
                        searchTextDebouncer.text = ""
                    }
                }) {
                    Text("Cancel")
                        .foregroundColor(.accentColor)
                }
                .transition(.move(edge: .trailing).combined(with: .opacity))
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .animation(.easeInOut(duration: 0.2), value: searchText)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.gray.opacity(0.5))
            
            VStack(spacing: 8) {
                Text("Find Your Entertainment")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Search for movies, TV shows, and more")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        #if os(iOS)
        .background(Color(UIColor.systemBackground))
        #endif
    }
    
    private var resultsView: some View {
        ScrollView {
            if viewModel.isLoading {
                ProgressView()
                    .padding()
            } else if viewModel.searchResults.isEmpty {
                Text("No results found")
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                MaxWidthContent {
                    LazyVStack(alignment: .leading, spacing: 24) {
                        CatalogRowView(
                            items: viewModel.searchResults,
                            catalogId: "search",
                            itemsPerRow: config.itemsPerRow,
                            horizontalPadding: config.horizontalPadding,
                            onLoadMore: {}
                        )
                    }
                    .padding(.vertical)
                }
            }
        }
    }
}

@MainActor
class SearchViewModel: ObservableObject {
    @Published private(set) var searchResults: [AddonMetaMeta] = []
    @Published private(set) var isLoading = false
    
    private var searchTask: Task<Void, Never>?
    
    func performSearch(query: String, manager: AddonManager) async {
        // Cancel any existing search
        searchTask?.cancel()
        
        guard !query.isEmpty else {
            searchResults = []
            return
        }
        
        searchTask = Task {
            isLoading = true
            defer { isLoading = false }
            
            var allResults: [AddonMetaMeta] = []
            
            guard let manifests = manager.getActiveManifests() else { return }
            
            for manifest in manifests {
                for catalog in manifest.catalogs {
                    do {
                        let results = try await manager.getCatalog(
                            from: manifest.id,
                            type: catalog.type,
                            id: catalog.id,
                            extra: ["search": query]
                        )
                        allResults.append(contentsOf: results.metas)
                        
                        if Task.isCancelled { return }
                        
                        // Update results as they come in
                        await MainActor.run {
                            self.searchResults = allResults
                        }
                    } catch {
                        print("Search error for manifest \(manifest.id), catalog \(catalog.id): \(error)")
                    }
                }
            }
        }
        
        await searchTask?.value
    }
}

#Preview {
    SearchView()
}

@MainActor
class TextDebouncer: ObservableObject {
    @Published var text: String = ""
    @Published var debouncedText: String = ""
    private var debounceTask: Task<Void, Never>?
    
    init(delay: TimeInterval = 0.5) {  // 500ms delay
        // Watch for text changes and debounce them
        Task {
            for await newValue in $text.values {
                debounceTask?.cancel()
                debounceTask = Task {
                    try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                    if !Task.isCancelled {
                        self.debouncedText = newValue
                    }
                }
            }
        }
    }
}
