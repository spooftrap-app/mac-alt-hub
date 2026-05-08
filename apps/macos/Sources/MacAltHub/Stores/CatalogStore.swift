import Foundation

@MainActor
final class CatalogStore: ObservableObject {
    @Published private(set) var apps: [CatalogApp] = []
    @Published var query = ""
    @Published var selectedCategory = "All"
    @Published var selectedAppID: CatalogApp.ID?
    @Published var compareIDs: [CatalogApp.ID] = []
    @Published var loadingError: String?
    @Published var savedIDs: Set<CatalogApp.ID> = []

    private let savedKey = "macalthub.saved.ids"

    var categories: [String] {
        ["All"] + Array(Set(apps.map(\.category))).sorted()
    }

    var filteredApps: [CatalogApp] {
        apps
            .filter { app in
                selectedCategory == "All" || app.category == selectedCategory
            }
            .filter { app in
                let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
                guard !normalized.isEmpty else { return true }
                let haystack = ([app.name, app.tagline, app.category, app.license, app.price, app.notes] + app.badges + app.trust + app.paidAlternatives)
                    .joined(separator: " ")
                    .lowercased()
                return haystack.contains(normalized)
            }
            .sorted { $0.popularity > $1.popularity }
    }

    var selectedApp: CatalogApp? {
        if let selectedAppID, let match = apps.first(where: { $0.id == selectedAppID }) {
            return match
        }
        return nil
    }

    var comparedApps: [CatalogApp] {
        compareIDs.compactMap { id in apps.first(where: { $0.id == id }) }
    }

    func load() async {
        do {
            guard let url = Bundle.module.url(forResource: "catalog", withExtension: "json") else {
                throw CatalogLoadError.missingResource
            }

            let data = try Data(contentsOf: url)
            apps = try JSONDecoder().decode([CatalogApp].self, from: data).sorted { $0.popularity > $1.popularity }
            savedIDs = Set(UserDefaults.standard.stringArray(forKey: savedKey) ?? [])
            loadingError = nil
        } catch {
            loadingError = error.localizedDescription
        }
    }

    func toggleCompare(_ app: CatalogApp) {
        if compareIDs.contains(app.id) {
            compareIDs.removeAll { $0 == app.id }
        } else {
            compareIDs.append(app.id)
            compareIDs = Array(compareIDs.suffix(3))
        }
    }

    func toggleSaved(_ app: CatalogApp) {
        if savedIDs.contains(app.id) {
            savedIDs.remove(app.id)
        } else {
            savedIDs.insert(app.id)
        }
        UserDefaults.standard.set(Array(savedIDs), forKey: savedKey)
    }
}

enum CatalogLoadError: LocalizedError {
    case missingResource

    var errorDescription: String? {
        "The bundled catalog.json resource could not be found."
    }
}
