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

const sendVerificationEmail = (to:string, otp:string) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: to,
    subject: "Email Verification",
    text: `Your verification code is: ${otp}`,
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

export default sendVerificationEmail;
