//
//  AddonManagerError.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//
import Foundation

// MARK: - Errors
enum AddonManagerError: LocalizedError {
    case addonAlreadyExists
    
    var errorDescription: String? {
        switch self {
        case .addonAlreadyExists:
            return "This addon already exists"
        }
    }
}
