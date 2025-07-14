# TODO / Progress Log

## Global AuthProvider Implementation
- Added `src/contexts/AuthContext.tsx` with a global AuthProvider and `useAuth` hook for Supabase auth state.
- Wrapped the app in AuthProvider in `src/app/layout.tsx`.
- All components/pages can now access `user` and `isAuthLoading` from context.

## Strava Verification Badge
- Updated `StravaVerificationBadge.tsx` to use the global auth state.
- Badge now uses the logged-in user's email if no prop is provided.
- Shows a loading spinner while auth is loading, preventing stuck badge states.

## General Improvements
- Removed all `.single()` and `.maybeSingle()` from user-facing Supabase queries to prevent Accept header/406 errors.
- Confirmed clean build and deployment.
- Added recommendations for further migration of user/session logic to the global provider.

## Next Steps (Recommended)
- Migrate other user-dependent components (e.g., StravaVerificationButton, Profile, Sell, Browse) to use `useAuth`.
- Remove redundant local user/session state and loading logic from those components.
- Optionally, add SSR support for auth if needed in the future. 