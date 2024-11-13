// MARK: - Orientation Manager
class OrientationManager: ObservableObject {
    static let shared = OrientationManager()
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

// MARK: - View Extension
extension View {
    func lockOrientation(_ orientation: UIInterfaceOrientationMask) -> some View {
        modifier(DeviceOrientationViewModifier(orientation: orientation))
    }
}

// MARK: - Scene Delegate Adapter
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    func windowScene(_ windowScene: UIWindowScene, didUpdate previousCoordinateSpace: UICoordinateSpace, interfaceOrientation previousInterfaceOrientation: UIInterfaceOrientation, traitCollection previousTraitCollection: UITraitCollection) {
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
            if OrientationManager.shared.orientation == .landscape {
                windowScene.requestGeometryUpdate(.iOS(interfaceOrientations: .landscape))
            }
        }
    }
}