import Foundation
import streamio_addon_sdk
import SwiftData
import Combine
import SwiftUI

// MARK: - Manager
@MainActor
final class AddonManager: ObservableObject {
    // MARK: - Published Properties
    @Published private(set) var loadingState: AddonLoadingState = .notStarted
    @Published private(set) var activeManifests: [AddonManifest] = []

    // MARK: - Singleton
    static let shared = AddonManager()

    // MARK: - Properties
    private var modelContainer: ModelContainer
    private let queue = DispatchQueue(label: "com.addonmanager.queue", attributes: .concurrent)

    /// Dictionary to store active StremioService instances and their manifests, sorted by order
    private var activeAddons: [String: (service: StremioService, manifest: AddonManifest)] = [:] {
        didSet {
            // Get the stored addon URLs with their order
            if let storedURLs = try? modelContainer.mainContext.fetch(FetchDescriptor<StoredAddonURL>()) {
                // Create a dictionary of URL to order
                let orderMap = Dictionary(uniqueKeysWithValues: storedURLs.map { ($0.url, $0.order) })

                // Sort manifests by order when updating activeAddons
                activeManifests = Array(activeAddons)
                    .sorted { first, second in
                        let order1 = orderMap[first.key] ?? 0
                        let order2 = orderMap[second.key] ?? 0
                        return order1 < order2
                    }
                    .map { $0.value.manifest }
            }
        }
    }

    /// Group for tracking initialization of addons
    private let initializationGroup = DispatchGroup()

    // MARK: - Initialization
    private init() {
        do {
            let schema = Schema([StoredAddonURL.self])
            let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            self.modelContainer = try ModelContainer(for: schema, configurations: [modelConfiguration])
            Task {
                await initializeStoredAddons()
            }
        } catch {
            self.modelContainer = try! ModelContainer(for: StoredAddonURL.self)
            loadingState = .failed(error)
        }
    }

    // MARK: - Public Methods

    /// Check if manager is ready
    var isReady: Bool {
        if case .loaded = loadingState {
            return true
        }
        return false
    }

    /// Helper method to find addon by URL or ID
    private func findAddon(urlOrId: String) -> (service: StremioService, manifest: AddonManifest)? {
        // First try direct URL lookup
        if let addon = activeAddons[urlOrId] {
            return addon
        }

        // If not found, try finding by ID
        return activeAddons.values.first { $0.manifest.id == urlOrId }
    }

    func getAllActiveAddonIds() -> [String] {
        return activeManifests.map { $0.id }
    }

    /// Add a new addon by URL (URL only, not ID)
    /// - Parameters:
    ///   - url: Base URL of the Stremio addon manifest
    /// - Returns: The manifest of the added addon
    func addAddon(url: String) async throws -> AddonManifest {
        let processedURL = url.hasSuffix("/manifest.json")
            ? String(url.dropLast("/manifest.json".count))
            : url

        let descriptor = FetchDescriptor<StoredAddonURL>(
            predicate: #Predicate<StoredAddonURL> { addon in
                addon.url == processedURL
            }
        )

        let existingAddons = try modelContainer.mainContext.fetch(descriptor)
        guard existingAddons.isEmpty else {
            throw AddonManagerError.addonAlreadyExists
        }

        // Get the current highest order
        let allAddons = try getStoredAddonURLs()
        let nextOrder = (allAddons.map { $0.order }.max() ?? -1) + 1

        let service = StremioService(baseURL: url)

        let manifest = try await withCheckedThrowingContinuation { continuation in
            service.getManifest { result in
                switch result {
                case .success(let manifest):
                    continuation.resume(returning: manifest)
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
        }

        let storedURL = StoredAddonURL(url: url, order: nextOrder)
        modelContainer.mainContext.insert(storedURL)
        try modelContainer.mainContext.save()

        activeAddons[url] = (service: service, manifest: manifest)
        await refreshActiveManifests()

        return manifest
    }

    /// Remove an addon by URL
    /// - Parameter url: Base URL of the Stremio addon to remove
    func removeAddon(url: String) async throws {
        let descriptor = FetchDescriptor<StoredAddonURL>(
            predicate: #Predicate<StoredAddonURL> { addon in
                addon.url == url
            }
        )

        let addonsToRemove = try modelContainer.mainContext.fetch(descriptor)
        for addon in addonsToRemove {
            modelContainer.mainContext.delete(addon)
        }
        try modelContainer.mainContext.save()

        activeAddons.removeValue(forKey: url)
        await refreshActiveManifests()
    }

