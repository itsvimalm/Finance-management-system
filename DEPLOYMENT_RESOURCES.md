# Project Deployment Resources

This project is a MERN-stack application (MongoDB/GoogleSheets, Express, React, Node.js). To host it online, you need to deploy the **Client (Frontend)** and the **Server (Backend)** separately, as they run in different environments.

## 1. Hosting the Client (Frontend) on Netlify

Netlify is excellent for hosting the React frontend.

### Steps:
1.  **Push to GitHub**: Ensure your `client` folder is in your GitHub repository.
2.  **Create New Site in Netlify**:
    *   Connect your GitHub repository.
    *   **Base Directory**: `client` (Important! This tells Netlify where the frontend code lives).
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
3.  **Environment Variables (Netlify)**:
    *   Go to **Site Settings > Environment variables**.
    *   Add `VITE_API_URL`: This should be the URL of your deployed backend (see Section 2).
    *   *Example*: `https://my-cellfinanc-server.onrender.com/api`

*Note: A `netlify.toml` file has been added to the `client` directory to handle page routing (preventing 404s on refresh).*

---

## 2. Hosting the Server (Backend)

Netlify is primarily for static sites. You need a platform that supports Node.js/Express for the backend. **Render** (render.com) or **Railway** (railway.app) are popular free/cheap options.

### Recommended: Render.com
1.  **Create New Web Service**.
2.  Connect your GitHub repository.
3.  **Root Directory**: `server`
4.  **Build Command**: `npm install`
5.  **Start Command**: `node index.js` (or `npm start`)
6.  **Environment Variables (Render)**:
    *   `PORT`: `5000` (or let Render assign one)
    *   `JWT_SECRET`: Your secret key for authentication.
    *   `GOOGLE_SHEETS_CLIENT_EMAIL`: From your Google Service Account credentials.
    *   `GOOGLE_SHEETS_PRIVATE_KEY`: From your Google Service Account credentials.
    *   `GOOGLE_SHEET_ID`: The ID of your database spreadsheet.

### Important Note on Google Sheets Auth:
When adding `GOOGLE_SHEETS_PRIVATE_KEY` to Render/Railway/Netlify, ensure you copy the **entire** key, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. If you encounter line-break issues, you might need to replace actual newlines with `\n` in the environment variable value.

---

## 3. Connecting Them

1.  **Deploy Backend first**: Get your live backend URL (e.g., `https://cellfinanc-api.onrender.com`).
2.  **Update Frontend**: Go back to your Netlify dashboard for the client.
3.  **Set `VITE_API_URL`**: Update this variable to `https://cellfinanc-api.onrender.com/api` (ensure it ends with `/api` if your router expects it, or just the base domain depending on your `axios` config).
    *   *Current Config uses*: `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`
    *   So, set the variable to: `https://cellfinanc-api.onrender.com/api`
4.  **Redeploy Frontend**: Trigger a new deployment in Netlify so it builds with the new variable.

## File Structure Reference

- **`client/netlify.toml`**: Configures Netlify redirects for the React Router.
- **`client/src/api/axios.js`**: Configured to look for `VITE_API_URL`.
