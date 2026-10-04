import "./globals.css";

import manifest from "../kaman.app.json";

export const metadata = { title: manifest.ui.title };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
