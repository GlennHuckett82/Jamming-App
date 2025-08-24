# Jammming

A React app to search Spotify and build public playlists (Codecademy Jammming project).

Features
- Search for tracks via Spotify Web API
- Add/remove tracks to a local playlist
- Save playlist to your Spotify account

Tech
- React 18 (class components)
- Vite 5
- OAuth 2.0 Authorization Code with PKCE

Setup
1. Install Node 18+
2. Install dependencies:
   npm install
3. Start dev server:
   npm run dev
4. Build:
   npm run build

Env/OAuth
- Client ID is embedded for demo; rotate in Spotify Dashboard if needed.
- Redirect URIs:
  - http://127.0.0.1:3001/
  - https://jammming-gph1982-0824.surge.sh/

Deploy
- Build and publish the dist/ folder with Surge:
  npx surge ./dist jammming-gph1982-0824.surge.sh# Jammming (React + Vite)

A fast React starter for the Jammming project. Includes:

- Vite for dev/build
- Reset CSS
- Google Fonts (Poppins, Work Sans)
- Updated favicon

## Run locally

```powershell
# from the Jammming folder
npm install
npm run dev
```

Then open the shown localhost URL.

## Next steps
- Implement Spotify auth (Implicit Grant or PKCE)
- Components: SearchBar, SearchResults, Playlist, Track
- Save playlist to user account