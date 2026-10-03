import "./globals.css";
import { app } from "./lib/kaman";

export const metadata = { title: app.ui.title };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
