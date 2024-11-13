//
//  OrientationManager.swift
//  vlc-swiftui
//
//  Created by Omkar Yadav on 13/11/24.
//
import SwiftUI

#if os(iOS)
// MARK: - Orientation Manager
class OrientationManager: ObservableObject {
    @MainActor static let shared = OrientationManager()
    @Published var orientation: UIInterfaceOrientationMask = .all
    
    func lock(_ orientation: UIInterfaceOrientationMask) {
        self.orientation = orientation
    }
}

// MARK: - Scene Orientation Modifier
struct DeviceOrientationViewModifier: ViewModifier {
    let orientation: UIInterfaceOrientationMask
    
    func body(content: Content) -> some View {
        content
            .onAppear() {
                OrientationManager.shared.lock(orientation)
            }
    }
}

// MARK: - Scene Delegate Adapter
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    func windowScene(_ windowScene: UIWindowScene, didUpdate previousCoordinateSpace: UICoordinateSpace, interfaceOrientation previousInterfaceOrientation: UIInterfaceOrientation, traitCollection previousTraitCollection: UITraitCollection) {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            if OrientationManager.shared.orientation == .landscape {
                if #available(iOS 16.0, *) {
                    windowScene.requestGeometryUpdate(.iOS(interfaceOrientations: .landscape))
                } else {
                    // Fallback on earlier versions
                }
            }
        }
    }
}
#endif
