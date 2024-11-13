//import SwiftUI
//import StreamioAddonSDK
//
//// MARK: - Example Content View
//struct ContentView: View {
//    var body: some View {
//        Spacer()
//        let meta = Meta(
//            id: "tt29623480",
//            type: .movie,
//            name: "The Wild Robot",
//            poster: "https://images.metahub.space/poster/small/tt29623480/img",
//            background: "https://images.metahub.space/background/medium/tt29623480/img",
//            description: "After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island. To survive the harsh environment, Roz bonds with the island's animals and cares for an orphaned baby goose.",
//            releaseInfo: "2024",
//            runtime: "102 min",
//            videos: [],
//            links: [
//                Link(name: "Animation", category: "Genres", url: ""),
//                Link(name: "Sci-Fi", category: "Genres", url: ""),
//                Link(name: "Lupita Nyong'o", category: "Cast", url: "stremio:///search?search=Lupita%20Nyong'o"),
//                Link(name: "Chris Sanders", category: "Writers", url: "stremio:///search?search=Chris%20Sanders"),
//                Link(name: "Chris Sanders", category: "Directors", url: "stremio:///search?search=Chris%20Sanders"),
//                Link(name: "Animation", category: "Genres", url: "stremio:///discover/movie/top?genre=Animation")
//            ],
//            logo: "https://images.metahub.space/logo/medium/tt29623480/img"
//        )
//        
//        ScrollView {
//            VStack(spacing: 0) {
//                // Hero Section with fixed height
//                VideoHeroSection(
//                    meta: meta
//                ) {
//                    print("Play tapped")
//                }
//                
//                if (meta.type == .series) {
//                    MaxWidthContent {
//                        SeasonEpisodeSelector(meta: meta)
//                    }
//                }
//                
//                MaxWidthContent {
//                    // Trailer Section
//                    TrailerSection(trailers: [
//                        Trailer(source: "ZtuFgnxQMrA", type: "Trailer"),
//                        Trailer(source: "another_source", type: "Behind the Scenes")
//                    ]) { _ in
//                        print("Play trailer")
//                    }
//                    
//                }
//                
//                MaxWidthContent {
//                    MetaSectionView(meta: meta)
//                }
//            }
//        }
//    }
//}
//
//// MARK: - Preview
//#Preview("Video Detail Examples") {
//    ContentView()
//}
//
//// MARK: - Preview Device Variations
//struct ExampleContentView_Previews: PreviewProvider {
//    static var previews: some View {
//        Group {
//            // iPhone Preview
//            ContentView()
//                .previewDevice(PreviewDevice(rawValue: "iPhone 15 Pro"))
//                .previewDisplayName("iPhone 15 Pro")
//            
//            // iPad Preview
//            ContentView()
//                .previewDevice(PreviewDevice(rawValue: "iPad Pro (12.9-inch) (6th generation)"))
//                .previewDisplayName("iPad Pro 12.9\"")
//            
//            // Mac Preview
//            ContentView()
//                .previewDevice(PreviewDevice(rawValue: "Mac"))
//                .previewDisplayName("Mac")
//        }
//    }
//}
