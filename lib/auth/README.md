# lib/auth

Supabase Auth integration and server-side authorization (P3).

| Module                | Runs as                  | Use for                                                            |
| --------------------- | ------------------------ | ------------------------------------------------------------------ |
| `supabase-browser.ts` | `anon` / signed-in user  | Client Components. Anon key only.                                  |
| `supabase-server.ts`  | signed-in user or `anon` | Server Components, route handlers, server actions. Subject to RLS. |
| `supabase-service.ts` | `service_role`           | Trusted server operations only. **Bypasses RLS.**                  |
| `admin.ts`            | signed-in user           | `getCurrentAdmin`, `isAdmin`, `requireAdmin`                       |
| `config.ts`           | —                        | Environment accessors that fail loudly without echoing values      |

Rules:

- `supabase-server.ts`, `supabase-service.ts` and `admin.ts` import
  `server-only`, so importing them from a Client Component is a build error, not
  a runtime leak.
- Authorization decisions use `auth.getUser()`, which revalidates the token with
  Supabase Auth. Never decide authorization from `auth.getSession()`.
- Every admin route and mutation calls `requireAdmin()`. Row Level Security is
  the second, independent layer — neither is sufficient alone.
- The service-role client is only for operations where the server is the
  authority and has already authorized the caller.
