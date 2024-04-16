// const { Resend } = require("resend");
// const resend = new Resend(process.env.Resend_KEY);

// const sendEmail = async (email, message) => {
//     const { data, error } = await resend.emails.send({
//         from: process.env.email,
//         to: email,
//         subject: "Password Change OTP",
//         html: `${message}`,
//     });
//     if (error) {
//         console.log(error);
//         return false;
//     }
//     return true;
// };

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.email,
        pass: process.env.pass,
    },
});

const sendEmail = async (email, subject, message, html) => {
    try {
        const info = await transporter.sendMail({
            from: "dipendrapro4406@gmail.com",
            to: email,
            subject: subject,
            text: message,
            html: html,
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

module.exports = sendEmail;
