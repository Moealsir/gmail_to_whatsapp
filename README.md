# Email to WhatsApp Forwarder

This project aims to automate the process of retrieving emails and forwarding them to a WhatsApp contact using Python and Node.js. The project consists of two main components: a Python script (`app.py`) responsible for fetching emails from Gmail, and a Node.js script (`index.js`) responsible for sending the retrieved emails to a WhatsApp contact.


## Google API Credentials

### Python Script (`app.py`):

To set up Google API credentials for the Python script (`app.py`), follow these detailed steps:

1. **Create a Project on Google Developers Console**:
   - Go to the [Google Developers Console](https://console.developers.google.com/).
   - If you haven't already, sign in with your Google account.
   - Click on "Select a project" in the top bar and then click on "New Project".
   - Enter a name for your project and click on "Create".

2. **Enable the Gmail API**:
   - In the Google Developers Console, select your project from the top bar.
   - In the left sidebar, navigate to "APIs & Services" > "Library".
   - Search for "Gmail API" and click on it.
   - Click the "Enable" button to enable the Gmail API for your project.

3. **Create Credentials**:
   - After enabling the Gmail API, navigate to "APIs & Services" > "Credentials".
   - Click on "Create credentials" and select "OAuth client ID".
   - Choose "Desktop app" as the application type.
   - Enter a name for the OAuth 2.0 client and click "Create".
   - Once created, click on "Download JSON" to download your credentials file (`credentials.json`).

4. **Place Credentials File**:
   - Move the downloaded `credentials.json` file to the same directory where your `app.py` script is located.
   - Ensure that the filename remains `credentials.json`.

By following these steps, you'll have successfully set up Google API credentials for the Python script, allowing it to access the Gmail API for fetching emails.

## Prerequisites

Before running the scripts, ensure you have the following:

- **Python 3**: Make sure you have Python 3 installed on your system.
- **Node.js**: Ensure Node.js is installed on your machine.
- **Google Account**: You need a Google account with Gmail access to fetch emails.
- **WhatsApp Account**: You need a WhatsApp account to send messages.

## Getting Started

Follow these steps to set up and run the project:

### 1. Google API Credentials

#### Python Script (`app.py`):

- Create a project on the [Google Developers Console](https://console.developers.google.com/).
- Enable the Gmail API for your project.
- Download the `credentials.json` file and place it in the same directory as `app.py`.

### 2. WhatsApp Configuration

#### Node.js Script (`index.js`):

- Install the necessary dependencies by running `npm install` in the project directory.
- Ensure you have WhatsApp Web running and authenticated on the browser you're using.

### 3. Running the Scripts

#### Python Script (`app.py`):

- Run `python3 app.py` to start fetching emails. The script will continuously monitor your inbox for new emails.

#### Node.js Script (`index.js`):

- Run `node index.js` to start the WhatsApp client. It will generate a QR code that you need to scan using your WhatsApp account to authenticate.

Ensure both scripts (`app.py` and `index.js`) are running simultaneously to maintain the functionality of fetching emails and sending them to WhatsApp.

## Usage

Once both scripts are running:

1. **Email Fetching**:
   - The Python script (`app.py`) continuously monitors your Gmail inbox for new emails.
   - New emails are fetched and stored in the `emails.json` file.

2. **WhatsApp Forwarding**:
   - The Node.js script (`index.js`) sends the fetched emails to a predefined WhatsApp contact.
   - Messages are formatted and sent to the specified WhatsApp contact using the WhatsApp Web API.

## Notes

- **Dependencies**: Ensure you have installed all Python dependencies listed in `requirements.txt` and Node.js dependencies listed in `package.json`.
- **Credentials**: Handle sensitive credentials securely. Avoid sharing them publicly or committing them to version control systems.

## File Structure

- **app.py**: Python script to fetch emails from Gmail.
- **index.js**: Node.js script to send emails to WhatsApp using the WhatsApp Web API.
- **credentials.json**: Google API credentials file required by `app.py`.
- **token.pickle**: Token file for Google API authentication.
- **wb_db**: Data directory for WhatsApp client authentication.
- **last_processed_time.json**: JSON file to store the timestamp of the last processed email.
- **emails.json**: JSON file to store the details of fetched emails.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the project.

## License

This project is licensed under the [MIT License](LICENSE).

---

**Disclaimer**: This project is for educational purposes only. Use it responsibly and respect the privacy of others.
