import Foundation

struct CatalogApp: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let tagline: String
    let category: String
    let icon: String
    let accent: String
    let paidAlternatives: [String]
    let license: String
    let price: String
    let platforms: [String]
    let architecture: [String]
    let homepage: String
    let source: String?
    let popularity: Int
    let badges: [String]
    let trust: [String]
    let resolver: DownloadResolver
    let resolvedDownload: ResolvedDownload?
    let notes: String

    var paidAlternativeSummary: String {
        paidAlternatives.prefix(2).joined(separator: ", ")
    }

    var iconURL: URL? {
        guard let host = URL(string: homepage)?.host else { return nil }
        return URL(string: "https://www.google.com/s2/favicons?domain=\(host)&sz=128")
    }
}

struct DownloadResolver: Codable, Hashable {
    let kind: String
    let repo: String?
    let assetRegex: String?
    let fallbackUrl: String?
    let token: String?
    let url: String?
}

struct ResolvedDownload: Codable, Hashable {
    let kind: String
    let url: String
    let label: String
    let source: String
    let verifiedAt: String?
    let warning: String?
}

enum CatalogCategory: Hashable, Identifiable {
    case all
    case named(String)

    var id: String {
        switch self {
        case .all:
            return "All"
        case .named(let value):
            return value
        }
    }

    var title: String { id }
}

