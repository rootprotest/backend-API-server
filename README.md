# Enquiry Submission & Meeting Scheduler API

This is a Node.js backend API built with Express.js to handle user enquiries and schedule meetings using Google Calendar.

## Features
- Accepts user enquiries with name, email, phone, and message.
- Sends a confirmation email to the user.
- Sends an internal notification email to the admin.
- Integrates with Google Calendar to schedule a meeting.
- Uses OAuth2 authentication for Gmail SMTP.

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/enquiry-scheduler.git
cd enquiry-scheduler

PORT=5000
ADMIN_EMAIL=your-admin@gmail.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=your-refresh-token

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I would like to discuss a project.",
  "meetingTime": "2025-03-20T10:00:00Z"
}


This `README.md` will help others set up and use your project. Let me know if you need any modifications! 🚀






