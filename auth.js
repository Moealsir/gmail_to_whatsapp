// auth.js

const {google} = require('googleapis');
const {OAuth2Client, auth} = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');


const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

let cred_redirecturi = 'http://auth.moealsir.tech/oauth2callback';
let creds_data = {};
let users = [];
let emails = [];

const CREDENTIALS_FILE = 'credentials.json';
const USERS_DIR = 'users';

async function ReadCredentials() {
    try {
        const data = await fs.readFile(CREDENTIALS_FILE, 'utf8');
        creds_data = JSON.parse(data);
        users = creds_data.users || [];
        emails = creds_data.emails || [];
        return creds_data;
    } catch (err) {
        console.error('Error reading credentials: ${err.message}');
    }
}

async function GetUserEmails(user_id) {
    try {
        for (const user of users) {
            if (user.user_id === user_id) {
                return user.emails.map(email => email.email);
            }
        }
        throw new Error('User ID not found');
    } catch (err) {
        console.error(`Error fetching emails for user ${user_id}: ${err.message}`);
        throw err;
    }
}

async function GetEmailCredentials(email_id) {

    try {
        for (const email of emails) {
            if (email.email === email_id) {
                const credentials = email.gmail_credentials;
                return {
                    "web": {
                        client_id: credentials.client_id,
                        client_secret: credentials.client_secret,
                        auth_uri: credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
                        token_uri: credentials.token_uri || 'https://oauth2.googleapis.com/token',
                        auth_provider_x509_cert_url: credentials.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs',
                        redirect_uris: credentials.redirect_uris || [cred_redirecturi],
                    }
                };
            }
        }
        throw new Error('Email ID not found in credentials file.');
    } catch (err) {
        console.error(`Error loading credentials for email ${email_id}: ${err.message}`);
        throw err;
    }
}

async function CreateUserDirectory(user_id, email_id = null) {
    let user_directory = path.join(USERS_DIR, user_id);
    if (email_id) {
        user_directory = path.join(user_directory, email_id);
    }
    try {
        await fs.mkdir(user_directory, { recursive: true });
        return user_directory;
    } catch (err) {
        console.error(`Error creating user directory: ${err.message}`);
        throw err;
    }
}

async function SaveToken(user_id, email_id, tokens) {
    try {
        const userDirectory = await CreateUserDirectory(user_id, email_id);
        const tokenPath = path.join(userDirectory, 'tokens.json');
        await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
        console.log(`Tokens Saved to ${tokenPath}`);
    } catch (err) {
        console.error(`Error saving tokens: ${err.message}`);
        throw err;
    }
}

async function LoadToken(user_id, email_id) {
    try {
        const user_directory = path.join(USERS_DIR, user_id, email_id);
        const tokenPath = path.join(user_directory, 'tokens.json');
        const token = await fs.readFile(tokenPath, 'utf8');
        return JSON.parse(token);
    } catch (err) {
        return null;
    }
}

async function UpdateAuthorizationStatus(user_id, email_id, status) {
    try {
        const creds = await ReadCredentials();
        const user = creds.users.find(user => user.user_id === user_id);
        if (user) {
            const email = user.emails.find(email => email.email === email_id);
            if (email) {
                email.authorized = status;
                await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(creds, null, 2));
                console.log(`Authorization status updated for ${email_id}: ${status}`);
            } else {
                throw new Error('Email ID not found for the user.');
            }
        } else {
            throw new Error('User ID not found.');
        }
    } catch (err) {
        console.error(`Error updating authorization status: ${err.message}`);
        throw err;
    }
}

async function UserAuthorized(user_id, email_id) {
    try {
        const creds = await ReadCredentials();
        const user = creds.users.find(user => user.user_id === user_id);
        if (user) {
            const email = user.emails.find(email => email.email === email_id);
            if (email) {
                return email.authorized;
            } else {
                throw new Error('Email ID not found for the user.');
            }
        } else {
            throw new Error('User ID not found.');
        }
    } catch (err) {
        console.error(`Error updating authorization status: ${err.message}`);
        throw err;
    }
}

function getOauth2Client(clientId, clientSecret, redirectUri) {
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

module.exports = {
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
}