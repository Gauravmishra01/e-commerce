import nodemailer from "nodemailer";
import "dotenv/config";

export const verifyEmail = async (token, email) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn(
      "Email verification skipped because MAIL_USER/MAIL_PASS are not configured.",
    );
    return { success: false, skipped: true };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from: process.env.MAIL_USER,

    to: email,
    subject: "Email Verification",

    // This would be the text of email body
    text: `Hi! There, You have recently visited 
           our website and entered your email.
           Please follow the given link to verify your email
           http://localhost:5173/verify/${token} 
           Thanks`,
  };
  const info = await transporter.sendMail(mailConfigurations);
  console.log("Email Sent Successfully");
  console.log(info);
  return { success: true, info };
};
