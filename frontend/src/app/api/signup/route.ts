import supabaseAdmin from "@/lib/supabase/admin";
import nodemailer from "nodemailer";
import generateVerifyEmailTemplate from "@/emails";

export async function POST(request: Request) {
  const data = await request.json();
  const supabase = supabaseAdmin();

  const res = await supabase.auth.admin.generateLink({
    type: "signup",
    email: data.email,
    password: data.password,
  });

  if (res.data.user) {
    // Log the user information from the response
    const { data: updatedUser, error } = await supabase.auth.admin.updateUserById(
      res.data.user.id, // User's ID
      {
        user_metadata: { email: data.email, full_name: data.username } // Replace with the metadata you want to update
      }
    );
  } else {
    console.error("User creation error:", res.error);
  }


  if (res.data.properties?.email_otp) {
    // create a transporter using nodemailer with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail address
        pass: process.env.GMAIL_PASS, // your Gmail password or app-specific password
      },
    });

    const htmlContent = generateVerifyEmailTemplate(res.data.properties.email_otp);

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
