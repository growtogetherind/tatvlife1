# The WellMan Co

The WellMan Co is a React/Vite storefront backed by Firebase. Premium wellness products for modern men—hair restoration, skin care, sexual health, and muscle optimization.

## Project Structure
- `/frontend`: React application using Vite.
- `firestore.rules`: Firestore security rules.

## Vercel Deployment
Deploy from the repository root. The root `vercel.json` installs the frontend package, builds the Vite app, and serves `frontend/dist`.

Set these Vercel environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
