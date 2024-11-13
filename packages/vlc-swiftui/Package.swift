// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "vlc-swiftui",
    platforms: [.macOS(.v10_13), .iOS(.v13), .tvOS(.v12)],
    products: [
        .library(
            name: "vlc-swiftui",
            targets: ["vlc-swiftui"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/0xHexE/VLCKitSPMWrapper.git", revision: "d104e8096ce61e6b3505a6174b24bcd7830b33da"),
    ],
    targets: [
        .target(
            name: "vlc-swiftui",
            dependencies: [
                .product(name: "VLCKitSPM", package: "VLCKitSPMWrapper")
            ]
        ),
        .testTarget(
            name: "vlc-swiftuiTests",
            dependencies: ["vlc-swiftui"]
        ),
    ]
)
