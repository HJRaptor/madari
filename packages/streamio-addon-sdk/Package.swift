// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "streamio-addon-sdk",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "streamio-addon-sdk",
            targets: ["streamio-addon-sdk"]),
    ],
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", .upToNextMajor(from: "5.10.0")),
        .package(url: "https://github.com/idrougge/OptionallyDecodable.git", .upToNextMajor(from: "1.2.0")),
    ],
    targets: [
        .target(
            name: "streamio-addon-sdk",
            dependencies: ["Alamofire", "OptionallyDecodable"]
        ),
        .testTarget(
            name: "streamio-addon-sdkTests",
            dependencies: ["streamio-addon-sdk"]
        ),
    ]
)
