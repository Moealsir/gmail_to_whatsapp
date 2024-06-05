const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const {
    SCOPES,
    USERS_DIR,
    CREDENTIALS_FILE,
    ReadCredentials,
    GetUserEmails,
    GetEmailCredentials,
    CreateUserDirectory,
    SaveToken,
    LoadToken,
    UpdateAuthorizationStatus,
    UserAuthorized,
    getOauth2Client
} = require('./auth');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 5001;
const BASE_URL = 'https://auth.moealsir.tech';

(async () => {
    await ReadCredentials();
    app.get('/', async (req, res) => {
        res.send('Welcome to the Gmail Authorization App');
    });

    app.get('/authorize', async (req, res) => {
        const { user_id, email_id } = req.query;

        try {
            const user_emails = await GetUserEmails(user_id);
            if (!user_emails.length) {
                console.error(`User ID ${user_id} not found.`);
                return res.json({ 'error': 'User ID not found.' });
            }
            if (!user_emails.includes(email_id)) {
                console.error(`Email ID ${email_id} not found in user emails.`);
                return res.json({ 'error': 'Email ID not found in user emails.' });
            }
            const is_authorized = await UserAuthorized(user_id, email_id);
            if (is_authorized) {
                return res.json({ 'message': 'User is already authorized.' });
            }

            const email_creds = await GetEmailCredentials(email_id);
            const client_id = email_creds.web.client_id;
            const client_secret = email_creds.web.client_secret;

            const oauth2Client = getOauth2Client(client_id, client_secret, `${BASE_URL}/oauth2callback`);
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: SCOPES,
                state: JSON.stringify({ user_id, email_id })
            });

            res.redirect(authUrl);
        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ 'error': `${err.message}` });
        }
    });

    app.get('/oauth2callback', async (req, res) => {
        try {
            const state = JSON.parse(req.query.state);
            if (!state) {
                return res.status(400).json({ 'error': 'Invalid state parameter.' });
            }

            const user_id = state.user_id;
            const email_id = state.email_id;

            const state_path = path.join(USERS_DIR, user_id, email_id);
            if (!fs.existsSync(state_path)) {
                await CreateUserDirectory(user_id, email_id);
            }
            const email_creds = await GetEmailCredentials(email_id);
            const client_id = email_creds.web.client_id;
            const client_secret = email_creds.web.client_secret;

            const oauth2Client = new google.auth.OAuth2(client_id, client_secret, `${BASE_URL}/oauth2callback`);

            const { tokens } = await oauth2Client.getToken(req.query.code);

            tokens.refresh_token = tokens.refresh_token || req.query.refresh_token;
            tokens.client_id = client_id;
            tokens.client_secret = client_secret;

            await SaveToken(user_id, email_id, tokens);

            // flag user authorized in credentials
            const status = true;
            await UpdateAuthorizationStatus(user_id, email_id, status);
            return res.json({ 'message': 'Authorization successful.' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 'error': `${err.message}` });
        }
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    });
})();

