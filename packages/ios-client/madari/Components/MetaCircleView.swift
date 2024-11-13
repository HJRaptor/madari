import SwiftUI

struct MetaCircleView: View {
    let links: [Link]
    @State private var selectedCategory: String?
    
    private var groupedLinks: [String: [Link]] {
        Dictionary(grouping: links) { $0.category }
    }
    
    private var categories: [String] {
        Array(groupedLinks.keys)
    }
    
    // Get system image name for category
    private func getSystemImage(for category: String) -> String {
        switch category.lowercased() {
        case "cast":
            return "person.3.fill"
        case "writers":
            return "pencil"
        case "directors":
            return "video.fill"
        case "genres":
            return "tag.fill"
        default:
            return "film"
        }
    }
    
    var body: some View {
        GeometryReader { geometry in
            let center = CGPoint(x: geometry.size.width/2, y: geometry.size.height/2)
            let radius: CGFloat = min(geometry.size.width, geometry.size.height)/3
            
            ZStack {
                // Center circle
                Circle()
                    .fill(Color.blue.opacity(0.1))
                    .frame(width: 100, height: 100)
                    .overlay(
                        Text("Meta Info")
                            .font(.headline)
                            .foregroundColor(.blue)
                    )
                
                // Category circles
                ForEach(Array(categories.enumerated()), id: \.element) { index, category in
                    let angle = 2 * .pi * Double(index) / Double(categories.count)
                    let x = center.x + radius * cos(angle)
                    let y = center.y + radius * sin(angle)
                    
                    VStack(spacing: 8) {
                        // Category Header
                        HStack {
                            Image(systemName: getSystemImage(for: category))
                            Text(category)
                                .font(.headline)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .clipShape(Capsule())
                        
                        // Links
                        VStack(spacing: 4) {
                            ForEach(groupedLinks[category] ?? [], id: \.url) { link in
                                Button(action: {
                                    // Handle link tap
                                    if let url = URL(string: link.url) {
                                        UIApplication.shared.open(url)
                                    }
                                }) {
                                    Text(link.name)
                                        .font(.subheadline)
                                        .foregroundColor(.blue)
                                        .padding(.vertical, 2)
                                }
                            }
                        }
                    }
                    .position(x: x, y: y)
                }
            }
        }
        .frame(height: 400)
    }
}

// Preview provider
struct MetaCircleView_Previews: PreviewProvider {
    static var sampleLinks: [Link] = [
        Link(name: "Lupita Nyong'o", category: "Cast", url: "stremio:///search?search=Lupita%20Nyong'o"),
        Link(name: "Chris Sanders", category: "Writers", url: "stremio:///search?search=Chris%20Sanders"),
        Link(name: "Chris Sanders", category: "Directors", url: "stremio:///search?search=Chris%20Sanders"),
        Link(name: "Animation", category: "Genres", url: "stremio:///discover/https%3A%2F%2Fv3-cinemeta.strem.io%2Fmanifest.json/movie/top?genre=Animation")
    ]
    
    static var previews: some View {
        MetaCircleView(links: sampleLinks)
            .previewLayout(.fixed(width: 400, height: 400))
    }
}