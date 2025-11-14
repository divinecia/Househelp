import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (payload: EmailPayload) => {
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY is not configured. Email notifications are disabled.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const msg = {
      to: payload.to,
      from: "noreply@househelp.rw",
      subject: payload.subject,
      text: payload.text || "",
      html: payload.html,
    };

    const result = await sgMail.send(msg);
    return { success: true, messageId: result[0].headers["x-message-id"] };
  } catch (error) {
    console.error("SendGrid error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (name: string, email: string, role: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Welcome to HouseHelp, ${name}!</h2>
      <p>Thank you for registering as a ${role}. We're excited to have you on board.</p>
      <p>You can now log in to your account and start using our platform.</p>
      <p>Best regards,<br>The HouseHelp Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to HouseHelp - ${role.charAt(0).toUpperCase() + role.slice(1)} Account`,
    html,
  });
};

export const sendPaymentNotification = async (
  email: string,
  amount: number,
  currency: string,
  status: "success" | "failed" | "pending",
  transactionRef: string
) => {
  const statusMessage = {
    success: "Your payment has been completed successfully.",
    failed: "Unfortunately, your payment could not be processed. Please try again.",
    pending: "Your payment is pending verification.",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Payment ${status.toUpperCase()}</h2>
      <p>${statusMessage[status]}</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Amount:</strong> ${amount} ${currency}</p>
        <p><strong>Reference:</strong> ${transactionRef}</p>
        <p><strong>Status:</strong> ${status.toUpperCase()}</p>
      </div>
      <p>Best regards,<br>The HouseHelp Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Payment ${status.toUpperCase()} - HouseHelp`,
    html,
  });
};

export const sendBookingConfirmation = async (
  email: string,
  jobTitle: string,
  scheduledDate: string,
  bookingRef: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Booking Confirmation</h2>
      <p>Your booking has been confirmed!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Job:</strong> ${jobTitle}</p>
        <p><strong>Scheduled Date:</strong> ${scheduledDate}</p>
        <p><strong>Booking Reference:</strong> ${bookingRef}</p>
      </div>
      <p>We'll notify you when a worker accepts your job request.</p>
      <p>Best regards,<br>The HouseHelp Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Booking Confirmed - ${jobTitle}`,
    html,
  });
};

export const sendWorkerAssignmentEmail = async (
  email: string,
  jobTitle: string,
  workerName: string,
  scheduledDate: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Worker Assignment Confirmed</h2>
      <p>A worker has been assigned to your job!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Job:</strong> ${jobTitle}</p>
        <p><strong>Worker:</strong> ${workerName}</p>
        <p><strong>Scheduled Date:</strong> ${scheduledDate}</p>
      </div>
      <p>Please contact the worker to confirm details if needed.</p>
      <p>Best regards,<br>The HouseHelp Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Worker Assigned - ${jobTitle}`,
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Best regards,<br>The HouseHelp Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    html,
  });
};

export const sendJobCompletionEmail = async (
  email: string,
  jobTitle: string,
  workerName: string,
  rating?: number
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Job Completed</h2>
      <p>The job has been marked as completed!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Job:</strong> ${jobTitle}</p>
        <p><strong>Worker:</strong> ${workerName}</p>
        ${rating ? `<p><strong>Your Rating:</strong> ${"⭐".repeat(rating)}</p>` : ""}
      </div>
      <p>Thank you for using HouseHelp!</p>
      <p>Best regards,<br>The HouseHelp Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Job Completed - ${jobTitle}`,
    html,
  });
};
