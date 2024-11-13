//
//  AddonLoadingView.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//

import SwiftUI

// MARK: - Loading View
struct AddonLoadingView: View {
    @StateObject private var manager = AddonManager.shared
    
    var body: some View {
        Group {
            switch manager.loadingState {
            case .notStarted:
                ProgressView("Preparing...")
                
            case .loading(let progress, let total):
                VStack {
                    ProgressView(value: progress) {
                        Text("Loading Addons...")
                    } currentValueLabel: {
                        Text("\(Int(progress * 100))% (\(Int(progress * Double(total)))/\(total))")
                    }
                    .progressViewStyle(.linear)
                    .padding()
                }
                
            case .loaded:
                Text("Loaded!")
                
            case .failed(let error):
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.red)
                    Text("Failed to load addons")
                        .font(.headline)
                    Text(error.localizedDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}
