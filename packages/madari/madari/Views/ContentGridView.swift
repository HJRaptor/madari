import SwiftUI
import Combine
import streamio_addon_sdk

// MARK: - CatalogKey
struct CatalogKey: Hashable, Codable {
    let catalogId: String
    let type: String
    let manifestId: String
    let orderIndex: Int
    
    var cacheKey: String {
        return "\(manifestId)_\(catalogId)_\(type)"
    }
}

// MARK: - CachedContent
struct CachedContent: Codable {
    let items: [AddonMetaMeta]
    let timestamp: Date
    
    static let cacheExpirationInterval: TimeInterval = 3600 // 1 hour
}

// MARK: - ViewConfig
struct ViewConfig {
    let itemsPerRow: Int
    let horizontalPadding: CGFloat
    let minWindowWidth: CGFloat?
}

// MARK: - ContentGridView
struct ContentGridView: View {
    @StateObject private var viewModel: ContentGridViewModel
    @StateObject private var manager = AddonManager.shared
    
    private var config: ViewConfig {
#if os(macOS)
        ViewConfig(itemsPerRow: 5, horizontalPadding: 0, minWindowWidth: 800)
#else
        ViewConfig(itemsPerRow: 4, horizontalPadding: 0, minWindowWidth: nil)
#endif
    }
    
    init(type: AddonMetaMetaType? = nil) {
        _viewModel = StateObject(wrappedValue: ContentGridViewModel(type: type))
    }
    
    private var mainTitle: String {
        if let type = viewModel.type {
            return type.rawValue
                .replacingOccurrences(of: ".", with: " ")
                .replacingOccurrences(of: "_", with: " ")
                .split(separator: " ")
                .map { $0.prefix(1).uppercased() + $0.dropFirst().lowercased() }
                .joined(separator: " ")
        }
        return "Home"
    }
    
    var body: some View {
        Group {
#if os(macOS)
            mainContentView
                .frame(minWidth: config.minWindowWidth ?? 0)
#else
            mainContentView
#endif
        }
        .onAppear {
            if manager.isReady {
                viewModel.loadInitialContent(manager)
            }
        }
        .onChange(of: manager.loadingState) { oldState, newState in
            if case .loaded = newState {
                viewModel.loadInitialContent(manager)
            }
        }
    }
    
    private var mainContentView: some View {
        ScrollView {
            MaxWidthContent {
                VStack(alignment: .leading, spacing: 16) {
                    titleView  // Add title view here
                    
                    LazyVStack(alignment: .leading, spacing: 24) {
                        // Loaded content
                        ForEach(viewModel.sortedCatalogKeys, id: \.self) { catalogKey in
                            if let items = viewModel.visibleContent[catalogKey] {
                                catalogRow(for: items, catalogKey: catalogKey)
                            }
                        }
                    }
                    .padding(.vertical)
                }
            }
        }
    }

    private var titleView: some View {
        Text(mainTitle)
            .font(.title)
            .fontWeight(.bold)
            .foregroundColor(.primary)
            .padding(.horizontal, 0)
            .padding(.top, 16)
    }
    
    private var navigationDestination: NavigationItem {
        if let type = viewModel.type {
            switch type {
            case .movie:
                return .movies
            case .series:
                return .series
            default:
                return .home
            }
        }
        return .home
    }
    
    private func catalogRow(for items: [AddonMetaMeta], catalogKey: CatalogKey) -> some View {
        CatalogRowView(
            items: items,
            catalogId: catalogKey.catalogId,
            itemsPerRow: config.itemsPerRow,
            horizontalPadding: config.horizontalPadding,
            onLoadMore: {
                viewModel.loadMoreForCatalog(catalogKey, manager: manager)
            }
        )
#if os(macOS)
        .contextMenu {
            Button("Refresh Catalog") {
                Task {
                    await viewModel.refreshCatalog(catalogKey, manager: manager)
                }
            }
        }
#endif
    }
}

// MARK: - ContentGridViewModel
@MainActor
class ContentGridViewModel: ObservableObject {
    @Published private(set) var visibleContent: [CatalogKey: [AddonMetaMeta]] = [:]
    @Published private(set) var loadingCatalogKeys: Set<CatalogKey> = []
    let type: AddonMetaMetaType?
    
