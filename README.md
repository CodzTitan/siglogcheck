Setup and Deployment Instructions: Signup/Login MVP

This guide provides steps to configure, link, and deploy your complete user authentication system from a single GitHub repository using Netlify for the frontend, Render for the backend API, and Supabase as the database identity engine.

1. Setup Your Database (Supabase)

Go to supabase.com and create a free account.

Click New Project and name it (e.g., MVP Auth Engine). Save your database password safely.

Once the dashboard spins up, go to Project Settings (the gear icon at the bottom left) > API.

Securely copy:

Project API URL (e.g., https://xxxxxx.supabase.co)

Anon Public API Key (e.g., eyJhbGciOi...)

Note: Supabase has dynamic signup configurations automatically configured out-of-the-box. Email verification is turned on by default. If you register a user, they must click the email link inside their mailbox to get an active JWT session. You can turn this off for rapid MVP testing under Authentication > Providers > Email > Confirm Email (Disable toggle).

2. Prepare Your GitHub Repository

Organize your single Git repository like this:

├── index.html        <-- Your Netlify Frontend (deploy directly)
├── server.js         <-- Your Render Node/Express API code
├── package.json      <-- Backend package metadata
├── .env              <-- Local development secrets (DO NOT COMMIT!)
└── README.md         <-- This file


Commit and push all files to your GitHub repository.

3. Run and Verify Locally First

To test on your local machine before pushing online:

Inside your project folder, create a .env file with your copied Supabase secrets:

PORT=5000
SUPABASE_URL=[https://your-copied-id.supabase.co](https://your-copied-id.supabase.co)
SUPABASE_ANON_KEY=your-copied-anon-key
# Local development whitelist
ALLOWED_ORIGINS=http://localhost:5500,[http://127.0.0.1:5500](http://127.0.0.1:5500)


Install packages and run the server locally:

npm install
npm start


Run index.html locally inside your browser (using VS Code Live Server at port 5500 or just open the file).

Verify the top URL input points to http://localhost:5000, click Verify API Ping, and register an account!

4. Deploy Your Backend on Render

Go to render.com and connect your GitHub account.

Select New > Web Service.

Link your current GitHub Repository containing the files.

Set the following system parameters:

Name: auth-mvp-api

Language / Runtime: Node

Build Command: npm install

Start Command: npm start

Instance Type: Free

Click Advanced and add these required Environment Variables:

SUPABASE_URL: (Your copied URL)

SUPABASE_ANON_KEY: (Your copied key)

ALLOWED_ORIGINS: https://your-deployed-site.netlify.app (Copy this from Netlify once deployed, or update it later)

Click Deploy Web Service and copy the live endpoint URL Render provisions for you (e.g., https://auth-mvp-api.onrender.com).

5. Deploy Your Frontend on Netlify

Log in to netlify.com and click Add new site > Import an existing project.

Connect your GitHub account and select your repository.

Configure the build parameters:

Base directory: Leave blank (or / if root)

Build command: Leave blank (Netlify detects a simple HTML layout and deploys static files instantly!)

Publish directory: Leave blank or set .

Click Deploy Site.

Once complete, copy the generated .netlify.app domain.

6. Align CORS Security Settings

To completely prevent standard CORS blockades, align your endpoints:

In your Render Dashboard Environment Variables for the API service, update ALLOWED_ORIGINS to contain your newly created production Netlify link (e.g., https://your-custom-site-name.netlify.app). Save and let Render auto-redeploy.

Open your deployed Netlify production website link in the browser.

In the API URL input field at the top, paste your deployed Render endpoint link (https://your-service.onrender.com).

Click Verify API Ping to witness the complete cross-origin secure system function live on the web!
