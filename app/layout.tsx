import "@freshifyv2/portal-shell-ui/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sovereign Portal — Users",
  description: "Login and account management for the Sovereign Portal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
