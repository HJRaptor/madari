//
//  NavigationItem.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//


enum NavigationItem: String, CaseIterable {
    case home = "Home"
    case search = "Search"
    case movies = "Movies"
    case series = "Series"
    case settings = "Settings"
    
    var icon: String {
        switch self {
        case .home: return "house"
        case .movies: return "film"
        case .series: return "tv"
        case .search: return "magnifyingglass"
        case .settings: return "gear"
        }
    }
}
