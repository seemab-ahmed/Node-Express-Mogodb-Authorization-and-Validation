const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  console.log(options);
  // 1 ) Create aa tansporter
  const transporter = nodemailer.createTransport({
    // service:'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Activate in gmail lesss secure app option
  });
  // 2) Define the email option
  const mailOptions = {
    from: "seemab Ahmed <seemab40615@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  //3) Actually send the email
  try {
    console.log("sending email...");
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};
module.exports = sendEmail;
