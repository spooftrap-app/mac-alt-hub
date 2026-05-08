import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "MacAltHub - Paid Mac App Alternatives",
  description:
    "A clean macOS-style hub for verified direct-download alternatives to paid Mac utilities.",
  metadataBase: new URL("https://macalthub.local"),
  openGraph: {
    title: "MacAltHub",
    description: "Verified alternatives to paid macOS utility apps.",
    type: "website"
  },
  icons: {
    icon: `${basePath}/assets/macalthub-mark.svg`,
    apple: `${basePath}/assets/macalthub-mark.svg`
  }
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#f5f7fb",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
