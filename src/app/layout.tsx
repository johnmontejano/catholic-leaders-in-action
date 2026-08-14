import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { assetPath } from "@/lib/asset-path";
import "./globals.css";

const atkinson = localFont({
  src: "../assets/fonts/atkinson-hyperlegible-next-latin.woff2",
  variable: "--font-atkinson",
  display: "swap",
  weight: "200 800",
  fallback: ["Arial", "sans-serif"],
});

const stix = localFont({
  src: "../assets/fonts/stix-two-text-latin.woff2",
  variable: "--font-stix",
  display: "optional",
  weight: "400 700",
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://catholicleadersinaction.org"),
  title: {
    default: "Catholic Leaders in Action | San Francisco Bay Area",
    template: "%s | Catholic Leaders in Action",
  },
  description:
    "Form your faith, find your people, and put Catholic Social Teaching into action with young Catholics in the San Francisco Bay Area.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Catholic Leaders in Action",
    title: "Catholic Leaders in Action",
    description:
      "A community of young Catholics rooted in Christ, leading with conviction.",
    images: [
      {
        url: "/images/community-reception-wide.png",
        width: 1870,
        height: 1446,
        alt: "Young Catholic adults gather in conversation in a parish hall.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catholic Leaders in Action",
    description:
      "Form your faith. Find your people. Put Catholic Social Teaching into action.",
    images: ["/images/community-reception-wide.png"],
  },
  icons: {
    icon: assetPath("/icon.svg"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${atkinson.variable} ${stix.variable}`}>{children}</body>
    </html>
  );
}