    func refreshActiveManifests() async {
        do {
            let descriptor = FetchDescriptor<StoredAddonURL>(
                sortBy: [SortDescriptor(\.order)]
            )

            let storedURLs = try modelContainer.mainContext.fetch(descriptor)
            let activeURLs = storedURLs.filter { $0.isActive }

            var newActiveAddons: [String: (service: StremioService, manifest: AddonManifest)] = [:]

            for storedURL in activeURLs {
                if let existing = activeAddons[storedURL.url] {
                    newActiveAddons[storedURL.url] = existing
                } else if await initializeAddon(for: storedURL.url) {
                    if let addon = activeAddons[storedURL.url] {
                        newActiveAddons[storedURL.url] = addon
                    }
                }
            }

            activeAddons = newActiveAddons
        } catch {
            print("Error refreshing manifests: \(error)")
        }
    }

    /// Get all stored addon URLs
    /// - Returns: Array of StoredAddonURL objects
    func getStoredAddonURLs() throws -> [StoredAddonURL] {
        let descriptor = FetchDescriptor<StoredAddonURL>()
        return try modelContainer.mainContext.fetch(descriptor)
    }

    /// Get all active addon manifests
    /// - Returns: Array of AddonManifest objects
    func getActiveManifests() -> [AddonManifest]? {
        return activeManifests
    }

    /// Toggle addon active state
    /// - Parameter url: Addon URL to toggle
    func toggleAddonState(url: String) async throws {
        let descriptor = FetchDescriptor<StoredAddonURL>(
            predicate: #Predicate<StoredAddonURL> { addon in
                addon.url == url
            }
        )

