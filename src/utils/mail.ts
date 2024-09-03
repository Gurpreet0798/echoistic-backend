import nodemailer from "nodemailer";
import createHttpError from "http-errors";
import logger from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendAuthOTP = (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: to,
    subject: "Email Verification",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header img {
            max-width: 150px;
          }
          .header h1 {
            color: #333;
            font-size: 24px;
            margin: 10px 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
          }
          .content {
            text-align: center;
            margin-bottom: 20px;
          }
          .content p {
            font-size: 16px;
            color: #555;
            line-height: 1.5;
          }
          .otp-code {
            font-size: 26px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
            background: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            font-size: 14px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer a {
            color: #1a73e8;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://i.pinimg.com/736x/68/2a/2f/682a2f06b3bc8dd89bc9d1a291346ee3.jpg" alt="Company Logo" /> <!-- Replace with your logo URL -->
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up with us. To complete your registration, please use the OTP code provided below:</p>
            <div class="otp-code">${otp}</div>
            <p>Please note that this code will expire in 10 minutes. If you did not request this verification, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>If you have any questions or need further assistance, please <a href="mailto:support@example.com">contact our support team</a>.</p>
            <p>&copy; ${new Date().getFullYear()} LighBox. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      logger.error("error sending verification email: ", error);
      throw createHttpError.InternalServerError(
        "error sending verification email"
      );
    } else {
      logger.info("verification email sent");
    }
  });
};
