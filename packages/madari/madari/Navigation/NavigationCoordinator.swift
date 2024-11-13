//
//  NavigationCoordinator.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//
import SwiftUI
import streamio_addon_sdk

class NavigationCoordinator: ObservableObject {
    @Published var isOverlayVisible = true
    static let shared = NavigationCoordinator()
    
    enum NavigationState {
        case detail(AddonMetaMeta)
        case videoPlayer(NavigationStream)
        case none
    }
    
    @Published var navigationState: NavigationState = .none
    @Published var selectedDetailMeta: AddonMetaMeta?
    @Published var navigationPath = NavigationPath()

    func navigateToDetail(_ meta: AddonMetaMeta) {
        selectedDetailMeta = meta
        navigationState = .detail(meta)
        navigationPath.append(meta)
    }
    
    func navigateToVideoPlayer(_ stream: NavigationStream) {
        navigationState = .videoPlayer(stream)
        navigationPath.append(stream)
    }
    
    func popToRoot() {
        navigationPath = NavigationPath()
        navigationState = .none
    }
}
