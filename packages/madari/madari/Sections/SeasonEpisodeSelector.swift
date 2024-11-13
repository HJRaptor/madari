import SwiftUI
import streamio_addon_sdk

struct SeasonEpisodeSelector: View {
    let meta: AddonMetaMeta
    @State private var selectedSeason: Int
    @Environment(\.colorScheme) private var colorScheme
    @State private var isLoading = false
    let onEpisodeSelected: (Int, Int) -> Void
    
    init(meta: AddonMetaMeta, onEpisodeSelected: @escaping (Int, Int) -> Void) {
        self.meta = meta
        _selectedSeason = State(initialValue: meta.videos?.first?.season ?? 1)
        self.onEpisodeSelected = onEpisodeSelected
    }
    
    private var seasons: [Int] {
        let allSeasons = meta.videos?.compactMap { $0.season }.unique().sorted() ?? []
        return allSeasons.isEmpty ? [1] : allSeasons
    }
    
    private var episodesBySeason: [Int: [streamio_addon_sdk.Video]] {
        Dictionary(grouping: meta.videos ?? [], by: { $0.season ?? 1 })
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                // Season Selector
                Picker("Season", selection: $selectedSeason) {
                    ForEach(seasons, id: \.self) { season in
                        Text("Season \(season)").tag(season)
                    }
                }
                .pickerStyle(.menu)
                .accentColor(.primary)
                .font(.title3.weight(.semibold))
                
                // Episodes List
                LazyVStack(alignment: .leading, spacing: 24) {
                    ForEach(episodesBySeason[selectedSeason] ?? [], id: \.id) { episode in
                        EpisodeCard(episode: episode)
                            .onTapGesture {
                                onEpisodeSelected(selectedSeason, episode.episode ?? 0)
                            }
                    }
                }
            }
        }
    }
}

struct EpisodeCard: View {
    let episode: streamio_addon_sdk.Video
    
    private func formatDate(_ dateString: String) -> String {
        // Try ISO8601 first
        if let date = ISO8601DateFormatter().date(from: dateString) {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d, yyyy"
            return formatter.string(from: date)
        }
        
        // Try other common formats
        let dateFormatter = DateFormatter()
        let formats = [
            "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
            "yyyy-MM-dd'T'HH:mm:ssZ",
            "yyyy-MM-dd",
            "yyyy"
        ]
        
        for format in formats {
            dateFormatter.dateFormat = format
            if let date = dateFormatter.date(from: dateString) {
                dateFormatter.dateFormat = "MMM d, yyyy"
                return dateFormatter.string(from: date)
            }
        }
        
        // If it's just a year
        if dateString.count == 4, Int(dateString) != nil {
            return dateString
        }
        
        // Return original if no format matches
        return dateString
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            // Thumbnail
            thumbnailView
            
            // Episode Info
            VStack(alignment: .leading, spacing: 8) {
                // Title and Episode Number
                VStack(alignment: .leading, spacing: 4) {
                    Text("EPISODE \(episode.episode ?? 0)")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                    
                    Text(episode.title ?? "Episode \(episode.episode ?? 0)")
                        .font(.headline)
                }
                
                // Release Date
                if let released = episode.released {
                    Text(formatDate(released))
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                // Description
                if let description = episode.overview {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                        .padding(.top, 2)
                }
            }
        }
        .contentShape(Rectangle())
        .buttonStyle(.plain)
    }
    
    private var thumbnailView: some View {
        Group {
            if let thumbnailURL = episode.thumbnail {
                AsyncImage(url: URL(string: thumbnailURL)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    placeholderView
                }
            } else {
                placeholderView
            }
        }
        .frame(width: 160, height: 90)  // 16:9 aspect ratio but smaller
        .clipShape(RoundedRectangle(cornerRadius: 4))
    }
    
    private var placeholderView: some View {
        Rectangle()
            .fill(Color.gray.opacity(0.2))
            .overlay(
                Image(systemName: "play.circle")
                    .font(.title)
                    .foregroundColor(.gray.opacity(0.3))
            )
    }
}

// Helper for unique array elements
extension Sequence where Element: Hashable {
    func unique() -> [Element] {
        var seen = Set<Element>()
        return filter { seen.insert($0).inserted }
    }
}
