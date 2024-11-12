import supabaseAdmin from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const data = await request.json();
  const supabase = supabaseAdmin();

  const res = await supabase.auth.admin.generateLink({
    type: "signup",
    email: data.email,
    password: data.password,
  });

  if (res.data.properties?.email_otp) {
    // create a transporter using nodemailer with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail address
        pass: process.env.GMAIL_PASS, // your Gmail password or app-specific password
      },
    });

	const htmlContent = `
      <html>
        <body>
          <h1>Verify Your Email</h1>
          <p>To verify your email address, use the following code:</p>
          <p><strong>${res.data.properties.email_otp}</strong></p>
          <p>If you did not request this, please ignore this email.</p>
        </body>
      </html>
    `;


    const mailOptions = {
      from: `Acme <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: "Verify Email",
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return Response.json({ success: true, messageId: info.messageId });
    } catch (error) {
      return Response.json({ error: error.message });
    }
  } else {
    return Response.json({ data: null, error: res.error });
  }
}
