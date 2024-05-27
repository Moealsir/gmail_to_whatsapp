import os
import time
import pickle
import base64
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
import json

# Custom JSON Encoder to handle datetime serialization
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return json.JSONEncoder.default(self, obj)

# Set up the Gmail API
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
creds = None

# Load credentials
if os.path.exists('token.pickle'):
    with open('token.pickle', 'rb') as token:
        creds = pickle.load(token)

# If no valid credentials, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)

    # Save the credentials for the next run
    with open('token.pickle', 'wb') as token:
        pickle.dump(creds, token)

# Load the last processed time
last_processed_time_file = 'last_processed_time.json'
if os.path.exists(last_processed_time_file):
    with open(last_processed_time_file, 'r') as f:
        last_processed_time = datetime.fromisoformat(json.load(f))
else:
    last_processed_time = datetime.utcnow() - timedelta(minutes=5)

# Function to check for new emails
def check_new_emails():
    try:
        service = build('gmail', 'v1', credentials=creds)
        query = f'after:{int(last_processed_time.timestamp())}'
        results = service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])

        if not messages:
            return []

        new_emails = []
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id']).execute()
            msg_data = msg['payload']['headers']

            sender_name = ''
            sender_email = ''
            subject = ''
            body = ''  # Default value for body
            for header in msg_data:
                if header['name'] == 'From':
                    sender = header['value']
                    sender_name, sender_email = parse_sender(sender)

                if header['name'] == 'Subject':
                    subject = header['value']

            if 'parts' in msg['payload']:
                for part in msg['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                        break
            else:
                if 'body' in msg['payload']:
                    body = base64.urlsafe_b64decode(msg['payload']['body']['data']).decode('utf-8')

            email_time = datetime.fromtimestamp(int(msg['internalDate']) / 1000)
            new_emails.append((email_time, sender_name, sender_email, subject, body))

        # Dump new emails as JSON with custom encoder
        with open('emails.json', 'w') as f:
            json.dump(new_emails, f, cls=DateTimeEncoder, indent=4)
        return new_emails

    except HttpError as error:
        print(f'An error occurred: {error}')
        return []

# Function to parse sender's name and email address
def parse_sender(sender):
    sender = sender.split('<')
    if len(sender) > 1:
        sender_name = sender[0].strip()
        sender_email = sender[1].replace('>', '').strip()
    else:
        sender_name = ''
        sender_email = sender[0].strip()
    return sender_name, sender_email


last_emails = []
while True:
    new_emails = check_new_emails()

    # Remove last processed emails from new emails if found
    new_emails = [email for email in new_emails if email not in last_emails]

    print('new_emails:', new_emails)

    if new_emails:
        for email in new_emails:
            email_time, sender_name, sender_email, subject, body = email
            if email_time > last_processed_time:
                print('sender name:', sender_name)
                print('sender email:', sender_email)
                print('subject:', subject)
                print('body:', body)
                print('Email Time:', email_time)
                last_processed_time = email_time

        # Save the last processed emails for future comparison
        last_emails = new_emails

    else:
        print('No new emails.')
        # If no new emails, overwrite emails.json with an empty list
        with open('emails.json', 'w') as f:
            json.dump([], f)

    # Save the last processed time only if there are new emails
    with open(last_processed_time_file, 'w') as f:
        json.dump(last_processed_time.isoformat(), f)

    # Dump the latest information into emails.json
    with open('emails.json', 'w') as f:
        print('Dumping new emails...', new_emails)
        json.dump(new_emails, f, cls=DateTimeEncoder, indent=4)

    time.sleep(60)  # Wait for 1 minute
    print(datetime.now())
    print('Checking for new emails...')
