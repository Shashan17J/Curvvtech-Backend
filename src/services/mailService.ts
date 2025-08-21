import nodemailer from "nodemailer";
require("dotenv").config();

export const mailSender = async (to: string, subject: string, text: string) => {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"Logs Exporter" <no-reply@example.com>',
      to: to,
      subject: subject,
      text: text,
    });

    return info;
  } catch (error: any) {
    console.log(error.message);
  }
};
