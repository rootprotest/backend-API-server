require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// Set up OAuth2 for Gmail
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Nodemailer Transporter
async function createTransporter() {
  const accessToken = await oAuth2Client.getAccessToken();
  
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.ADMIN_EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
}

// Function to send emails
async function sendEmail(to, subject, htmlContent) {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `"Support Team" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Function to schedule a Google Calendar event
async function scheduleMeeting(name, email, phone, meetingTime) {
  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  
  const event = {
    summary: `Meeting with ${name}`,
    description: `Discussion with ${name}, Email: ${email}, Phone: ${phone}`,
    start: { dateTime: meetingTime, timeZone: "Asia/Kolkata" },
    end: { dateTime: new Date(new Date(meetingTime).getTime() + 30 * 60000).toISOString(), timeZone: "Asia/Kolkata" },
    attendees: [{ email: email }, { email: process.env.ADMIN_EMAIL }],
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    console.log("Meeting scheduled:", response.data.htmlLink);
    return response.data.htmlLink;
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    return null;
  }
}

// API Endpoint for enquiry submission
app.post("/submit-enquiry", async (req, res) => {
  const { name, email, phone, message, meetingTime } = req.body;
  
  if (!name || !email || !phone || !message || !meetingTime) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email to the user
  const userEmailContent = `<p>Hi ${name},</p><p>Thank you for your enquiry! We will contact you soon.</p>`;
  await sendEmail(email, "Your Enquiry Received", userEmailContent);

  // Email to admin
  const adminEmailContent = `<p>New enquiry received:</p>
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    <p>Phone: ${phone}</p>
    <p>Message: ${message}</p>`;
  await sendEmail(process.env.ADMIN_EMAIL, "New Enquiry Received", adminEmailContent);

  // Schedule Meeting
  const meetingLink = await scheduleMeeting(name, email, phone, meetingTime);

  res.json({ success: true, meetingLink });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
