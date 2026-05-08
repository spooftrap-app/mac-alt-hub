import SwiftUI

struct CompareTrayView: View {
    @EnvironmentObject private var store: CatalogStore

    var body: some View {
        HStack(spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Compare")
                    .font(.caption.weight(.bold))
                Text("\(store.comparedApps.count)/3 selected")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            ForEach(store.comparedApps) { app in
                Button {
                    store.toggleCompare(app)
                } label: {
                    AsyncImage(url: app.iconURL) { image in
                        image.resizable().scaledToFit()
                    } placeholder: {
                        Image(systemName: "app")
                    }
                    .frame(width: 22, height: 22)
                }
                .buttonStyle(.plain)
                .help("Remove \(app.name)")
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
        .shadow(radius: 14, y: 8)
    }
}

