// oauth2.js
import 'dotenv/config';
import crypto from 'node:crypto';
import http from 'node:http';
import { URL, URLSearchParams } from 'node:url';
import fs from 'node:fs/promises';
import open from 'open';
import 'dotenv/config';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;  // e.g. http://127.0.0.1:8080
const TOKEN_FILE = 'tokens.json';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/* -------- helper: PKCE strings -------- */
function base64url(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function genVerifier() {
    return base64url(crypto.randomBytes(32));          // 43 chars
}
function genChallenge(verifier) {
    return base64url(crypto.createHash('sha256').update(verifier).digest());
}

/* -------- main routine -------- */
(async () => {
    const code_verifier = genVerifier();
    const code_challenge = genChallenge(code_verifier);

    // build auth URL
    const auth = new URL(AUTH_ENDPOINT);
    auth.search = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/youtube',
        code_challenge: code_challenge,
        code_challenge_method: 'S256',
        access_type: 'offline',           // get refresh_token
        prompt: 'consent',
    }).toString();

    // tiny local HTTP server to catch redirect
    const { hostname, port, pathname } = new URL(REDIRECT_URI);
    const server = http.createServer();
    const codePromise = new Promise(resolve => {
        server.on('request', (req, res) => {
            if (req.url.startsWith(pathname)) {
                const url = new URL(req.url, REDIRECT_URI);
                const authCode = url.searchParams.get('code');
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end('<h1>Auth complete – you can close this tab.</h1>');
                resolve(authCode);
            }
        }).listen(port, hostname, () => {
            console.log(`Waiting on ${REDIRECT_URI}`);
        });
    });

    // open browser
    console.log('Opening browser for Google consent…');
    await open(auth.toString());

    // wait for code
    const authCode = await codePromise;
    server.close();

    // exchange code → tokens
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: REDIRECT_URI,
        code_verifier,
    });

    const resp = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    const tokens = await resp.json();          // {access_token, refresh_token, …}

    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    console.log(`Saved tokens → ${TOKEN_FILE}`);
})();
