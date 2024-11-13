//
//  NavigationItem.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//


enum NavigationItem: String, CaseIterable {
    case home = "Home"
    case movies = "Movies"
    case series = "Series"
    case settings = "Settings"
    
    var icon: String {
        switch self {
        case .home: return "house.fill"
        case .movies: return "film.fill"
        case .series: return "tv.fill"
        case .settings: return "gear"
        }
    }
}