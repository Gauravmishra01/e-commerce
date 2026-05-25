import nodemailer from "nodemailer";
import "dotenv/config";

export const SendOTPMail = async (otp, email) => {
  try {
    if (!email) {
      console.error("SendOTPMail ERROR: Email is undefined!");
      return { success: false, error: "Recipient email is missing" };
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
      subject: "Password Reset OTP",
      html: `<p>Your OTP for password reset is: <b>${otp}</b></p>`,
    };

    const info = await transporter.sendMail(mailConfigurations);

    console.log("OTP Sent Successfully");
    return { success: true, info };
  } catch (error) {
    console.error("SendOTPMail FAILED:", error.message);
    return { success: false, error: error.message };
  }
};
