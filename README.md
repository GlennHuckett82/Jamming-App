# Jammming

A React app to search Spotify and build public playlists (Codecademy Jammming project).

Live
- Production: https://jammming-gph1982-0824.surge.sh/
- Repo: https://github.com/GlennHuckett82/Jamming-App

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
2. Install dependencies
    - powershell
       npm install
3. Start dev server
    - powershell
       npm run dev
4. Build
    - powershell
       npm run build

Env/OAuth
- Client ID is embedded for demo; rotate in Spotify Dashboard if needed.
- Redirect URIs configured in Spotify Dashboard:
   - http://127.0.0.1:3001/
   - https://jammming-gph1982-0824.surge.sh/

Deploy (Surge)
1. Build
    - powershell
       npm run build
2. Publish dist/ to your domain
    - powershell
       npx surge .\dist jammming-gph1982-0824.surge.sh

Notes
- In PowerShell, separate commands with a semicolon if running on one line, e.g.: npm run build; npx surge .\dist jammming-gph1982-0824.surge.sh