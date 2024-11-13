import SwiftUI
import StreamioAddonSDK

class AddonViewModel: ObservableObject {
    static let shared = AddonViewModel()
    
    @Published private(set) var addons: [AddonRecord] = []
    @Published private(set) var isInitialized = false
    var addonManager: AddonManager?
    private var clients: [String: StremioAddonClient] = [:]
    
    private init() {
        setupAddonManager()
    }
    
    private func setupAddonManager() {
        do {
            addonManager = try AddonManager(containerIdentifier: "iCloud.com.madari.app")
            Task {
                await loadAddons()
                if self.addons.isEmpty {
                    try? await addDefaultCinemeta()
                }
                await MainActor.run {
                    self.isInitialized = true
                }
            }
        } catch {
            print("Failed to initialize AddonManager: \(error)")
        }
    }
    
    private func addDefaultCinemeta() async throws {
        guard let manager = addonManager else { return }
        _ = try await manager.addAddon(transportURL: "https://v3-cinemeta.strem.io")
        await loadAddons()
    }
    
    func getClient(for addon: AddonRecord) throws -> StremioAddonClient {
        if let existingClient = clients[addon.id] {
            return existingClient
        }
        
        let client = try StremioAddonClient(transportURL: addon.transportURL)
        clients[addon.id] = client
        return client
    }
    
    @MainActor
    func loadAddons() async {
        guard let manager = addonManager else { return }
        do {
            addons = await manager.getAllAddons()
        } catch {
            print("Failed to load addons: \(error)")
        }
    }
    
    func isEnabled(_ addon: AddonRecord) -> Bool {
        addon.isEnabled
    }
    
    @MainActor
    func setEnabled(_ addon: AddonRecord, isEnabled: Bool) async {
        guard let manager = addonManager else { return }
        do {
            try await manager.setAddonEnabled(addon.id, enabled: isEnabled)
            await loadAddons() // Reload to refresh the state
        } catch {
            print("Failed to update addon state: \(error)")
        }
    }
} 
