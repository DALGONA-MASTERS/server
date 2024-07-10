const nodeMailer = require('nodemailer');
const jwt = require('jsonwebtoken')

const MAIL_ADDRESS = process.env.EMAIL;
const MAIL_PASSWORD = process.env.E_PASSWORD;

const mailConfiguation = {
    service: "gmail",
    auth: {
        user: MAIL_ADDRESS,
        pass: MAIL_PASSWORD,
    },
}

const transporter = nodeMailer.createTransport(mailConfiguation);
const EMAIL = process.env.EMAIL

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Votre code de vérification',
    text: `Votre code de vérification est : ${code}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationCode;