# freshify-users-fe

Frontend for the **Users** sovereign module of the Sovereign Portal.

Owns:
- `/login` — phone or email → OTP → session cookie
- `/account` — current user, claims, role assignments
- `/api/otp/request`, `/api/otp/verify`, `/api/logout` — server proxies to `freshify-users` BE

## Composition

This app is composed into the portal at `/dashboard/users/*` via Next.js rewrites in `freshify-portal-shell`. It also serves its own `/login` page directly (the shell does not gate `/login`).

Backend dependency: `freshify-users` Cloud Run service.

## Stack
Next.js 14 App Router · TypeScript · Cloud Run (Docker, port 8080)
