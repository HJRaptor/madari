import SwiftUI

// MARK: - Models and Storage
class SettingsStorage: ObservableObject {
    static let shared = SettingsStorage()
    
    @AppStorage("selectedLanguage") private var storedLanguage = Language.english.rawValue
    @AppStorage("subtitleLanguage") private var storedSubtitleLanguage = Language.english.rawValue
    @AppStorage("audioLanguage") private var storedAudioLanguage = Language.english.rawValue
    @AppStorage("enabledAddons") private var storedEnabledAddons = "" {
        didSet {
            enabledAddonsSet = Set(storedEnabledAddons.components(separatedBy: ",").filter { !$0.isEmpty })
        }
    }
    
    @Published private var enabledAddonsSet: Set<String> = []
    
    init() {
        enabledAddonsSet = Set(storedEnabledAddons.components(separatedBy: ",").filter { !$0.isEmpty })
    }
    
    var selectedLanguage: Language {
        get { Language(rawValue: storedLanguage) ?? .english }
        set { storedLanguage = newValue.rawValue }
    }
    
    var subtitleLanguage: Language {
        get { Language(rawValue: storedSubtitleLanguage) ?? .english }
        set { storedSubtitleLanguage = newValue.rawValue }
    }
    
    var audioLanguage: Language {
        get { Language(rawValue: storedAudioLanguage) ?? .english }
        set { storedAudioLanguage = newValue.rawValue }
    }
    
    var enabledAddons: Set<String> {
        get { enabledAddonsSet }
        set {
            enabledAddonsSet = newValue
            storedEnabledAddons = Array(newValue).joined(separator: ",")
        }
    }
}

