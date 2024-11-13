import SwiftUI

struct SeasonEpisodeSelector: View {
    let meta: Meta
    @State private var selectedSeason: Int
    @State private var expandedEpisode: String?
    
    init(meta: Meta) {
        self.meta = meta
        // Initialize with the first season
        _selectedSeason = State(initialValue: meta.seasons.first ?? 1)
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Season Selector
                seasonPicker
                
                // Episodes List
                episodesList
            }
            .padding()
        }
    }
    
    private var seasonPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(meta.seasons, id: \.self) { season in
                    Button(action: {
                        selectedSeason = season
                    }) {
                        Text("Season \(season)")
                            .font(.headline)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 10)
                            .background(
                                RoundedRectangle(cornerRadius: 20)
                                    .fill(selectedSeason == season ?
                                          Color.blue : Color.gray.opacity(0.2))
                            )
                            .foregroundColor(selectedSeason == season ?
                                           .white : .primary)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
    
    private var episodesList: some View {
        LazyVStack(spacing: 16) {
            ForEach(meta.sortedEpisodesBySeason[selectedSeason] ?? [], id: \.id) { episode in
                EpisodeCard(episode: episode, isExpanded: expandedEpisode == episode.id) {
                    if expandedEpisode == episode.id {
                        expandedEpisode = nil
                    } else {
                        expandedEpisode = episode.id
                    }
                }
            }
        }
    }
}

struct EpisodeCard: View {
    let episode: VideoEpisode
    let isExpanded: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // Thumbnail and basic info
                HStack(spacing: 16) {
                    // Thumbnail
                    if let thumbnailURL = episode.thumbnail {
                        AsyncImage(url: URL(string: thumbnailURL)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(Color.gray.opacity(0.2))
                        }
                        .frame(width: 160, height: 90)
                        .cornerRadius(8)
                    }
                    
                    // Episode info
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Episode \(episode.number)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text(episode.name)
                            .font(.headline)
                            .lineLimit(2)
                        
                        if let released = episode.released {
                            Text(released.formatted(date: .abbreviated, time: .omitted))
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(.secondary)
                }
                
                // Expanded description
                if isExpanded, let description = episode.description {
                    Text(description)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .padding(.top, 8)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemBackground))
                    .shadow(color: Color.black.opacity(0.1),
                           radius: 8, x: 0, y: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SeasonEpisodeSelector_Previews: PreviewProvider {
    static var previews: some View {
        let sampleMeta = Meta(
            id: "show1",
            type: .series,
            name: "Sample Show",
            videos: [
                Video(
                    id: "ep1",
                    title: "Pilot",
                    released: Date(),
                    season: 1,
                    episode: 1,
                    thumbnail: "https://example.com/thumb1.jpg"
                ),
                Video(
                    id: "ep2",
                    title: "The Journey Begins",
                    released: Date(),
                    season: 1,
                    episode: 2,
                    thumbnail: "https://example.com/thumb2.jpg"
                )
            ]
        )
        
        SeasonEpisodeSelector(meta: sampleMeta)
            .preferredColorScheme(.dark)
    }
}