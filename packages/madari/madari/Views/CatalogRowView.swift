//
//  CatalogRowView.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//

import SwiftUI
import streamio_addon_sdk

// MARK: - CatalogRowView
struct CatalogRowView: View {
    let items: [AddonMetaMeta]
    let catalogId: String
    let itemsPerRow: Int
    let horizontalPadding: CGFloat
    let onLoadMore: () -> Void
    
    @State private var currentPage = 0
    
    private func normalizeTitle(_ title: String) -> String {
        let withSpaces = title
            .replacingOccurrences(of: ".", with: " ")
            .replacingOccurrences(of: "_", with: " ")
        
        let words = withSpaces.split(separator: " ")
        return words
            .map { word in
                word.prefix(1).uppercased() + word.dropFirst().lowercased()
            }
            .joined(separator: " ")
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(normalizeTitle(catalogId))
                .font(.headline)
                .padding(.horizontal, horizontalPadding)
            
            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 10) {
                    ForEach(items, id: \.id) { meta in
                        ContentItemView(meta: meta)
                    }
                    
                    // Load more trigger view
                    Color.clear
                        .frame(width: 1)
                        .onAppear {
                            onLoadMore()
                        }
                }
                .padding(.horizontal, horizontalPadding)
            }
        }
    }
}

extension AddonMetaMetaType: @retroactive CaseIterable {
    public static var allCases: [AddonMetaMetaType] {
        [.movie, .series, .tv, .channel]
    }
}
