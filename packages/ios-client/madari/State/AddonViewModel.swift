@MainActor
final class AddonViewModel: ObservableObject {
    static let shared = AddonViewModel()
    
    private(set) var addonManager: AddonManager?
    @Published var isInitialized = false
    @Published var error: Error?
    
    private init() {}
    
    func initialize(containerIdentifier: String) async {
        do {
            addonManager = AddonManager(containerIdentifier: containerIdentifier)
            try await addonManager?.syncWithCloudKit()
            isInitialized = true
        } catch {
            self.error = error
        }
    }
    
    func getClient(for addon: AddonRecord) throws -> StremioAddonClient {
        try StremioAddonClient(transportURL: addon.transportURL)
    }
}
