//
//  StoredAddonURL.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//
import SwiftData


// MARK: - Models
@Model
final class StoredAddonURL {
    var url: String
    var isActive: Bool
    var order: Int
    
    init(url: String, isActive: Bool = true) {
        self.url = url
        self.isActive = isActive
        self.order = 0
    }
    
    // Migration initializer
    init(url: String, isActive: Bool = true, order: Int) {
        self.url = url
        self.isActive = isActive
        self.order = order
    }
}
