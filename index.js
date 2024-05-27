const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'wb_db'
    })
});

const my_number = '97439900342@c.us' // Your WhatsApp number

client.on('ready', () => {
    console.log('Client is ready!');
    client.sendMessage(my_number, '👋 Hello! I am ready to receive emails.');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

function sendNewEmails() {
    try {
        const emailData = fs.readFileSync('emails.json', 'utf-8');
        const newEmails = JSON.parse(emailData);

        if (newEmails.length > 0) {
            newEmails.forEach(email => {
                const emailTime = email[0];
                const senderName = email[1];
                const senderEmail = email[2];
                const subject = email[3];
                const body = email[4];

                sendMessage(senderName, senderEmail, subject, body);
            });
            console.log('All emails sent.');
        }
    } catch (error) {
        console.error('Error reading or parsing emails.json:', error);
    }
}

function sendMessage(senderName, senderEmail, subject, body) {
    const message = `*${senderName}* <${senderEmail}>\nSubject: ${subject}\n\n${body}`;
    client.sendMessage(my_number, message).catch(err => {
        console.error('Error sending message:', err);
    });
}

cron.schedule('* * * * *', () => {
    sendNewEmails();
});

client.initialize();