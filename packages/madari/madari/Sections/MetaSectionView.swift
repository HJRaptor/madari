//
//  MetaSectionView.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//


import SwiftUI
import streamio_addon_sdk

struct MetaSectionView: View {
    let meta: AddonMetaMeta
    
    private var castLinks: [AddonMetaLink] {
        meta.links?.filter { $0.category == "Cast" } ?? []
    }
    
    private var crewLinks: [AddonMetaLink] {
        meta.links?.filter { $0.category == "Writers" || $0.category == "Directors" } ?? []
    }
    
    private var genreLinks: [AddonMetaLink] {
        meta.links?.filter { $0.category == "Genres" } ?? []
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 32) {
            // Cast Section
            if !castLinks.isEmpty {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Cast")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.horizontal, 20)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        LazyHStack(spacing: 24) {
                            ForEach(castLinks, id: \.url) { link in
                                VStack(alignment: .center, spacing: 12) {
                                    Circle()
                                        .fill(Color.gray.opacity(0.2))
                                        .frame(width: 100, height: 100)
                                        .overlay(
                                            Image(systemName: "person.fill")
                                                .resizable()
                                                .scaledToFit()
                                                .foregroundColor(.gray)
                                                .padding(25)
                                        )
                                    
                                    Text(link.name)
                                        .font(.callout)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                        .frame(width: 100)
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
            }
            
            // Crew Section
            if !crewLinks.isEmpty {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Crew")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.horizontal, 20)
                    
                    LazyVStack(alignment: .leading, spacing: 16) {
                        ForEach(crewLinks, id: \.url) { link in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(link.category)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                                Text(link.name)
                                    .font(.body)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
            
            // Genres Section
            if !genreLinks.isEmpty {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Genres")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.horizontal, 20)
                    
                    FlowLayout(spacing: 12) {
                        ForEach(genreLinks, id: \.url) { link in
                            Text(link.name)
                                .font(.callout)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.blue.opacity(0.1))
                                .foregroundColor(.blue)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
        .padding(.vertical, 24)
    }
}

// Helper view for flowing layout
struct FlowLayout: Layout {
    let spacing: CGFloat
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.width ?? 0,
            spacing: spacing,
            subviews: subviews
        )
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            spacing: spacing,
            subviews: subviews
        )
        
        for (index, subview) in subviews.enumerated() {
            subview.place(
                at: CGPoint(
                    x: bounds.minX + result.positions[index].x,
                    y: bounds.minY + result.positions[index].y
                ),
                proposal: ProposedViewSize(result.sizes[index])
            )
        }
    }
    
    struct FlowResult {
        var sizes: [CGSize]
        var positions: [CGPoint]
        var size: CGSize
        
        init(in width: CGFloat, spacing: CGFloat, subviews: Subviews) {
            var sizes = [CGSize]()
            var positions = [CGPoint]()
            
            var x: CGFloat = 0
            var y: CGFloat = 0
            var rowHeight: CGFloat = 0
            var rowMaxY: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(
                    ProposedViewSize(width: width, height: nil)
                )
                
                if x + size.width > width, x > 0 {
                    x = 0
                    y = rowMaxY + spacing
                }
                
                positions.append(CGPoint(x: x, y: y))
                sizes.append(size)
                
                rowHeight = max(rowHeight, size.height)
                rowMaxY = y + rowHeight
                x += size.width + spacing
            }
            
            self.sizes = sizes
            self.positions = positions
            self.size = CGSize(width: width, height: rowMaxY)
        }
    }
}