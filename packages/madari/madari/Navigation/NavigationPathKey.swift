//
//  NavigationPathKey.swift
//  madari
//
//  Created by Omkar Yadav on 11/11/24.
//

import SwiftUI
import streamio_addon_sdk

// MARK: - NavigationPath Environment Key
private struct NavigationPathKey: EnvironmentKey {
    static let defaultValue: Binding<NavigationPath> = .constant(NavigationPath())
}

extension EnvironmentValues {
    var navigationPath: Binding<NavigationPath> {
        get { self[NavigationPathKey.self] }
        set { self[NavigationPathKey.self] = newValue }
    }
}
