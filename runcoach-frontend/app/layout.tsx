export const metadata = { title: "Run Coach AI", description: "Mobile/Web MVP" };

import "./globals.css";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
