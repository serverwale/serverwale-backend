const nodemailer = require("nodemailer");

const sendEmail = async (lead) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Website Lead" <${process.env.EMAIL_USER}>`,
    to: process.env.OFFICIAL_EMAIL,
    subject: "New Lead Received 🚀",
    html: `
      <h3>New Lead</h3>
      <p>Name: ${lead.name}</p>
      <p>Company: ${lead.company}</p>
      <p>Email: ${lead.email}</p>
      <p>Phone: ${lead.phone}</p>
      <p>Service: ${lead.service}</p>
      <p>Message: ${lead.message}</p>
    `
  });
};

module.exports = sendEmail;
