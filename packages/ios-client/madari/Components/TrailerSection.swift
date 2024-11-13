struct TrailerSection: View {
    let trailers: [Trailer]
    let onPlayTrailer: (Trailer) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Trailers & More")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 16) {
                    ForEach(trailers) { trailer in
                        TrailerCard(trailer: trailer) {
                            onPlayTrailer(trailer)
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .padding(.vertical, 24)
    }
}

struct TrailerCard: View {
    let trailer: Trailer
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            ZStack {
                // Thumbnail
                AsyncImage(url: URL(string: trailer.thumbnailURL)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .empty, .failure:
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                    default:
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                    }
                }
                
                // Play Icon Overlay
                Circle()
                    .fill(Color.black.opacity(0.7))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "play.fill")
                            .foregroundColor(.white)
                            .font(.title3)
                    )
                
                // Type Overlay at bottom
                VStack {
                    Spacer()
                    Text(trailer.type)
                        .lineLimit(1)
                        .font(.caption)
                        .padding(8)
                        .frame(maxWidth: .infinity)
                        .background(Color.black.opacity(0.7))
                        .foregroundColor(.white)
                }
            }
        }
        .frame(width: 280, height: 157) // 16:9 aspect ratio
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .shadow(radius: 4)
    }
}