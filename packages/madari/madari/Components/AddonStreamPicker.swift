//
//  AddonStreamPicker.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//
import SwiftUI

struct AddonStreamPicker: View {
    @StateObject private var addonManager = AddonManager.shared
    @Binding var selectedAddonIds: Set<String>
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack {
                Button("All") {
                    if let manifests = addonManager.getActiveManifests() {
                        selectedAddonIds = Set(manifests.map { $0.id })
                    }
                }
                .buttonStyle(.bordered)
                
                ForEach(addonManager.getActiveManifests() ?? [], id: \.id) { manifest in
                    Button(manifest.name) {
                        if selectedAddonIds.contains(manifest.id) {
                            selectedAddonIds.remove(manifest.id)
                        } else {
                            selectedAddonIds.insert(manifest.id)
                        }
                    }
                    .buttonStyle(.bordered)
                    .tint(selectedAddonIds.contains(manifest.id) ? .accentColor : .gray)
                }
            }
            .padding(.horizontal)
        }
    }
}
