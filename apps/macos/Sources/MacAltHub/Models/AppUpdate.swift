import Foundation

struct VersionInfo: Codable, Hashable {
    let version: String
    let build: String
}

struct Appcast: Codable, Hashable {
    let product: String
    let channel: String
    let currentVersion: String
    let minimumSystemVersion: String
    let generatedAt: String
    let releases: [AppRelease]
}

struct AppRelease: Codable, Hashable, Identifiable {
    let version: String
    let build: String
    let date: String
    let notes: String
    let downloadUrl: String
    let signature: String?
    let sha256: String?

    var id: String { version }
}

struct UpdateCheckResult: Hashable {
    let currentVersion: String
    let latestRelease: AppRelease?

    var updateAvailable: Bool {
        guard let latestRelease else { return false }
        return VersionComparator.is(latestRelease.version, newerThan: currentVersion)
    }
}

enum VersionComparator {
    static func `is`(_ candidate: String, newerThan current: String) -> Bool {
        let left = candidate.split(separator: ".").compactMap { Int($0) }
        let right = current.split(separator: ".").compactMap { Int($0) }
        let count = max(left.count, right.count)

        for index in 0..<count {
            let lhs = index < left.count ? left[index] : 0
            let rhs = index < right.count ? right[index] : 0
            if lhs > rhs { return true }
            if lhs < rhs { return false }
        }

        return false
    }
}

