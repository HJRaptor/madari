import SwiftUI
import streamio_addon_sdk
import vlc_swiftui

struct VideoPlayerView: View {
    let stream: AddonStreamItem
    let meta: AddonMetaMeta
    @StateObject private var coordinator = NavigationCoordinator.shared
    
    var body: some View {
        VStack {
            if let url = stream.url {
                VLCPlayerView(url: URL(string: url)!, onBackButton: {
                    coordinator.navigationPath.removeLast()
                })
            }
        }
    }
}
