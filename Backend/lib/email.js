// lib/email.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendStaffCredentialsEmail = async (email, name, password, resetLink) => {
  try {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // must be verified sender
      subject: 'Your Staff Account Login Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #1a73e8; text-align: center;">Learn Link School Management System</h2>
          <p>Dear <b>${name}</b>,</p>
          <p>Your staff account has been created successfully. You can now log in using the details below:</p>
          <ul style="font-size: 16px;">
            <li><b>Email:</b> ${email}</li>
            <li><b>Password:</b> ${password}</li>
          </ul>
          <p style="margin-top:10px;">For security, please reset your password now using the link below:</p>
          <p>
            <a href="${resetLink}" style="background:#1a73e8;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Reset your password</a>
          </p>
          <p style="color:#666;font-size:13px;">This link will expire in 30 minutes. If the button doesn't work, copy and paste this URL into your browser:<br/><span style="word-break:break-all;">${resetLink}</span></p>
          <hr style="border:none;border-top:1px solid #eee;margin:18px 0;"/>
          <p>You can also sign in with the temporary password above and change it from your profile.</p>
          <p style="color: #666;">Thank you,<br/>Learn Link</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${email}`);
  } catch (error) {
    console.error('❌ Error sending email via SendGrid:', error.response?.body || error.message);
  }
};

module.exports = { sendStaffCredentialsEmail };
