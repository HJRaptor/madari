import SwiftUI
import StreamioAddonSDK

// MARK: - Card Component
struct StremioCard: View {
    let meta: Meta
    @State private var isHovered = false
    @Environment(\.colorScheme) var colorScheme
    
    // Dynamic sizing based on container
    private func calculateSize(in size: CGSize) -> CGSize {
        let aspectRatio: CGFloat = 0.67 // Standard movie poster ratio (2:3)
        let widthPadding: CGFloat = 20
        let calculatedWidth = min(max(size.width / 3 - widthPadding, 200), 300)
        return CGSize(width: calculatedWidth, height: calculatedWidth / aspectRatio)
    }
    
    var body: some View {
        GeometryReader { geometry in
            let cardSize = calculateSize(in: geometry.size)
            
            VStack(alignment: .leading, spacing: 8) {
                // Poster Image
                AsyncImage(url: URL(string: meta.poster ?? "")) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure(_):
                        failurePlaceholder
                    case .empty:
                        loadingPlaceholder
                    @unknown default:
                        loadingPlaceholder
                    }
                }
                .frame(width: cardSize.width, height: cardSize.height)
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.white.opacity(0.1), lineWidth: 0.5)
                )
                
                // Content Info
                VStack(alignment: .leading, spacing: 4) {
                    // Title
                    Text(meta.name)
                        .font(.headline)
                        .lineLimit(1)
                        .foregroundColor(.primary)
                    
                    // Release Info & Runtime
                    HStack {
                        if let releaseInfo = meta.releaseInfo {
                            Text(releaseInfo)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        if let runtime = meta.runtime {
                            Text("•")
                                .foregroundColor(.secondary)
                            Text(runtime)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .frame(width: cardSize.width, alignment: .leading)
                .padding(.horizontal, 4)
            }
            .background(Color.clear)
            .scaleEffect(isHovered ? 1.05 : 1.0)
            .shadow(radius: isHovered ? 10 : 5)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isHovered)
            .onHover { hovering in
                isHovered = hovering
            }
        }
    }
    
    private var loadingPlaceholder: some View {
        Rectangle()
            .fill(Color.gray.opacity(0.3))
            .overlay(
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
            )
    }
    
    private var failurePlaceholder: some View {
        Rectangle()
            .fill(Color.gray.opacity(0.3))
            .overlay(
                Image(systemName: "photo")
                    .font(.largeTitle)
                    .foregroundColor(.white.opacity(0.7))
            )
    }
}

// MARK: - Grid Layout
struct StremioCardGrid: View {
    let items: [Meta]
    let columns: Int
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                LazyVGrid(
                    columns: Array(repeating: GridItem(.flexible(), spacing: 20), count: columns),
                    spacing: 20
                ) {
                    ForEach(items, id: \.id) { meta in
                        StremioCard(meta: meta)
                    }
                }
                .padding()
            }
        }
    }
}

// MARK: - Preview Provider
struct StremioCard_Previews: PreviewProvider {
    static var sampleMeta: Meta {
        Meta(
            id: "tt27911000",
            type: .movie,
            name: "Terrifier 3",
            poster: "https://images.metahub.space/poster/small/tt27911000/img",
            background: "https://images.metahub.space/background/medium/tt27911000/img",
            description: "Art the Clown is set to unleash chaos on the unsuspecting residents of Miles County as they peacefully drift off to sleep on Christmas Eve.",
            releaseInfo: "2024",
            runtime: "125 min"
        )
    }
    
    static var previews: some View {
        Group {
            // Single Card Preview
            StremioCard(meta: sampleMeta)
                .frame(width: 300, height: 500)
                .previewDisplayName("Single Card")
            
            // Grid Preview
            StremioCardGrid(
                items: Array(repeating: sampleMeta, count: 6),
                columns: 3
            )
            .previewDisplayName("Card Grid")
        }
        .preferredColorScheme(.dark) // Apple TV style dark mode
    }
}
