import nodemailer from "nodemailer";
import dotenv from 'dotenv'

dotenv.config()
export const sendOtpMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASS,
    },
  });
console.log(process.env.EMAIL);
console.log(process.env.APP_PASS);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password reset OTP",
    html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
