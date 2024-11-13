//
//  HideTabBarModifier.swift
//  madari
//
//  Created by Omkar Yadav on 12/11/24.
//
import SwiftUI


struct HideTabBarModifier: ViewModifier {
    let isHidden: Bool
    
    func body(content: Content) -> some View {
        content
        #if os(iOS)
            .onChange(of: isHidden) { _ in
                guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                      let tabBarController = windowScene.windows.first?.rootViewController?.children.first?.children.first as? UITabBarController else { return }
                
                tabBarController.tabBar.isHidden = isHidden
            }
        #endif
    }
}

extension View {
    func tabBarHidden(_ hidden: Bool) -> some View {
        modifier(HideTabBarModifier(isHidden: hidden))
    }
}
