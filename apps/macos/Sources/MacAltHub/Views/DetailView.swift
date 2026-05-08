import SwiftUI

struct DetailView: View {
    @EnvironmentObject private var store: CatalogStore
    @State private var downloadError: String?
    let app: CatalogApp

    private let downloadService = DownloadService()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                hero
                facts
                trust
                notes
                if store.comparedApps.count >= 2 {
                    comparison
                }
            }
            .padding(28)
        }
        .navigationTitle(app.name)
        .toolbar {
            ToolbarItemGroup {
                Button {
                    store.toggleSaved(app)
                } label: {
                    Label(store.savedIDs.contains(app.id) ? "Saved" : "Save", systemImage: store.savedIDs.contains(app.id) ? "bookmark.fill" : "bookmark")
                }
                .help("Save app")

                Button {
                    store.toggleCompare(app)
                } label: {
                    Label(store.compareIDs.contains(app.id) ? "Remove Compare" : "Compare", systemImage: "rectangle.2.swap")
                }
                .help("Compare")
            }
        }
        .alert("Download blocked", isPresented: Binding(get: { downloadError != nil }, set: { if !$0 { downloadError = nil } })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(downloadError ?? "")
        }
    }

    private var hero: some View {
        HStack(alignment: .center, spacing: 22) {
            AsyncImage(url: app.iconURL) { image in
                image.resizable().scaledToFit()
            } placeholder: {
                Image(systemName: "app.fill")
                    .font(.system(size: 54))
                    .foregroundStyle(.white)
            }
            .frame(width: 86, height: 86)
            .padding(18)
            .background(Color(hex: app.accent), in: RoundedRectangle(cornerRadius: 28))
            .shadow(color: .black.opacity(0.14), radius: 24, y: 12)

            VStack(alignment: .leading, spacing: 8) {
                Text(app.category.uppercased())
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.blue)
                Text(app.name)
                    .font(.system(size: 44, weight: .bold, design: .default))
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
                Text(app.tagline)
                    .font(.title3)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                HStack {
                    Button {
                        Task {
                            do {
                                try await downloadService.openDownload(for: app)
                            } catch {
                                downloadError = error.localizedDescription
                            }
                        }
                    } label: {
                        Label("Download", systemImage: "arrow.down.circle.fill")
                    }
                    .buttonStyle(.borderedProminent)

                    Link(destination: URL(string: app.homepage)!) {
                        Label("Official Site", systemImage: "safari")
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
        .padding(24)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 18))
    }

    private var facts: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 12) {
            FactCard(title: "Replaces", value: app.paidAlternatives.joined(separator: ", "))
            FactCard(title: "License", value: app.license)
            FactCard(title: "Price", value: app.price)
            FactCard(title: "Architecture", value: app.architecture.joined(separator: ", "))
        }
    }

    private var trust: some View {
        DetailSection(title: "Trust signals") {
            FlowLayout(spacing: 8) {
                ForEach(app.trust + app.badges, id: \.self) { item in
                    Label(item, systemImage: "checkmark.seal")
                        .font(.callout)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .background(Color.green.opacity(0.12), in: RoundedRectangle(cornerRadius: 9))
                }
            }
        }
    }

    private var notes: some View {
        DetailSection(title: "Why it belongs here") {
            Text(app.notes)
                .foregroundStyle(.secondary)
                .lineSpacing(3)
        }
    }

    private var comparison: some View {
        DetailSection(title: "Compare tray") {
            Grid(alignment: .leading, horizontalSpacing: 14, verticalSpacing: 10) {
                GridRow {
                    Text("App").bold()
                    Text("Replaces").bold()
                    Text("License").bold()
                    Text("Price").bold()
                }
                Divider().gridCellColumns(4)
                ForEach(store.comparedApps) { item in
                    GridRow {
                        Text(item.name)
                        Text(item.paidAlternativeSummary)
                        Text(item.license)
                        Text(item.price)
                    }
                    .font(.callout)
                }
            }
        }
    }
}

struct FactCard: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.callout.weight(.semibold))
                .lineLimit(3)
        }
        .frame(maxWidth: .infinity, minHeight: 82, alignment: .leading)
        .padding(14)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}

struct DetailSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.title3.bold())
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

