# Identity and Data Security

Authentication is handled by Supabase Auth; end-user confirmation emails are
sent by the configured auth email delivery service. The local browser holds only
a **publishable key**. Never commit service-role keys or SMTP passwords.

Supabase Row Level Security protects `feedback` and `community_reports`.
Signed-in users create reports for their own `auth.uid()` and cannot decide
their moderation status. The verified moderator's role is set in server-managed
`app_metadata`, not user-editable metadata. Login refresh may be needed after
role changes. Server-side update guards prevent ordinary users from editing
moderation fields while marking their own outage restored.

User observations are unverified reports and are not official power-provider data.
Avoid including precise addresses, phone numbers or unnecessary personal data.
Please review security advisory recommendations before production expansion.

## Project configuration

- Supabase project reference: `gpsfsjygpfsyrnlidszi`
- Vercel domain: https://powerguard-weather-app.vercel.app
- Expected auth callback domain: https://powerguard-weather-app.vercel.app

Do not enable arbitrary direct SQL from browsers or disable RLS for convenience.