    private var currentLoadingPages: [CatalogKey: Int] = [:]
    private var processedIds = Set<String>()
    private var catalogKeyOrder: [CatalogKey] = []
    
    var sortedCatalogKeys: [CatalogKey] {
        catalogKeyOrder.sorted { $0.orderIndex < $1.orderIndex }
    }
    
    init(type: AddonMetaMetaType? = nil) {
        self.type = type
    }
    
    func loadInitialContent(_ manager: AddonManager) {
        guard visibleContent.isEmpty else { return }
        Task {
            await loadContent(manager)
        }
    }
    
    private func loadContent(_ manager: AddonManager) async {
        guard manager.isReady,
              let manifests = manager.getActiveManifests(),
              !manifests.isEmpty else {
            return
        }
        
        var globalOrderIndex = 0
        catalogKeyOrder.removeAll()
        
        // Sequential loading of catalogs
        for manifest in manifests {
            let catalogsToLoad = if let type = type {
                manifest.catalogs.filter { $0.type == type.rawValue }
            } else {
                manifest.catalogs
            }
            
            for catalog in catalogsToLoad {
                let catalogKey = CatalogKey(
                    catalogId: catalog.id,
                    type: catalog.type,
                    manifestId: manifest.id,
                    orderIndex: globalOrderIndex
                )
                globalOrderIndex += 1
                
                catalogKeyOrder.append(catalogKey)
                loadingCatalogKeys.insert(catalogKey)
                
                // Load each catalog sequentially
                await loadContentForCatalog(catalogKey, manager: manager)
                loadingCatalogKeys.remove(catalogKey)
                
                // Add a small delay between catalog loads to prevent overwhelming the system
                try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 second delay
            }
        }
    }
    
    private func loadContentForCatalog(_ catalogKey: CatalogKey, manager: AddonManager) async {
        guard manager.isReady,
              let manifests = manager.getActiveManifests() else {
            return
        }
        
        let page = currentLoadingPages[catalogKey] ?? 0
        
        if let manifest = manifests.first(where: { $0.id == catalogKey.manifestId }),
           let catalog = manifest.catalogs.first(where: { $0.id == catalogKey.catalogId && $0.type == catalogKey.type }) {
            do {
                let extraParams: [String: String]?
                let validParams = Set((catalog.extraSupported ?? []) + (catalog.extraRequired ?? []))
                if validParams.contains(where: { $0.rawValue == "skip" }) {
                    extraParams = ["skip": String(page * 100)]
                } else {
                    extraParams = nil
                }
                
                let meta = try await manager.getCatalog(
                    from: manifest.id,
                    type: catalog.type,
                    id: catalog.id,
                    extra: extraParams
                )
                
                let newItems = meta.metas.filter { !processedIds.contains($0.id) }
                
                if !newItems.isEmpty {
                    processedIds.formUnion(newItems.map(\.id))
                    var currentItems = visibleContent[catalogKey] ?? []
                    currentItems.append(contentsOf: newItems)
                    visibleContent[catalogKey] = currentItems
                    currentLoadingPages[catalogKey] = page + 1
                }
            } catch {
                print("Error loading catalog \(catalog.id) from \(manifest.id): \(error)")
            }
        }
    }
    
    func loadMoreForCatalog(_ catalogKey: CatalogKey, manager: AddonManager) {
        Task {
            await loadContentForCatalog(catalogKey, manager: manager)
        }
    }
    
    func refreshCatalog(_ catalogKey: CatalogKey, manager: AddonManager) async {
        currentLoadingPages[catalogKey] = 0
        loadingCatalogKeys.insert(catalogKey)
        
        if let items = visibleContent[catalogKey] {
            processedIds.subtract(items.map(\.id))
        }
        
        visibleContent[catalogKey] = nil
        await loadContentForCatalog(catalogKey, manager: manager)
        loadingCatalogKeys.remove(catalogKey)
    }
}

// MARK: - Platform-specific modifiers
extension View {
    func platformSpecificHover() -> some View {
#if os(macOS)
        return self.onHover { isHovered in
            if isHovered {
                NSCursor.pointingHand.push()
            } else {
                NSCursor.pop()
            }
        }
#else
        return self
#endif
    }
}
