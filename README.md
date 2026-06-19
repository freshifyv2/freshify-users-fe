# freshify-users-fe

Frontend for the **Users** sovereign module of [Sovereign Portal](https://github.com/freshifyv2/freshify-sovereign-portal).

Mounted under the portal shell at `/dashboard/users/*`. Pairs with [`freshify-users`](https://github.com/freshifyv2/freshify-users) backend.

## What this owns

- Account page — identity, password change, notification preferences, deactivation
- Users list and detail (operator view, cross-tenant)
- Memberships view — which Companies and Workspaces a User belongs to
- Module Settings page for the Users module (Module Admins, Available Roles, Default Role, Capabilities, Registry view)

## What this does NOT own

Pre-auth screens (login, signup, password reset, invite acceptance) live in the [portal shell](https://github.com/freshifyv2/freshify-portal-shell). The shell handles every unauthenticated route; this app starts at `/dashboard/users/*`.

## Run locally

```bash
npm install
cp .env.example .env  # set USERS_SERVICE_URL, COMPANIES_SERVICE_URL, WORKSPACES_SERVICE_URL, PORTAL_SHELL_URL
npm run dev
```

Defaults to `http://localhost:3001`. In production, mounted under the shell — direct access redirects unauthenticated requests to `PORTAL_SHELL_URL/login`.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `USERS_SERVICE_URL` | yes | `freshify-users` backend URL |
| `COMPANIES_SERVICE_URL` | yes | `freshify-companies` backend URL |
| `WORKSPACES_SERVICE_URL` | yes | `freshify-workspaces` backend URL |
| `PORTAL_SHELL_URL` | yes | Used to redirect unauthenticated traffic to the shell's login |
| `SESSION_COOKIE_NAME` | no | Defaults to `sp_session` |
| `PORT` | no | Defaults to `3001` |

## Stack

Next.js 14 (App Router, standalone output). Server Components by default, Client Components only where interactivity requires it. Geist Sans typography. Design tokens shared with the portal shell via `_shell.css`.

## License

Apache 2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE). Copyright 2026 Freshify, Inc.

## Support

- Bugs and feature requests: open an issue. Read [CONTRIBUTING.md](./CONTRIBUTING.md) first.
- Security disclosures: see [SECURITY.md](./SECURITY.md). Do not open a public issue.
- Production deployment, custom modules, architecture review: see [SUPPORT.md](./SUPPORT.md).
