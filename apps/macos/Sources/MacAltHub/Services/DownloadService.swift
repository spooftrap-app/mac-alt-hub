import AppKit
import Foundation

struct DownloadService {
    private let blockedHosts = [
        "discord.com",
        "discord.gg",
        "x.com",
        "twitter.com",
        "t.me",
        "telegram.me",
        "bit.ly",
        "tinyurl.com",
        "linktr.ee",
        "ko-fi.com",
        "patreon.com"
    ]

    func openDownload(for app: CatalogApp) async throws {
        let url = try await resolveDownloadURL(for: app)
        guard !isBlocked(url) else {
            throw DownloadError.blockedHost(url.host ?? "unknown")
        }
        await MainActor.run {
            _ = NSWorkspace.shared.open(url)
        }
    }

    func resolveDownloadURL(for app: CatalogApp) async throws -> URL {
        if let resolved = app.resolvedDownload, resolved.warning == nil, let url = URL(string: resolved.url) {
            return url
        }

        switch app.resolver.kind {
        case "github-release":
            return try await resolveGitHub(app.resolver)
        case "homebrew-cask":
            return try await resolveHomebrew(app.resolver)
        case "official-direct", "release-page":
            guard let value = app.resolver.url, let url = URL(string: value) else {
                throw DownloadError.invalidURL
            }
            return url
        default:
            if let fallback = app.resolver.fallbackUrl, let url = URL(string: fallback) {
                return url
            }
            throw DownloadError.invalidURL
        }
    }

    private func resolveGitHub(_ resolver: DownloadResolver) async throws -> URL {
        guard let repo = resolver.repo else { throw DownloadError.invalidURL }
        let endpoint = URL(string: "https://api.github.com/repos/\(repo)/releases/latest")!
        let (data, response) = try await URLSession.shared.data(from: endpoint)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            return try fallbackURL(resolver)
        }

        let release = try JSONDecoder().decode(GitHubRelease.self, from: data)
        let regex = try NSRegularExpression(pattern: resolver.assetRegex ?? "\\.(dmg|zip|pkg)$", options: [.caseInsensitive])
        let asset = release.assets.first { asset in
            let range = NSRange(asset.name.startIndex..<asset.name.endIndex, in: asset.name)
            return regex.firstMatch(in: asset.name, range: range) != nil
        }

        guard let value = asset?.browserDownloadURL, let url = URL(string: value) else {
            return try fallbackURL(resolver)
        }
        return url
    }

    private func resolveHomebrew(_ resolver: DownloadResolver) async throws -> URL {
        guard let token = resolver.token else { throw DownloadError.invalidURL }
        let endpoint = URL(string: "https://formulae.brew.sh/api/cask/\(token).json")!
        let (data, response) = try await URLSession.shared.data(from: endpoint)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            return try fallbackURL(resolver)
        }
        let cask = try JSONDecoder().decode(HomebrewCask.self, from: data)
        guard let url = URL(string: cask.url) else {
            return try fallbackURL(resolver)
        }
        return url
    }

    private func fallbackURL(_ resolver: DownloadResolver) throws -> URL {
        guard let fallback = resolver.fallbackUrl, let url = URL(string: fallback) else {
            throw DownloadError.invalidURL
        }
        return url
    }

    private func isBlocked(_ url: URL) -> Bool {
        guard let host = url.host?.replacingOccurrences(of: "www.", with: "") else {
            return true
        }
        return blockedHosts.contains { host == $0 || host.hasSuffix(".\($0)") }
    }
}

struct GitHubRelease: Decodable {
    let assets: [GitHubAsset]
}

struct GitHubAsset: Decodable {
    let name: String
    let browserDownloadURL: String

    enum CodingKeys: String, CodingKey {
        case name
        case browserDownloadURL = "browser_download_url"
    }
}

struct HomebrewCask: Decodable {
    let url: String
}

enum DownloadError: LocalizedError {
    case invalidURL
    case blockedHost(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "MacAltHub could not find a safe download URL for this app."
        case .blockedHost(let host):
            return "MacAltHub blocked this download target because it points to \(host)."
        }
    }
}
