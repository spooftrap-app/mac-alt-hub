import SwiftUI

struct CatalogHomeView: View {
    @EnvironmentObject private var store: CatalogStore
    @AppStorage("macalthub.update.feed.url") private var updateFeedURL = ""
    @AppStorage("macalthub.update.autoCheck") private var autoCheckForUpdates = true
    @State private var updateResult: UpdateCheckResult?
    @State private var updateError: String?
    @State private var checkingForUpdates = false

    private let updateService = UpdateService()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                hero
                stats
                updateCard
                catalogGrid
            }
            .padding(28)
        }
        .navigationTitle("Catalog")
        .task {
            guard autoCheckForUpdates else { return }
            guard updateResult == nil else { return }
            await checkForUpdates()
        }
    }

    private var hero: some View {
        HStack(alignment: .center, spacing: 22) {
            ZStack {
                RoundedRectangle(cornerRadius: 30)
                    .fill(LinearGradient(colors: [.blue, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing))
                Image(systemName: "sparkles.rectangle.stack.fill")
                    .font(.system(size: 54, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .frame(width: 112, height: 112)
            .shadow(color: .blue.opacity(0.22), radius: 24, y: 12)

            VStack(alignment: .leading, spacing: 8) {
                Text("MACALTHUB \(updateService.currentVersion())")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.blue)
                Text("Catalog")
                    .font(.system(size: 48, weight: .bold))
                Text("Browse verified alternatives to paid Mac utility apps, compare tools, save favorites, and open direct download sources.")
                    .font(.title3)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(24)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 18))
    }

    private var stats: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 4), spacing: 12) {
            FactCard(title: "Apps", value: "\(store.apps.count)")
            FactCard(title: "Categories", value: "\(max(store.categories.count - 1, 0))")
            FactCard(title: "Saved", value: "\(store.savedIDs.count)")
            FactCard(title: "Compare", value: "\(store.comparedApps.count)/3")
        }
    }

    private var updateCard: some View {
        DetailSection(title: "Version and updates") {
            HStack(alignment: .center, spacing: 14) {
                Image(systemName: updateResult?.updateAvailable == true ? "arrow.down.circle.fill" : "checkmark.seal.fill")
                    .font(.title2)
                    .foregroundStyle(updateResult?.updateAvailable == true ? .blue : .green)
                VStack(alignment: .leading, spacing: 4) {
                    Text(updateHeadline)
                        .font(.headline)
                    Text(updateSubheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    Task { await checkForUpdates() }
                } label: {
                    if checkingForUpdates {
                        ProgressView()
                            .controlSize(.small)
                    } else {
                        Label("Check", systemImage: "arrow.clockwise")
                    }
                }
                .disabled(checkingForUpdates)

                if let release = updateResult?.latestRelease, updateResult?.updateAvailable == true {
                    Button("Open Release") {
                        updateService.openRelease(release)
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
    }

    private var catalogGrid: some View {
        DetailSection(title: "\(store.filteredApps.count) catalog apps") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 12)], spacing: 12) {
                ForEach(store.filteredApps.prefix(24)) { app in
                    CatalogHomeCard(app: app)
                }
            }
        }
    }

    private var updateHeadline: String {
        if let updateError {
            return updateError
        }

        if updateResult?.updateAvailable == true, let latest = updateResult?.latestRelease {
            return "MacAltHub \(latest.version) is available"
        }

        return "MacAltHub is up to date"
    }

    private var updateSubheadline: String {
        if let latest = updateResult?.latestRelease {
            return "Current \(updateService.currentVersion()) · Latest \(latest.version) · Feed-backed release metadata"
        }
        return "Current \(updateService.currentVersion()) · Ready for signed release feeds"
    }

    private func checkForUpdates() async {
        checkingForUpdates = true
        defer { checkingForUpdates = false }

        do {
            let feed = updateFeedURL.trimmingCharacters(in: .whitespacesAndNewlines)
            let url = feed.isEmpty ? nil : URL(string: feed)
            updateResult = try await updateService.check(feedURL: url)
            updateError = nil
        } catch {
            updateError = error.localizedDescription
        }
    }
}

struct CatalogHomeCard: View {
    @EnvironmentObject private var store: CatalogStore
    let app: CatalogApp

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                AsyncImage(url: app.iconURL) { image in
                    image.resizable().scaledToFit()
                } placeholder: {
                    Image(systemName: "app.dashed")
                        .foregroundStyle(.secondary)
                }
                .frame(width: 34, height: 34)
                .padding(8)
                .background(Color(hex: app.accent).opacity(0.16), in: RoundedRectangle(cornerRadius: 13))

                VStack(alignment: .leading, spacing: 2) {
                    Text(app.name)
                        .font(.headline)
                        .lineLimit(1)
                    Text(app.category)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Text(app.tagline)
                .font(.callout)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            Text("Replaces \(app.paidAlternativeSummary)")
                .font(.caption.weight(.semibold))
                .lineLimit(1)

            HStack {
                Button("Open") {
                    store.selectedAppID = app.id
                }
                .buttonStyle(.borderedProminent)

                Button {
                    store.toggleCompare(app)
                } label: {
                    Label("Compare", systemImage: store.compareIDs.contains(app.id) ? "checkmark" : "rectangle.2.swap")
                }
                .labelStyle(.iconOnly)
                .buttonStyle(.bordered)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 174, alignment: .topLeading)
        .padding(14)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}
