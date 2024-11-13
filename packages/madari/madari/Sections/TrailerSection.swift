//
//  TrailerSection.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//


import SwiftUI
import streamio_addon_sdk

struct TrailerSection: View {
    let videos: [streamio_addon_sdk.Video]
    let onPlayTrailer: (streamio_addon_sdk.Video) -> Void
    
    private var trailers: [streamio_addon_sdk.Video] {
        videos
    }
    
    var body: some View {
        if !trailers.isEmpty {
            VStack(alignment: .leading, spacing: 24) {
                // Section Header
                Text("Trailers & More")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                // Trailers ScrollView
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 20) {
                        ForEach(trailers, id: \.id) { trailer in
                            TrailerCard(trailer: trailer) {
                                onPlayTrailer(trailer)
                            }
                        }
                    }
                }
            }
            .padding(.vertical, 30)
        }
    }
}

struct TrailerCard: View {
    let trailer: streamio_addon_sdk.Video
    let onTap: () -> Void
    @State private var isHovered = false
    
    var body: some View {
        Button(action: onTap) {
            ZStack {
                // Thumbnail Container
                if let thumbnailURL = trailer.thumbnail {
                    AsyncImage(url: URL(string: thumbnailURL)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 320, height: 180)
                                .clipped()
                        case .empty, .failure:
                            placeholderView
                        @unknown default:
                            placeholderView
                        }
                    }
                } else {
                    placeholderView
                }
                
                // Dark gradient overlay
                LinearGradient(
                    gradient: Gradient(colors: [
                        .clear,
                        .black.opacity(0.2),
                        .black.opacity(0.6)
                    ]),
                    startPoint: .top,
                    endPoint: .bottom
                )
                
                // Content Overlay
                VStack {
                    Spacer()
                    
                    // Play button
                    Circle()
                        .fill(.white)
                        .frame(width: 50, height: 50)
                        .overlay(
                            Image(systemName: "play.fill")
                                .foregroundColor(.black)
                                .font(.system(size: 20, weight: .bold))
                        )
                        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 4)
                        .offset(y: isHovered ? -10 : 0)
                    
                    // Title
                    Text(trailer.title ?? "Trailer")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.5))
                        .clipShape(Capsule())
                        .padding(.top, 8)
                        .padding(.bottom, 16)
                }
            }
            .frame(width: 320, height: 180)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.3), radius: isHovered ? 15 : 8)
            .scaleEffect(isHovered ? 1.03 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .onHover { hovering in
            withAnimation(.easeInOut(duration: 0.2)) {
                isHovered = hovering
            }
        }
    }
    
    private var placeholderView: some View {
        Rectangle()
            .fill(Color.gray.opacity(0.3))
            .frame(width: 320, height: 180)
            .overlay(
                Image(systemName: "play.circle")
                    .font(.system(size: 30))
                    .foregroundColor(.white.opacity(0.8))
            )
    }
}
