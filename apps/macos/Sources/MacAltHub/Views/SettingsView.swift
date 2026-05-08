import SwiftUI

struct SettingsView: View {
    @AppStorage("openDownloadsInBrowser") private var openDownloadsInBrowser = true
    @AppStorage("macalthub.update.feed.url") private var updateFeedURL = ""
    @AppStorage("macalthub.update.autoCheck") private var autoCheckForUpdates = true

    var body: some View {
        Form {
            Toggle("Open verified downloads in the default browser", isOn: $openDownloadsInBrowser)
            Toggle("Check for updates when the catalog opens", isOn: $autoCheckForUpdates)
            TextField("Update feed URL", text: $updateFeedURL)
                .textFieldStyle(.roundedBorder)
            Text("MacAltHub resolves official download targets but never runs installers for you.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        }
        .formStyle(.grouped)
        .padding()
        .frame(width: 460)
    }
}
