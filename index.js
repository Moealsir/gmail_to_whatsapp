const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

const users = require('./credentials.json').users;

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: `wb_db`
    }),
    puppeteer: { headless: true }
});

let filteredEmails = {};
let userPreferences = {};

client.on('ready', () => {
    console.log(`Client is ready!`);
    users.forEach(user => {
        client.sendMessage(user.number, '👋 Hello from Sono!');
        loadUserPreferences(user.number);
    });
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log(`Authenticated`);
});

client.on('auth_failure', (message) => {
    console.error(`Auth failure: ${message}`);
});

client.on('disconnected', (reason) => {
    console.log(`Client disconnected: ${reason}`);
});

function sendNewEmails() {
    users.forEach(user => {
        const userNumber = user.number;
        if (userPreferences[userNumber].serviceRunning) {
            try {
                const emailData = fs.readFileSync(`users/${userNumber}/${userNumber}_emails.json`, 'utf-8');
                const newEmails = JSON.parse(emailData);

                if (newEmails.length > 0) {
                    newEmails.forEach(email => {
                        const emailTime = email[0];
                        const senderName = email[1];
                        const senderEmail = email[2];
                        const subject = email[3];
                        const body = email[4];

                        if (!filteredEmails[userNumber].includes(senderEmail.toLowerCase())) {
                            sendMessage(userNumber, senderName, senderEmail, subject, body);
                        }
                    });
                    console.log(`All emails sent for ${userNumber}.`);
                }
            } catch (error) {
                console.error(`Error reading or parsing users/${userNumber}/${userNumber}_emails.json:`, error);
            }
        }
    });
}

function sendMessage(userNumber, senderName, senderEmail, subject, body) {
    const message = `*${senderName}* <${senderEmail}>\nSubject: ${subject}\n\n${body}`;
    client.sendMessage(userNumber, message).catch(err => {
        console.error('Error sending message:', err);
    });
}

function loadFilteredEmails() {
    users.forEach(user => {
        const userNumber = user.number;
        try {
            const filteredData = fs.readFileSync(`users/${userNumber}/${userNumber}_filtered_emails.json`, 'utf-8');
            filteredEmails[userNumber] = JSON.parse(filteredData).map(email => email.toLowerCase()).sort();
        } catch (error) {
            if (error.code === 'ENOENT') {
                // If the file does not exist, create an empty array for filtered emails
                filteredEmails[userNumber] = [];
                saveFilteredEmails(userNumber);
            } else {
                console.error(`Error reading or parsing users/${userNumber}/${userNumber}_filtered_emails.json:`, error);
            }
        }
    });
}

function saveFilteredEmails(userNumber) {
    try {
        filteredEmails[userNumber].sort();
        fs.writeFileSync(`users/${userNumber}/${userNumber}_filtered_emails.json`, JSON.stringify(filteredEmails[userNumber], null, 2));
    } catch (error) {
        console.error(`Error saving filtered emails for ${userNumber}:`, error);
    }
}

function loadUserPreferences(userNumber) {
    try {
        const prefsData = fs.readFileSync(`users/${userNumber}/${userNumber}_preferences.json`, 'utf-8');
        userPreferences[userNumber] = JSON.parse(prefsData);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the file does not exist, initialize with default preferences
            userPreferences[userNumber] = { serviceRunning: true };
            saveUserPreferences(userNumber);
        } else {
            console.error(`Error reading or parsing users/${userNumber}/${userNumber}_preferences.json:`, error);
        }
    }
}

function saveUserPreferences(userNumber) {
    try {
        fs.writeFileSync(`users/${userNumber}/${userNumber}_preferences.json`, JSON.stringify(userPreferences[userNumber], null, 2));
    } catch (error) {
        console.error(`Error saving preferences for ${userNumber}:`, error);
    }
}

client.on('message', async message => {
    const user = users.find(user => user.number === message.from);
    if (user) {
        const userNumber = user.number;
        const bodyLower = message.body.toLowerCase();

        if (bodyLower.startsWith('add ') || bodyLower.startsWith('delete ')) {
            const command = bodyLower.split(' ')[0];
            const emails = message.body.slice(command.length).split(/[\s,;\r\n]+/).filter(Boolean).map(email => email.toLowerCase());

            if (command === 'add') {
                emails.forEach(email => {
                    if (!filteredEmails[userNumber].includes(email)) {
                        filteredEmails[userNumber].push(email);
                    }
                });
                saveFilteredEmails(userNumber);
                client.sendMessage(userNumber, `Added ${emails.join(', ')} to filtered emails.`);
            } else if (command === 'delete') {
                let deletedEmails = [];
                emails.forEach(email => {
                    const index = filteredEmails[userNumber].indexOf(email);
                    if (index !== -1) {
                        filteredEmails[userNumber].splice(index, 1);
                        deletedEmails.push(email);
                    }
                });
                saveFilteredEmails(userNumber);
                client.sendMessage(userNumber, `Deleted ${deletedEmails.join(', ')} from filtered emails.`);
            }
        } else if (bodyLower === 'emails') {
            let listMessage = 'Filtered Emails:\n';
            filteredEmails[userNumber].forEach((email, index) => {
                listMessage += `${index + 1}. ${email}\n`;
            });
            client.sendMessage(userNumber, listMessage);
        } else if (bodyLower === 'stop') {
            userPreferences[userNumber].serviceRunning = false;
            saveUserPreferences(userNumber);
            client.sendMessage(userNumber, 'Service stopped. Send "start" to resume.');
        } else if (bodyLower === 'start') {
            userPreferences[userNumber].serviceRunning = true;
            saveUserPreferences(userNumber);
            client.sendMessage(userNumber, 'Service resumed.');
        }
    }
});

cron.schedule('* * * * *', () => {
    loadFilteredEmails();
    sendNewEmails();
    users.forEach(user => saveFilteredEmails(user.number));
});

loadFilteredEmails();
client.initialize();
console.log('Initializing client...');
