import { transporter } from "../configs/mailer";

export const sendVerificationEmail = async ({
  email,
  name,
  otp,
}: {
  email: string;
  name?: string;
  otp: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🔐 Verify Your Email - VedicVogue",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333333;">Hello ${name || "User"},</h2>
        <p style="font-size: 16px; color: #555555;">
          Thank you for connecting with <strong>VedicVogue</strong>. To verify your email address, please use the code below:
        </p>
        <div style="margin: 20px 0; padding: 15px; background-color: #e6f0ff; border-radius: 6px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #0047ab;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #777777;">
          This verification code will expire in <strong>15 minutes</strong>. If you didn’t request this, you can safely ignore this email.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;" />
        <p style="font-size: 13px; color: #999999; text-align: center;">
          Need help? Contact us at <a href="mailto:${
            process.env.GMAIL_USER
          }" style="color: #0047ab; text-decoration: none;">${
      process.env.GMAIL_USER
    }</a>
        </p>
      </div>
    </div>
  `,
  });
};

export const sendReceivedContactMail = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "📬 We've Received Your Message - VedicVogue",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2b2b2b;">Hi ${name || "there"},</h2>
          <p style="font-size: 16px; color: #555555;">
            Thank you for reaching out to <strong>VedicVogue</strong>. 🌟
          </p>
          <p style="font-size: 16px; color: #555555;">
            We have received your message and our team is already reviewing it. You can expect a response from us shortly regarding your queries.
          </p>
          <p style="font-size: 15px; color: #777777;">
            We truly appreciate your interest and will get back to you as soon as possible.
          </p>

          <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 14px; color: #999999; text-align: center;">
              If you have any urgent queries, feel free to contact us at 
              <a href="mailto:${
                process.env.GMAIL_USER
              }" style="color: #0047ab; text-decoration: none;">
                ${process.env.GMAIL_USER}
              </a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendReceivedNewsLetterMail = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "📩 You're Subscribed to the VedicVogue Newsletter!",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2b2b2b;">Hello ${name || "Subscriber"},</h2>
          <p style="font-size: 16px; color: #555555;">
            🎉 You're now officially subscribed to the <strong>VedicVogue Newsletter</strong>!
          </p>
          <p style="font-size: 15px; color: #555555;">
            Thank you for joining our community. We'll keep you updated with the latest news, upcoming events, startup opportunities, and inspiring stories from the world of entrepreneurship.
          </p>
          <p style="font-size: 15px; color: #777777;">
            We promise not to spam you. Only valuable and inspiring content — delivered right to your inbox.
          </p>

          <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 14px; color: #999999; text-align: center;">
              Want to get in touch? Email us at
              <a href="mailto:${
                process.env.GMAIL_USER
              }" style="color: #0047ab; text-decoration: none;">
                ${process.env.GMAIL_USER}
              </a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendReceivedJoinUsMail = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Team" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎉 Application Received - VedicVogue Join Us",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2b2b2b;">Hi ${name || "there"},</h2>
          <p style="font-size: 16px; color: #555555;">
            Thank you for applying to <strong>VedicVogue</strong>! 🚀
          </p>
          <p style="font-size: 16px; color: #555555;">
            We have received your application and our team will review it soon. You will hear back from us within a few days regarding the next steps.
          </p>
          <p style="font-size: 15px; color: #777777;">
            We appreciate your interest in joining VedicVogue and look forward to possibly working together!
          </p>
          <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 14px; color: #999999; text-align: center;">
              If you have any urgent queries, feel free to contact us at 
              <a href="mailto:${
                process.env.GMAIL_USER
              }" style="color: #0047ab; text-decoration: none;">
                ${process.env.GMAIL_USER}
              </a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendApprovedJoinUsMail = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Team" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "✅ Application Approved - VedicVogue Join Us",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2b2b2b;">Hi ${name || "there"},</h2>
          <p style="font-size: 16px; color: #555555;">
            Congratulations! Your application to <strong>VedicVogue</strong> has been <b>approved</b>! 🎉
          </p>
          <p style="font-size: 15px; color: #777777;">
            We are excited to welcome you to the VedicVogue team. Further details will be shared with you soon.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendRejectedJoinUsMail = async ({
  email,
  name,
}: {
  email: string;
  name?: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Team" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "❌ Application Rejected - VedicVogue Join Us",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2b2b2b;">Hi ${name || "there"},</h2>
          <p style="font-size: 16px; color: #555555;">
            We regret to inform you that your application to <strong>VedicVogue</strong> was not selected this time.
          </p>
          <p style="font-size: 15px; color: #777777;">
            Thank you for your interest and effort. We encourage you to apply again in the future!
          </p>
        </div>
      </div>
    `,
  });
};

export const sendContactReplyMail = async ({
  email,
  name,
  subject,
  replyMessage,
  adminName,
}: {
  email: string;
  name?: string;
  subject?: string;
  replyMessage: string;
  adminName?: string;
}) => {
  await transporter.sendMail({
    from: `"VedicVogue Admin" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject ? `Re: ${subject} - VedicVogue` : "Reply from VedicVogue",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
          <h2 style="color: #2b2b2b;">Hi ${name || "there"},</h2>
          <p style="font-size: 16px; color: #555555;">
            Thank you for reaching out to <strong>VedicVogue</strong>! Our team has reviewed your message and here is our response:
          </p>
          <div style="margin: 24px 0; padding: 18px; background-color: #f1f5ff; border-left: 4px solid #6c63ff; border-radius: 6px;">
            <p style="font-size: 16px; color: #333333; margin: 0; white-space: pre-line;">${replyMessage}</p>
          </div>
          <p style="font-size: 15px; color: #777777;">
            If you have any further questions, feel free to reply to this email. We are always happy to help!
          </p>
          <div style="margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 14px; color: #999999; text-align: center;">
              Best regards,<br />
              <strong>${adminName || "VedicVogue Admin Team"}</strong><br />
              <a href="mailto:${
                process.env.GMAIL_USER
              }" style="color: #0047ab; text-decoration: none;">${
      process.env.GMAIL_USER
    }</a>
            </p>
          </div>
        </div>
      </div>
    `,
  });
};