        if let addon = try modelContainer.mainContext.fetch(descriptor).first {
            addon.isActive.toggle()
            try modelContainer.mainContext.save()

            if addon.isActive {
                if await initializeAddon(for: url) {
                    await refreshActiveManifests()
                }
            } else {
                activeAddons.removeValue(forKey: url)
                await refreshActiveManifests()
            }
        }
    }

    /// Get metadata for specific type and ID from an addon
    /// - Parameters:
    ///   - urlOrId: Addon URL or ID
    ///   - type: Content type
    ///   - id: Content ID
    func getMeta(from urlOrId: String, type: String, id: String) async throws -> AddonMetaSolo {
        guard let addon = findAddon(urlOrId: urlOrId) else {
            throw StremioServiceError.manifestNotLoaded
        }

        return try await withCheckedThrowingContinuation { continuation in
            addon.service.getMeta(type: type, id: id) { result in
                switch result {
                case .success(let meta):
                    continuation.resume(returning: meta)
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    /// Get manifest for a specific addon ID
    /// - Parameter id: The ID of the addon
    /// - Returns: AddonManifest if found, nil otherwise
    func getManifest(for id: String) -> AddonManifest? {
        return activeManifests.first { $0.id == id }
    }

    /// Get streams for specific type and ID from an addon
    /// - Parameters:
    ///   - urlOrId: Addon URL or ID
    ///   - type: Content type
    ///   - id: Content ID
    func getStream(from urlOrId: String, type: String, id: String) async throws -> AddonStream {
        guard let addon = findAddon(urlOrId: urlOrId) else {
            throw StremioServiceError.manifestNotLoaded
        }

        return try await withCheckedThrowingContinuation { continuation in
            addon.service.getStream(type: type, id: id) { result in
                switch result {
                case .success(let stream):
                    continuation.resume(returning: stream)
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    /// Get catalog items from an addon
    /// - Parameters:
    ///   - urlOrId: Addon URL or ID
    ///   - type: Catalog type
    ///   - id: Catalog ID
    ///   - extra: Optional extra parameters
    func getCatalog(from urlOrId: String, type: String, id: String, extra: [String: String]? = nil) async throws -> AddonMeta {
        guard let addon = findAddon(urlOrId: urlOrId) else {
            throw StremioServiceError.manifestNotLoaded
        }

        return try await withCheckedThrowingContinuation { continuation in
            addon.service.getCatalog(type: type, id: id, extra: extra) { result in
                switch result {
                case .success(let meta):
                    continuation.resume(returning: meta)
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    /// Reorder an addon to a new position
    /// - Parameters:
    ///   - fromIndex: Current index of the addon
    ///   - toIndex: New index for the addon
    func reorderAddons(fromIndex: Int, toIndex: Int) async throws {
        let descriptor = FetchDescriptor<StoredAddonURL>(
            sortBy: [SortDescriptor(\.order)]
        )

        var addons = try modelContainer.mainContext.fetch(descriptor)

        // Perform the reorder
        let addon = addons.remove(at: fromIndex)
        addons.insert(addon, at: toIndex)

        // Update order values
        for (index, addon) in addons.enumerated() {
            addon.order = index
        }

        // Save changes
        try modelContainer.mainContext.save()

        // Refresh manifests to reflect new order
        await refreshActiveManifests()
    }


    /// Move addon up in the list
    /// - Parameter url: URL of the addon to move
    func moveAddonUp(_ url: String) async throws {
        let descriptor = FetchDescriptor<StoredAddonURL>(
            sortBy: [SortDescriptor(\.order)]
        )

        let addons = try modelContainer.mainContext.fetch(descriptor)
        guard let currentIndex = addons.firstIndex(where: { $0.url == url }),
              currentIndex > 0 else {
            return
        }

        try await reorderAddons(fromIndex: currentIndex, toIndex: currentIndex - 1)
    }

    /// Move addon down in the list
    /// - Parameter url: URL of the addon to move
    func moveAddonDown(_ url: String) async throws {
        let descriptor = FetchDescriptor<StoredAddonURL>(
            sortBy: [SortDescriptor(\.order)]
        )

        let addons = try modelContainer.mainContext.fetch(descriptor)
        guard let currentIndex = addons.firstIndex(where: { $0.url == url }),
              currentIndex < addons.count - 1 else {
            return
        }

        try await reorderAddons(fromIndex: currentIndex, toIndex: currentIndex + 1)
    }

    // MARK: - Private Methods

    private func initializeStoredAddons() async {
        do {
            loadingState = .loading(progress: 0, total: 0)

            let storedURLs = try getStoredAddonURLs()
            let activeURLs = storedURLs.filter { $0.isActive }

            // Even if there are no active URLs, we should still transition to loaded state
            if activeURLs.isEmpty {
                loadingState = .loaded
                return
            }

            var loadedCount = 0
            let totalCount = activeURLs.count

            for storedURL in activeURLs {
                if await initializeAddon(for: storedURL.url) {
                    loadedCount += 1
                }
                updateLoadingProgress(loaded: loadedCount, total: totalCount)
            }

            await refreshActiveManifests()

            // Ensure we transition to loaded state regardless of whether any addons were successfully loaded
            loadingState = .loaded

        } catch {
            loadingState = .failed(error)
        }
    }

    private func updateLoadingProgress(loaded: Int, total: Int) {
        guard total > 0 else {
            loadingState = .loading(progress: 1.0, total: 0)
            return
        }
        let progress = Double(loaded) / Double(total)
        loadingState = .loading(progress: progress, total: total)
    }


    private func initializeAddon(for url: String) async -> Bool {
        let service = StremioService(baseURL: url)

        do {
            let manifest = try await withCheckedThrowingContinuation { continuation in
                service.getManifest { result in
                    switch result {
                    case .success(let manifest):
                        continuation.resume(returning: manifest)
                    case .failure(let error):
                        continuation.resume(throwing: error)
                    }
                }
            }

            activeAddons[url] = (service: service, manifest: manifest)

            return true
        } catch {
            print("Error loading manifest for \(url): \(error)")
            return false
        }
    }
}
