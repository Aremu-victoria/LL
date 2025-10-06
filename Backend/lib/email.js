const nodemailer = require("nodemailer");

const sendStaffCredentialsEmail = async (email, name, password) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Staff Account Login Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #1a73e8; text-align: center;">Learn Link School Management System</h2>
          <p>Dear <b>${name}</b>,</p>
          <p>Your staff account has been created successfully. You can now log in using the details below:</p>
          <ul style="font-size: 16px;">
            <li><b>Email:</b> ${email}</li>
            <li><b>Password:</b> ${password}</li>
          </ul>
          <p>Please log in and change your password after your first login for security reasons.</p>
          <p style="color: #666;">Thank you,<br/>Learn Link</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Staff credentials email sent to ${email}`);
  } catch (error) {
    console.error("Error sending staff credentials email:", error);
  }
};

module.exports = { sendStaffCredentialsEmail };
