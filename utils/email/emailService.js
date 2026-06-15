const asyncHandler = require("express-async-handler");

// emailService.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// We'll define the function to accept dynamic options
const brevoEmailSender = asyncHandler(async (options) => {
  const senderEmail = process.env.EMAIL_USER;
  const brevoApiKey = process.env.BREVO_API_KEY;

  // Validate that the keys actually exist
  if (!brevoApiKey || !senderEmail) {
    throw new Error("Missing Brevo credentials in environment variables.");
  }

  const payload = {
    sender: {
      name: "IYAKSARL",
      email: senderEmail, // Must match your verified Brevo email
    },
    to: [
      {
        email: options.email, // The dynamic email address of the user receiving the email
      },
    ],
    subject: options.subject,
    htmlContent: options.html,
  };

  console.log(`Sending email to ${options.email} via Brevo HTTP API...`);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error(`Brevo API Error: ${JSON.stringify(result)}`);
    throw new Error(`Brevo API Error: ${JSON.stringify(result)}`);
  }

  console.log(
    `Email successfully sent to ${options.email} via Brevo HTTP API!`,
  );
});

module.exports = { transporter, brevoEmailSender };
