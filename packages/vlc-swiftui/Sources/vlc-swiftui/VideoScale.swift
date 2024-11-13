//
//  VideoScale.swift
//  vlc-swiftui
//
//  Created by Omkar Yadav on 13/11/24.
//
import Foundation

// MARK: - Video Scale Enum
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
public enum VideoScale {
    case fit      // Fit within screen bounds
    case fill     // Fill screen (may crop)
    case stretch  // Stretch to fill (may distort)
}

// MARK: - Subtitle Size Enum
@available(iOS 13.0, macOS 12.0, tvOS 13.0, *)
public enum SubtitleSize: CaseIterable {
    case small
    case medium
    case large
    
    var displayName: String {
        switch self {
        case .small: return "Small"
        case .medium: return "Medium"
        case .large: return "Large"
        }
    }
    
    var scaleFactor: CGFloat {
        switch self {
        case .small: return 0.8
        case .medium: return 1.0
        case .large: return 1.2
        }
    }
}
