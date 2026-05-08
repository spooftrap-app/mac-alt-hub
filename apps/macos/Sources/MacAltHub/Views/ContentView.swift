import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: CatalogStore

    var body: some View {
        NavigationSplitView {
            SidebarView()
        } detail: {
            if let error = store.loadingError {
                ContentUnavailableView("Catalog failed to load", systemImage: "exclamationmark.triangle", description: Text(error))
            } else if let app = store.selectedApp {
                DetailView(app: app)
            } else if !store.apps.isEmpty {
                CatalogHomeView()
            } else {
                ContentUnavailableView("No apps found", systemImage: "magnifyingglass", description: Text("Try a different search or category."))
            }
        }
        .searchable(text: $store.query, placement: .toolbar, prompt: "Search paid apps, alternatives, categories...")
        .toolbar {
            ToolbarItemGroup {
                Button {
                    store.selectedAppID = nil
                } label: {
                    Label("Catalog Home", systemImage: "square.grid.2x2")
                }
                .help("Show catalog home")

                Button {
                    store.query = ""
                    store.selectedCategory = "All"
                    store.selectedAppID = nil
                } label: {
                    Label("Reset Filters", systemImage: "arrow.counterclockwise")
                }
                .help("Reset filters")
            }
        }
    }
}
