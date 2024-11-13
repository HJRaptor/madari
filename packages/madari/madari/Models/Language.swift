import SwiftUI

enum Language: String, CaseIterable {
    case english = "English"
    case spanish = "Spanish"
    case french = "French"
    case german = "German"
    case japanese = "Japanese"
}

struct Addon: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let url: String
}
