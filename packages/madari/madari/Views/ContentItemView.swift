import SwiftUI
import streamio_addon_sdk

#if os(iOS)
import UIKit
typealias PlatformImage = UIImage
#elseif os(macOS)
import AppKit
typealias PlatformImage = NSImage
#endif

// Image cache using NSCache
final class ImageCache {
    static let shared = ImageCache()
    private let cache = NSCache<NSString, PlatformImage>()
    
    private init() {
        cache.countLimit = 100 // Adjust based on your needs
    }
    
    func set(_ image: PlatformImage, for url: String) {
        cache.setObject(image, forKey: url as NSString)
    }
    
    func get(for url: String) -> PlatformImage? {
        return cache.object(forKey: url as NSString)
    }
}

// Cached async image view
struct CachedAsyncImage: View {
    let url: URL
    let contentMode: ContentMode
    @State private var image: PlatformImage?
    @State private var isLoading = true
    
    var body: some View {
        Group {
            if let image = image {
                #if os(iOS)
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode == .fill ? .fill : .fit)
                #elseif os(macOS)
                Image(nsImage: image)
                    .resizable()
                    .aspectRatio(contentMode: contentMode == .fill ? .fill : .fit)
                #endif
            } else if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.gray.opacity(0.1))
            } else {
                Image(systemName: "photo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .foregroundColor(.gray)
                    .padding()
            }
        }
        .onAppear {
            loadImage()
        }
    }
    
    private func loadImage() {
        let urlString = url.absoluteString
        if let cachedImage = ImageCache.shared.get(for: urlString) {
            self.image = cachedImage
            self.isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data, error == nil else {
                DispatchQueue.main.async {
                    self.isLoading = false
                }
                return
            }
            
            #if os(iOS)
            guard let loadedImage = UIImage(data: data) else {
                DispatchQueue.main.async {
                    self.isLoading = false
                }
                return
            }
            #elseif os(macOS)
            guard let loadedImage = NSImage(data: data) else {
                DispatchQueue.main.async {
                    self.isLoading = false
                }
                return
            }
            #endif
            
            ImageCache.shared.set(loadedImage, for: urlString)
            DispatchQueue.main.async {
                self.image = loadedImage
                self.isLoading = false
            }
        }.resume()
    }
}

struct ContentCard: View {
    let meta: AddonMetaMeta
    let isDesktop: Bool
    @State private var isHovered = false
    
    private var dimensions: (width: CGFloat, height: CGFloat) {
        let shape = meta.posterShape ?? .poster
        switch shape {
        case .poster:
            return isDesktop ? (200, 300) : (120, 180)
        case .square:
            return isDesktop ? (260, 260) : (160, 160)
        case .landscape:
            return isDesktop ? (320, 180) : (200, 112)
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: isDesktop ? 8 : 4) {
            ZStack {
                if let posterURL = meta.poster.flatMap({ URL(string: $0) }) {
                    CachedAsyncImage(url: posterURL, contentMode: .fill)
                        .frame(width: dimensions.width, height: dimensions.height)
                        .scaleEffect(isDesktop && isHovered ? 1.05 : 1.0)
                }
            }
            .clipped()
            .cornerRadius(isDesktop ? 12 : 8)
            #if os(macOS)
            .shadow(radius: isDesktop && isHovered ? 15 : 5, y: isDesktop && isHovered ? 10 : 5)
            .onHover { hovering in
                guard isDesktop else { return }
                withAnimation(.easeInOut(duration: 0.2)) {
                    isHovered = hovering
                }
            }
            #endif
            .overlay(
                Group {
                    if let rating = meta.imdbRating {
                        HStack(spacing: 4) {
                            if isDesktop {
                                Image(systemName: "star.fill")
                                    .foregroundColor(.yellow)
                            }
                            Text(rating)
                                .fontWeight(.semibold)
                        }
                        .font(isDesktop ? .subheadline : .caption2)
                        .padding(isDesktop ? 6 : 4)
                        .cornerRadius(isDesktop ? 8 : 4)
                        .padding(isDesktop ? 8 : 4)
                    }
                },
                alignment: .topTrailing
            )
            
            VStack(alignment: .leading, spacing: isDesktop ? 6 : 2) {
                Text(meta.name)
                    .font(isDesktop ? .title3 : .caption)
                    .fontWeight(isDesktop ? .semibold : .medium)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                
                if isDesktop {
                    HStack {
                        MetadataText(meta: meta)
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                } else {
                    MetadataText(meta: meta)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.horizontal, isDesktop ? 4 : 0)
        }
        .frame(width: dimensions.width)
    }
}

// Extracted metadata text view
struct MetadataText: View {
    let meta: AddonMetaMeta
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            // Release Info
            Group {
                if let releaseInfo = meta.releaseInfo {
                    Text(releaseInfo)
                } else if let year = meta.year {
                    Text(year)
                } else if let released = meta.released {
                    Text(released.prefix(4))
                }
            }
            
            // Genre
            Group {
                if let firstGenre = meta.genres?.first ?? meta.genre?.first {
                    Text(firstGenre)
                } else if meta.type != .movie {
                    Text(meta.type.rawValue.capitalized)
                }
            }
            
            // Runtime
            if let runtime = meta.runtime {
                Text(runtime)
            }
        }
    }
}

struct ContentItemView: View {
    let meta: AddonMetaMeta
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    
    var body: some View {
        NavigationLink(value: meta) {
            ContentCard(meta: meta, isDesktop: horizontalSizeClass != .compact)
        }
        .buttonStyle(.plain)
    }
}
