import SwiftUI

struct SidebarView: View {
    @EnvironmentObject private var store: CatalogStore

    var body: some View {
        List(selection: $store.selectedAppID) {
            Section {
                Button {
                    store.selectedAppID = nil
                } label: {
                    Label("Catalog Home", systemImage: "square.grid.2x2")
                }

                Picker("Category", selection: $store.selectedCategory) {
                    ForEach(store.categories, id: \.self) { category in
                        Text(category).tag(category)
                    }
                }
                .pickerStyle(.menu)
                .onChange(of: store.selectedCategory) {
                    store.selectedAppID = nil
                }
            }

            Section("Alternatives") {
                ForEach(store.filteredApps) { app in
                    SidebarRow(app: app, saved: store.savedIDs.contains(app.id))
                        .tag(app.id)
                }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("MacAltHub")
        .overlay(alignment: .bottom) {
            if !store.comparedApps.isEmpty {
                CompareTrayView()
                    .padding(10)
            }
        }
    }
}

struct SidebarRow: View {
    let app: CatalogApp
    let saved: Bool

    var body: some View {
        HStack(spacing: 10) {
            AsyncImage(url: app.iconURL) { image in
                image.resizable().scaledToFit()
            } placeholder: {
                Image(systemName: "app.dashed")
                    .foregroundStyle(.secondary)
            }
            .frame(width: 24, height: 24)
            .padding(5)
            .background(Color(hex: app.accent).opacity(0.16), in: RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(app.name)
                        .lineLimit(1)
                    if saved {
                        Image(systemName: "bookmark.fill")
                            .font(.caption2)
                            .foregroundStyle(.blue)
                    }
                }
                Text(app.paidAlternativeSummary)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
    }
}
