import AppKit
import Foundation

struct UpdateService {
    func currentVersion() -> String {
        if let url = Bundle.module.url(forResource: "version", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let version = try? JSONDecoder().decode(VersionInfo.self, from: data) {
            return version.version
        }

        return Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "0.0.0"
    }

    func check(feedURL: URL? = nil) async throws -> UpdateCheckResult {
        let current = currentVersion()
        let appcast = try await loadAppcast(feedURL: feedURL)
        let latest = appcast.releases.sorted {
            VersionComparator.is($0.version, newerThan: $1.version)
        }.first

        return UpdateCheckResult(currentVersion: current, latestRelease: latest)
    }

    func openRelease(_ release: AppRelease) {
        guard let url = URL(string: release.downloadUrl) else { return }
        NSWorkspace.shared.open(url)
    }

    private func loadAppcast(feedURL: URL?) async throws -> Appcast {
        if let feedURL {
            let (data, response) = try await URLSession.shared.data(from: feedURL)
            guard (response as? HTTPURLResponse)?.statusCode == 200 else {
                throw UpdateError.feedUnavailable
            }
            return try JSONDecoder().decode(Appcast.self, from: data)
        }

        guard let url = Bundle.module.url(forResource: "appcast", withExtension: "json") else {
            throw UpdateError.missingBundledFeed
        }
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(Appcast.self, from: data)
    }
}

enum UpdateError: LocalizedError {
    case feedUnavailable
    case missingBundledFeed

    var errorDescription: String? {
        switch self {
        case .feedUnavailable:
            return "The update feed could not be reached."
        case .missingBundledFeed:
            return "The bundled update manifest is missing."
        }
    }
}

