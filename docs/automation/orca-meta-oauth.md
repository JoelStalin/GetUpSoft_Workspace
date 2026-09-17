# Orca Meta OAuth reusable procedure

## Local secret handling

- Store only `META_CLIENT_ID` and `META_CLIENT_SECRET` in `.env.local`.
- Never store the Facebook account password in the repository or `.env.local`.
- Import the App Secret through `POST http://127.0.0.1:4173/oauth/configure-provider` with provider `meta`, then restart `scripts/start_orca_local.mjs`.

## Redirect URI

- Orca uses the provider-specific setting:
  `META_OAUTH_REDIRECT_URI=https://orca.getupsoft.com/oauth/callback`
- Meta Developers → Facebook Login for Business → Settings → Valid OAuth Redirect URIs must contain the same exact URL.
- Keep Strict Mode and HTTPS enabled.

## Functional verification

1. Run `node scripts/orca_oauth_doctor.mjs` and confirm Meta is ready.
2. Request `/oauth/start?provider=meta&project_id=<project>&user_id=<user>`.
3. Open the returned `authorize_url` in the user's normal Chrome session.
4. Complete only user-required password/MFA interactions onscreen.
5. Confirm the callback stores the encrypted token under `user_id/project_id/provider`.

## Facebook Login for Business

This use case requires a Meta Business Login configuration and its `config_id`.
If Meta reports that the app has no supported permissions, create or select the configuration under Facebook Login for Business → Configurations and use its `config_id` in the authorization request instead of relying only on generic `public_profile,email` scopes.

## Error mapping

- `domain isn't included`: register the exact HTTPS callback under Valid OAuth Redirect URIs.
- `app needs at least one supported permission`: configure Facebook Login for Business and pass its `config_id`.
- OAuth exchange `400`: verify App ID, App Secret, callback equality, authorization-code freshness, and provider-specific redirect selection.
