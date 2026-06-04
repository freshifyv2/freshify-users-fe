/**
 * freshify-users-fe — Sovereign Portal Users module FE.
 *
 * assetPrefix lets the portal shell route this FE's static chunks
 * correctly when multiple FE Next.js apps are composed under one host.
 * Without it, /login (rewritten through the shell) tries to load chunks
 * from the shell's /_next/* and the shell 404s them (each FE has its
 * own build ID + chunk hashes).
 *
 * Pattern: every FE owns a unique /_<module>-fe/_next/* URL space, and
 * the shell adds a matching rewrite to forward those prefixed URLs to
 * the right FE service.
 */
const ASSET_PREFIX = "/_users-fe";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  assetPrefix: ASSET_PREFIX,
  async redirects() {
    // Legacy path: the Users module previously surfaced settings under
    // /dashboard/users/list/module-settings. Module settings now live at
    // /dashboard/users/settings. A 308 permanent redirect updates the
    // browser URL bar (server component redirect() did not).
    return [
      {
        source: "/list/module-settings",
        destination: "/settings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
