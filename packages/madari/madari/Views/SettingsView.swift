import SwiftUI
import streamio_addon_sdk
import SwiftData

enum SettingsSection: Hashable {
    case general, player, addons, help
    
    var title: String {
        switch self {
        case .general: return "General"
        case .player: return "Player"
        case .addons: return "Addons"
        case .help: return "Help"
        }
    }
    
    var icon: String {
        switch self {
        case .general: return "gearshape"
        case .player: return "play.circle"
        case .addons: return "puzzlepiece.fill"
        case .help: return "questionmark.circle"
        }
    }
}

// MARK: - Views
struct SettingsListView: View {
    @Binding var selection: SettingsSection?
    
    var body: some View {
        List(selection: $selection) {
            ForEach([SettingsSection.general, .player, .addons, .help], id: \.self) { section in
                Label(section.title, systemImage: section.icon)
                    .tag(section)
            }
        }
        #if os(iOS)
        .navigationTitle("Settings")
        #endif
    }
}

struct SettingsDetailView: View {
    let section: SettingsSection
    
    var body: some View {
        Group {
            switch section {
            case .general:
                GeneralSettingsView()
            case .player:
                PlayerSettingsView()
            case .addons:
                AddonsSettingsView()
            case .help:
                HelpSettingsView()
            }
        }
        #if os(macOS)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding()
        #else
        .navigationTitle(section.title)
        #endif
    }
}

struct EmptyStateView: View {
    var body: some View {
        Text("Select a category")
            .font(.title2)
            .foregroundColor(.secondary)
    }
}

struct GeneralSettingsView: View {
    @StateObject private var settings = SettingsStorage.shared
    
    var body: some View {
        Form {
            Picker("Language", selection: $settings.selectedLanguage) {
                ForEach(Language.allCases, id: \.self) { language in
                    Text(language.rawValue).tag(language)
                }
            }
        }
        #if os(macOS)
        .formStyle(.grouped)
        #endif
    }
}

struct PlayerSettingsView: View {
    @StateObject private var settings = SettingsStorage.shared
    
    var body: some View {
        Form {
            Picker("Subtitle Language", selection: $settings.subtitleLanguage) {
                ForEach(Language.allCases, id: \.self) { language in
                    Text(language.rawValue).tag(language)
                }
            }
            
            Picker("Audio Language", selection: $settings.audioLanguage) {
                ForEach(Language.allCases, id: \.self) { language in
                    Text(language.rawValue).tag(language)
                }
            }
        }
        #if os(macOS)
        .formStyle(.grouped)
        #endif
    }
}

struct AddAddonView: View {
    @Binding var showingAddSheet: Bool
    @StateObject private var manager = AddonManager.shared
    @State private var url = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    var body: some View {
        Group {
            #if os(iOS)
            NavigationView {
                Form {
                    Section {
                        TextField("Addon Manifest URL", text: $url)
                            .textContentType(.URL)
                            .autocapitalization(.none)
                            .disabled(isLoading)
                    }
                    
                    Section {
                        Text("Enter the URL of a Stremio addon manifest (usually ends with manifest.json)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .navigationTitle("Add Addon")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { showingAddSheet = false }
                            .disabled(isLoading)
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Add") {
                            addAddon()
                        }
                        .disabled(url.isEmpty || isLoading)
                    }
                }
                .overlay {
                    if isLoading {
                        ProgressView()
                    }
                }
            }
            #else
            VStack(alignment: .leading, spacing: 16) {
                Text("Add Addon")
                    .font(.headline)
                
                TextField("Addon Manifest URL:", text: $url)
                    .textFieldStyle(.roundedBorder)
                    .disabled(isLoading)
                
                Text("Enter the URL of a Stremio addon manifest (usually ends with manifest.json)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                HStack {
                    Spacer()
                    Button("Cancel") {
                        showingAddSheet = false
                    }
                    .disabled(isLoading)
                    
                    Button("Add") {
                        addAddon()
                    }
                    .disabled(url.isEmpty || isLoading)
                    .keyboardShortcut(.defaultAction)
                }
                
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                }
            }
            .padding()
            .frame(width: 400)
            #endif
        }
        .alert(
            "Error",
            isPresented: $showError,
            actions: {
                Button("OK", role: .cancel) {
                    showError = false
                }
            },
            message: {
                Text(errorMessage)
            }
        )
    }
    
    private func addAddon() {
        isLoading = true
        
        Task {
            do {
                _ = try await manager.addAddon(url: url)
                await MainActor.run {
                    isLoading = false
                    showingAddSheet = false
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}

struct HelpSettingsView: View {
    var body: some View {
        Form {
            Link(destination: URL(string: "https://example.com/help")!) {
                Text("Visit Help Center")
            }
        }
        #if os(macOS)
        .formStyle(.grouped)
        #endif
    }
}

// At the end of your previous code, replace the Preview with:

#if DEBUG
struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}
#endif

struct SettingsView: View {
    @State private var selectedSection: SettingsSection? = nil

    private var titleView: some View {
        Text("Settings")
            .font(.title)
            .fontWeight(.bold)
            .foregroundColor(.primary)
            .padding(.horizontal, 0)
            .padding(.top, 16)
    }
    
    var body: some View {
        #if os(macOS)
        HSplitView {
            List(selection: $selectedSection) {
                ForEach([SettingsSection.general, .player, .addons, .help], id: \.self) { section in
                    Label(section.title, systemImage: section.icon)
                        .tag(section)
                }
            }
            .listStyle(.sidebar)
            .frame(minWidth: 200, maxWidth: 250)
            
            if let section = selectedSection {
                SettingsDetailView(section: section)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                Text("Select a category")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .navigationTitle("Settings")
        #else
        NavigationStack {
            titleView
            List {
                ForEach([SettingsSection.general, .player, .addons, .help], id: \.self) { section in
                    NavigationLink {
                        SettingsDetailView(section: section)
                    } label: {
                        Label(section.title, systemImage: section.icon)
                    }
                }
            }
            .navigationTitle("Settings")
        }
        .navigationTitle("Settings")
        #endif
    }
}
