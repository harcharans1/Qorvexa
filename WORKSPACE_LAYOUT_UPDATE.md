# Qorvexa workspace layout update

## Changes
- Added a persistent authenticated workspace sidebar for Dashboard, Learn, My Learning, Achievements, Resume Builder, Marketing Studio, and Profile.
- Added a nested Angular Router outlet so protected pages render in the right content area without tearing down the workspace layout.
- Kept public marketing pages, login, signup, legal pages, and the public course catalogue accessible without signing in.
- Kept existing auth guards on private features and the admin guard on the admin page. Unauthenticated users are redirected to login for private routes.
- Hid the public-site footer while inside the main authenticated workspace so the content area stays focused.
- Added responsive sidebar styling for smaller screens.

## Verification
The route and template changes were reviewed statically. A full Angular build could not be confirmed in this environment because `npm ci` did not finish before the execution timeout. Run `npm ci` and `npm run build` from `frontend/` before deployment.
