import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google OAuth URL Endpoint
  app.get('/api/auth/google/url', (req, res) => {
    // Use APP_URL if available (injected by platform), otherwise fall back to request headers
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${baseUrl}/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '661407311422-matukv0ebjjqndad0fjr77b7h9184dba.apps.googleusercontent.com',
      redirect_uri: redirectUri,
      response_type: 'token', // Using Implicit Flow for client-side upload simplicity
      scope: 'https://www.googleapis.com/auth/drive.file', // Scope to upload files
      include_granted_scopes: 'true',
      state: 'pass-through value'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // OAuth Callback Handler (for Implicit Flow, the token is in the hash, so this route just serves a page to extract it)
  // However, for 'response_type=token', the redirect happens on the client side hash.
  // If we used 'response_type=code', we would exchange it here.
  // Given the iframe constraint, let's stick to the popup flow where the popup redirects to /auth/callback
  // and that page posts the message back.
  
  app.get('/auth/callback', (req, res) => {
    // This page is loaded in the popup after Google redirects.
    // For Implicit Flow, the token is in the URL hash (e.g. #access_token=...)
    // We need a script to extract it and send it to the opener.
    res.send(`
      <html>
        <body>
          <script>
            // Function to parse hash params
            function getHashParams() {
              const hash = window.location.hash.substring(1);
              const params = {};
              hash.split('&').forEach(part => {
                const [key, value] = part.split('=');
                params[key] = decodeURIComponent(value);
              });
              return params;
            }

            const params = getHashParams();
            const accessToken = params.access_token;

            if (accessToken) {
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token: accessToken }, '*');
                window.close();
              } else {
                document.body.innerHTML = 'Authentication successful. You can close this window.';
              }
            } else {
              // Handle error or 'code' flow if we switched to that
              const urlParams = new URLSearchParams(window.location.search);
              const error = urlParams.get('error');
              if (error) {
                document.body.innerHTML = 'Authentication failed: ' + error;
              } else {
                 // If no hash, maybe it's the code flow? But we requested 'token'.
                 document.body.innerHTML = 'Processing...';
              }
            }
          </script>
          <p>Authenticating with Google Drive...</p>
        </body>
      </html>
    `);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving (if needed in future)
    app.use(express.static(path.join(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
