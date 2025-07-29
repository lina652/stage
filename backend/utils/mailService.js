import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "bensalahlina59@gmail.com",
    pass: "fwra dcxh sxuh kxhs", // 🔐 à remplacer par process.env en prod
  },
});

export async function sendMail({ to, subject, text }) {
  const mailOptions = {
    from: "bensalahlina59@gmail.com",
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
}
