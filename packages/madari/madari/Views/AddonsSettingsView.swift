import SwiftUI
import streamio_addon_sdk
import SwiftData

struct AddonsSettingsView: View {
    @StateObject private var manager = AddonManager.shared
    @StateObject private var settings = SettingsStorage.shared
    @Query(sort: \StoredAddonURL.order) private var storedAddons: [StoredAddonURL]
    @State private var showingAddSheet = false
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var draggedManifest: AddonManifest?
    
    var body: some View {
        Form {
            Section("Active Addons") {
                if let manifests = manager.getActiveManifests(), !manifests.isEmpty {
                    #if os(iOS)
                    ForEach(manifests, id: \.id) { manifest in
                        AddonRow(manifest: manifest)
                            .contextMenu {
                                removeButton(for: manifest)
                            }
                            .swipeActions(edge: .trailing) {
                                removeButton(for: manifest)
                            }
                    }
                    .onMove { indices, destination in
                        Task {
                            do {
                                try await manager.reorderAddons(
                                    fromIndex: indices.first!,
                                    toIndex: destination
                                )
                            } catch {
                                errorMessage = error.localizedDescription
                                showError = true
                            }
                        }
                    }
                    #else
                    ForEach(manifests, id: \.id) { manifest in
                        AddonRow(manifest: manifest)
                            .contextMenu {
                                removeButton(for: manifest)
                            }
                            .draggable(manifest.id) {
                                AddonRow(manifest: manifest)
                                    .opacity(0.7)
                            }
                            .dropDestination(for: String.self) { items, location in
                                guard let droppedId = items.first,
                                      let fromIndex = manifests.firstIndex(where: { $0.id == droppedId }),
                                      let toIndex = manifests.firstIndex(where: { $0.id == manifest.id })
                                else { return false }
                                
                                Task {
                                    do {
                                        try await manager.reorderAddons(
                                            fromIndex: fromIndex,
                                            toIndex: toIndex
                                        )
                                    } catch {
                                        errorMessage = error.localizedDescription
                                        showError = true
                                    }
                                }
                                return true
                            }
                    }
                    #endif
                } else {
                    Text("No addons installed")
                        .foregroundColor(.secondary)
                }
            }
            
            Section {
                Button(action: { showingAddSheet = true }) {
                    Label("Add Addon", systemImage: "plus")
                }
            }
        }
        #if os(macOS)
        .formStyle(.grouped)
        #endif
        .sheet(isPresented: $showingAddSheet) {
            AddAddonView(showingAddSheet: $showingAddSheet)
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
        .onChange(of: storedAddons) { oldValue, newValue in
            Task {
                await manager.refreshActiveManifests()
            }
        }
        #if os(iOS)
        .environment(\.editMode, .constant(.active))
        #endif
    }
    
    private func removeButton(for manifest: AddonManifest) -> some View {
        Button(role: .destructive) {
            Task {
                do {
                    try await manager.removeAddon(url: manifest.id)
                } catch {
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        } label: {
            Label("Remove", systemImage: "trash")
        }
    }
}

// Separate view for addon row to keep code organized
struct AddonRow: View {
    let manifest: AddonManifest
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "line.3.horizontal")
                    .foregroundColor(.secondary)
                    .padding(.trailing, 4)
                
                Text(manifest.name)
                    .font(.headline)
                Spacer()
                Text(manifest.version)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(manifest.description)
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack {
                ForEach(manifest.types, id: \.self) { type in
                    Text(type)
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.secondary.opacity(0.2))
                        .cornerRadius(4)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
