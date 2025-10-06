const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendStaffCredentialsEmail = async (email, name, password) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM, // using onboarding@resend.dev
      to: email,
      subject: "Your Staff Account Login Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
          <h2 style="color: #1a73e8; text-align: center;">Welcome to MovicDev Team</h2>
          <p>Dear <b>${name}</b>,</p>
          <p>Your staff account has been created successfully. You can now log in using the details below:</p>
          <ul style="font-size: 16px;">
            <li><b>Email:</b> ${email}</li>
            <li><b>Password:</b> ${password}</li>
          </ul>
          <p>Please log in and change your password after your first login for security reasons.</p>
          <p style="color: #666;">Thank you,<br/>MovicDev Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error sending staff credentials email:", error);
      return;
    }

    console.log("✅ Email sent successfully:", data);
  } catch (err) {
    console.error("❌ Error:", err);
  }
};
