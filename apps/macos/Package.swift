// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "MacAltHub",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "MacAltHub", targets: ["MacAltHub"])
    ],
    targets: [
        .executableTarget(
            name: "MacAltHub",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
