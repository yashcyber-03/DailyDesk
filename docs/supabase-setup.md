# Supabase setup (accounts, dashboard and synced tools)

You need a free Supabase account: https://supabase.com

## 1. Create a project
1. Click **New project**, choose a name, a strong database password (save it somewhere safe) and the region closest to your users.
2. Wait a minute or two until the project is ready.

## 2. Create the database tables
1. Open your project, then **SQL Editor** > **New query**.
2. Open `supabase/migrations/20261101000000_initial_schema.sql` from this project, copy everything, paste it into the editor and press **Run**.
3. You should see "Success". Open **Table Editor** to check that `profiles`, `user_settings`, `favorites`, `notes`, `tasks`, `planner_entries`, `habits` and `tool_history` exist.

Every table has Row Level Security switched on: a signed-in user can only read and change their own rows, and signed-out visitors can read nothing. Only run the file once on a fresh project. If you change the schema later, add a new migration file instead of editing this one.

## 3. Copy your keys into `.env.local`
In **Project Settings > API Keys** (or **Connect**) copy:
- Project URL: `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key (starts with `sb_publishable_`): `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Older projects can use the `anon` key and the name `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Optional, for the "Delete account" button only: the secret / service role key as `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses all security rules. Never put `NEXT_PUBLIC_` in front of it, never commit it and never share it.

Restart `npm run dev` after editing `.env.local`.

## 4. Configure sign-in
In **Authentication**:
- **URL Configuration > Site URL**: `http://localhost:3000` while testing; your real domain after deploying.
- **URL Configuration > Redirect URLs**: add `http://localhost:3000/auth/callback` and, later, `https://your-domain.com/auth/callback` (and the `*.vercel.app` preview URL if you test there).
- **Sign In / Providers > Email**: keep "Confirm email" on for production. For quick local tests you can switch it off.
- Set the minimum password length to 8 or more, and turn on leaked-password protection if your plan offers it.
- Email limits: the built-in email sender is only meant for testing and has a very low hourly limit. Before launch connect your own SMTP service under **Authentication > SMTP Settings**.

## 5. Try it
1. Go to http://localhost:3000/signup and create an account (confirm the email if required).
2. Open **To-Do List**, add a task, then check **Table Editor > tasks**.
3. Open the dashboard at `/dashboard`.
4. Use a second private window: confirm you cannot see the first account's data.

## Deploying to Vercel
Add the same variables under **Project Settings > Environment Variables**, then redeploy. Add your production URL to the Supabase redirect URLs.

## Good to know
- Guests keep using every tool. Their tasks, notes, planner and habits stay in the browser. When they log in they can choose to move them to their account.
- The `plan` (free or Pro) will NOT be stored in `user_settings`, because users are allowed to edit that table. Billing data will go in a separate table that only the server can write.
- Per-user limits are enforced in the database (for example 500 notes, 1000 tasks) so one account cannot fill your storage.
