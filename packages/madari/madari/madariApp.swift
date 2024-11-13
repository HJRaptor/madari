import SwiftUI
import SwiftData
import streamio_addon_sdk
import vlc_swiftui

@main
struct StremioApp: App {
    let modelContainer: ModelContainer
    
    init() {
        do {
            let schema = Schema([StoredAddonURL.self])
            let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            self.modelContainer = try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not initialize ModelContainer: \(error)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(modelContainer)
    }
}
