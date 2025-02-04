// utils/nodemailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: "mongi.nahdi@gmail.com",
    pass: "otaz swng dwug aitd",
  },
});

export const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: "mongi.nahdi@gmail.com",
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};