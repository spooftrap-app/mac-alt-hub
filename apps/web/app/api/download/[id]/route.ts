import { NextResponse } from "next/server";
import { getAppById, isBlockedDownloadUrl } from "@macalthub/catalog";

type GitHubRelease = {
  html_url?: string;
  assets?: Array<{
    name: string;
    browser_download_url: string;
  }>;
};

type HomebrewCask = {
  url?: string;
};

const headers = {
  "user-agent": "MacAltHub download resolver"
};

async function resolveDownload(id: string): Promise<string | null> {
  const app = getAppById(id);
  if (!app) {
    return null;
  }

  if (app.resolver.kind === "github-release") {
    const response = await fetch(`https://api.github.com/repos/${app.resolver.repo}/releases/latest`, {
      headers,
      next: { revalidate: 60 * 60 * 6 }
    });

    if (!response.ok) {
      return app.resolver.fallbackUrl;
    }

    const release = (await response.json()) as GitHubRelease;
    const regex = new RegExp(app.resolver.assetRegex, "i");
    const asset = release.assets?.find((candidate) => regex.test(candidate.name));
    return asset?.browser_download_url ?? app.resolver.fallbackUrl;
  }

  if (app.resolver.kind === "homebrew-cask") {
    const response = await fetch(`https://formulae.brew.sh/api/cask/${app.resolver.token}.json`, {
      headers,
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) {
      return app.resolver.fallbackUrl;
    }

    const cask = (await response.json()) as HomebrewCask;
    return cask.url ?? app.resolver.fallbackUrl;
  }

  return app.resolver.url;
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = await resolveDownload(id);

  if (!url || isBlockedDownloadUrl(url)) {
    return NextResponse.json(
      { error: "No safe direct download target is available for this app yet." },
      { status: 404 }
    );
  }

  return NextResponse.redirect(url, 307);
}

