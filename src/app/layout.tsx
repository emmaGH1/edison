import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { ThemeControl } from "@/components/theme-control";
import "./globals.css";

const bodyFont = localFont({
  src: [
    { path: "../../public/fonts/Public-Sans-400.ttf", weight: "400" },
    { path: "../../public/fonts/Public-Sans-600.ttf", weight: "600" },
  ],
  variable: "--font-public-sans",
  display: "swap",
});
const displayFont = localFont({
  src: [
    { path: "../../public/fonts/Manrope-600.ttf", weight: "600" },
    { path: "../../public/fonts/Manrope-800.ttf", weight: "800" },
  ],
  variable: "--font-manrope",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Edison — See whether AI actually helped",
  description:
    "Same strategy, different AI decisions. Compare policies, inspect missed winners and check the evidence limits.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      suppressHydrationWarning
    >
      <body>
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <ThemeControl />
      </body>
    </html>
  );
}
