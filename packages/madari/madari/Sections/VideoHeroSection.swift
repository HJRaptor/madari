//
//  VideoHeroSection.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//

import SwiftUI
import streamio_addon_sdk

struct VideoHeroSection: View {
    let meta: AddonMetaMeta
    let onPlay: () -> Void
    @Environment(\.horizontalSizeClass) private var sizeClass
    
    private var isCompact: Bool {
        sizeClass == .compact
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Background Image Container
            GeometryReader { geo in
                if let backgroundURL = isCompact ? meta.poster?.replacing("small", with: "medium") : meta.background {
                    AsyncImage(url: URL(string: backgroundURL)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: geo.size.width, height: geo.size.height)
                                .clipped()
                        case .empty, .failure:
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                        default:
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                        }
                    }
                }
            }
            
            // Gradient Overlay
            LinearGradient(
                gradient: Gradient(colors: [
                    .black.opacity(0.7),
                    .black.opacity(0.4),
                    .black.opacity(0.9)
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Content
            VStack(spacing: 0) {
                Spacer()
                
                if isCompact {
                    // Mobile Layout
                    VStack(spacing: 16) {
                        Text(meta.name)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.center)
                        
                        Button(action: onPlay) {
                            HStack {
                                Image(systemName: "play.fill")
                                Text("Play")
                            }
                            .padding(.horizontal, 32)
                            .padding(.vertical, 12)
                            .background(Color.white)
                            .foregroundColor(.black)
                            .clipShape(Capsule())
                        }
                        
                        if let description = meta.description {
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.white.opacity(0.9))
                                .lineLimit(3)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        
                        HStack(spacing: 16) {
                            if let releaseDate = meta.releaseInfo {
                                Text(releaseDate)
                            }
                            
                            if let runtime = meta.runtime {
                                Text("•")
                                Text(runtime)
                            }
                        }
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.bottom, 40)
                    .padding(.horizontal, 20)
                } else {
                    // Desktop Layout
                    VStack(alignment: .leading, spacing: 20) {
                        HStack {
                            Text(meta.name)
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button(action: onPlay) {
                                HStack {
                                    Image(systemName: "play.fill")
                                    Text("Play")
                                }
                                .padding(.horizontal, 24)
                                .padding(.vertical, 12)
                                .background(Color.white)
                                .foregroundColor(.black)
                                .clipShape(Capsule())
                            }
                        }
                        
                        if let description = meta.description {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.white.opacity(0.9))
                                .lineLimit(3)
                        }
                        
                        HStack(spacing: 16) {
                            if let releaseDate = meta.releaseInfo {
                                Text(releaseDate)
                            }
                            
                            if let runtime = meta.runtime {
                                Text("•")
                                Text(runtime)
                            }
                        }
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.horizontal, 40)
                    .padding(.bottom, 40)
                    .frame(maxWidth: 1200)
                }
            }
        }
        .frame(height: isCompact ? 500 : 700)
        .clipped() // Ensure content doesn't overflow
    }
}

// Keep the SizeClassModifier as is
struct SizeClassModifier: ViewModifier {
    @Binding var isCompact: Bool
    
    func body(content: Content) -> some View {
        GeometryReader { geo in
            content
                .onAppear {
                    isCompact = geo.size.width < 768
                }
                .onChange(of: geo.size.width) { oldValue, newValue in
                    isCompact = newValue < 768
                }
        }
    }
}
