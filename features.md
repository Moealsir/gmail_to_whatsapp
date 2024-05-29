# Project Features

## Email Processing Features

### Gmail API Integration
- **OAuth 2.0 Authentication:**
  - Utilizes the Gmail API for secure access to user email accounts.
  - Implements OAuth 2.0 for secure authentication and authorization.

### Email Fetching and Processing
- **New Email Retrieval:**
  - Fetches new emails from Gmail based on the last processed timestamp.
  - Decodes email content (supports both plain text and base64 encoded formats).

### Email Data Management
- **Email Storage:**
  - Stores fetched emails in JSON files, with a separate file for each user.
  - Maintains a record of the last processed time to ensure all new emails are captured.

## WhatsApp Integration Features

### WhatsApp API Integration
- **WhatsApp Web Interaction:**
  - Uses `whatsapp-web.js` to interact with WhatsApp Web.
  - Supports QR code-based authentication for secure access.

### Sending Emails to WhatsApp
- **Email Notifications:**
  - Sends new emails to specified WhatsApp numbers.
  - Formats and sends email details, including the sender's name, email, subject, and body.

### Command Handling via WhatsApp
- **Manage Email Preferences:**
  - **Add Command:** Add email addresses to the filtered list by sending "add [email]".
  - **Delete Command:** Remove email addresses from the filtered list by sending "delete [email]".
  - **Emails Command:** View the list of filtered emails by sending "emails".
  - **Stop Command:** Stop receiving email notifications by sending "stop".
  - **Start Command:** Resume receiving email notifications by sending "start".

## User Preferences and Data Management

### User Preferences
- **Loading and Saving Preferences:**
  - Loads user preferences, including service status (running or stopped).
  - Saves user preferences in JSON files specific to each user.

### Filtered Emails Management
- **Filtered Emails Handling:**
  - Loads, updates, and saves filtered email addresses for each user.
  - Ensures filtered emails are stored in a sorted manner for easy management.

## Scheduling and Automation

### Automated Email Checking
- **Scheduled Email Checks:**
  - Uses `cron` to schedule regular checks for new emails (every minute).
  - Sends new emails to WhatsApp and updates filtered emails automatically on each scheduled run.

## Error Handling and Logging

### Error Handling
- **Robust Error Management:**
  - Handles errors during email fetching, processing, and sending.
  - Logs authentication failures and other errors for debugging purposes.

## Code Structure

### Modular Design
- **Separation of Concerns:**
  - Divides functionality into separate scripts: `app.py` for Gmail handling and `index.js` for WhatsApp handling.
  - Uses classes and functions to organize code logically.

### File Management
- **Structured Data Storage:**
  - Stores user-specific tokens, emails, filtered emails, and preferences in well-organized directories.
  - Ensures data persistence across different runs and user sessions.

## Additional Features

### Support for Multiple Users
- **Concurrent User Management:**
  - Manages multiple users, each with their own Gmail and WhatsApp configurations.
  - Processes emails and sends notifications for multiple users concurrently.

By integrating these features, this project provides a comprehensive solution for receiving and managing Gmail notifications through WhatsApp, offering convenience and control to the users.
