import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and returns an active Nodemailer transporter for standard email (Gmail, Zoho, Yahoo, Outlook, or custom SMTP)
 */
const getTransporter = () => {
  dotenv.config();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const host = (process.env.SMTP_HOST || '').trim();
  const service = (process.env.SMTP_SERVICE || '').trim().toLowerCase();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return null;
  }

  // If service is specified as gmail or user email ends with @gmail.com and no custom host
  if (service === 'gmail' || (!host && user.toLowerCase().endsWith('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }

  // Default to standard SMTP host
  const effectiveHost = host || (user.toLowerCase().endsWith('@gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com');

  return nodemailer.createTransport({
    host: effectiveHost,
    port: port,
    secure: secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Dispatches a standard task assignment notification email to the assigned employee
 *
 * @param {Object} params
 * @param {Object} params.task - The task object
 * @param {string} params.employeeEmail - Recipient email address
 * @param {string} [params.employeeName] - Recipient employee name
 * @param {string} [params.assignedByName] - Name of the admin who assigned the task
 */
export const sendTaskAssignmentEmail = async ({
  task,
  employeeEmail,
  employeeName = 'Team Member',
  assignedByName = 'Admin'
}) => {
  try {
    const cleanRecipient = (employeeEmail || '').trim();
    if (!cleanRecipient) {
      console.warn(`[Email Service] No recipient email found for Task ${task?.id || ''}`);
      return { success: false, reason: 'No recipient email' };
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[Email Service Notice] Email credentials (SMTP_USER / SMTP_PASS) not set in server/.env. Notification email skipped for ${cleanRecipient}`);
      return { success: false, reason: 'SMTP credentials not configured in server/.env' };
    }

    const taskTitle = task.description || task.theme || task.activity || `Task #${task.id || ''}`;
    const project = task.clientProject || task.client || task.project || 'General Project';
    const activityType = task.format || task.activity || task.coreActivity || 'Standard Task';
    const dueDate = task.toBeCompletedOn || task.targetEndDate || task.toBePostedOn || task.date || 'To be decided';
    const estimatedHours = task.estimatedHours || 10;
    const comments = task.comments || task.commentsUpdates || '';
    const frontendUrl = process.env.CRM_FRONTEND_URL || 'http://localhost:5173';
    const fromUser = process.env.SMTP_USER;
    const fromAddress = process.env.EMAIL_FROM || `"Tech Team CRM" <${fromUser}>`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Assignment</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f2f5; color: #111b21; margin: 0; padding: 24px 12px; line-height: 1.6;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e9edef; overflow: hidden; box-shadow: 0 4px 12px rgba(11, 20, 26, 0.08);">
    
    <!-- WhatsApp Matte Green Header (Solid finish, No gradient) -->
    <div style="background-color: #00a884; color: #ffffff; padding: 26px 28px; text-align: left; border-bottom: 3px solid #075e54;">
      <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.35); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px;">
        Tech Team CRM &bull; Task Alert
      </div>
      <h2 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; color: #ffffff;">📋 New Task Assigned</h2>
      <p style="margin: 0; font-size: 14px; color: #ffffff; opacity: 0.95;">Hi <strong>${employeeName}</strong>, you have been assigned a new task by <strong>${assignedByName}</strong>.</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px 28px;">
      <!-- Task Hero Banner -->
      <div style="background-color: #e8f8f5; border-left: 4px solid #00a884; padding: 14px 18px; margin-bottom: 22px; border-radius: 0 8px 8px 0;">
        <div style="font-size: 16px; font-weight: 700; color: #075e54; margin-bottom: 4px;">${taskTitle}</div>
        <div style="font-size: 13px; color: #54656f;">Task ID: <strong style="color: #075e54;">${task.id}</strong> &bull; Priority SLA: <strong style="color: #00a884;">${task.slaStatus || 'Green'}</strong></div>
      </div>

      <!-- Task Details Table -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 22px; font-size: 14px; border: 1px solid #e9edef; border-radius: 8px; overflow: hidden;">
        <tr style="background-color: #fafbfc; border-bottom: 1px solid #e9edef;">
          <td style="padding: 11px 16px; color: #667781; font-weight: 500; width: 40%; border-bottom: 1px solid #e9edef;">Project / Client:</td>
          <td style="padding: 11px 16px; font-weight: 700; color: #111b21; border-bottom: 1px solid #e9edef;">${project}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9edef;">
          <td style="padding: 11px 16px; color: #667781; font-weight: 500; border-bottom: 1px solid #e9edef;">Activity / Format:</td>
          <td style="padding: 11px 16px; font-weight: 600; color: #111b21; border-bottom: 1px solid #e9edef;">${activityType}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9edef;">
          <td style="padding: 11px 16px; color: #667781; font-weight: 500; border-bottom: 1px solid #e9edef;">Assigned By:</td>
          <td style="padding: 11px 16px; font-weight: 600; color: #075e54; border-bottom: 1px solid #e9edef;">${assignedByName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9edef;">
          <td style="padding: 11px 16px; color: #667781; font-weight: 500; border-bottom: 1px solid #e9edef;">Target Due Date:</td>
          <td style="padding: 11px 16px; font-weight: 700; color: #075e54; border-bottom: 1px solid #e9edef;">${dueDate}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9edef;">
          <td style="padding: 11px 16px; color: #667781; font-weight: 500; border-bottom: 1px solid #e9edef;">Estimated Effort:</td>
          <td style="padding: 11px 16px; font-weight: 600; color: #111b21; border-bottom: 1px solid #e9edef;">${estimatedHours} Hours</td>
        </tr>
        <tr>
          <td style="padding: 11px 16px; color: #667781; font-weight: 500;">Status:</td>
          <td style="padding: 11px 16px; font-weight: 700; color: #00a884;">${task.status || 'Yet to start'}</td>
        </tr>
      </table>

      ${comments ? `
      <!-- WhatsApp Bubble Notes Card -->
      <div style="background-color: #dcf8c6; border: 1px solid #c2eab0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
        <strong style="color: #075e54; font-size: 13px; display: block; margin-bottom: 4px;">💬 Task Notes & Instructions:</strong>
        <p style="margin: 0; color: #111b21; font-size: 14px; line-height: 1.5;">${comments}</p>
      </div>` : ''}

      <!-- Solid Matte WhatsApp Green CTA Button (No Gradient) -->
      <div style="text-align: center; margin: 28px 0 12px 0;">
        <a href="${frontendUrl}" style="display: inline-block; background-color: #00a884; color: #ffffff !important; text-decoration: none; padding: 13px 32px; font-weight: 700; font-size: 15px; border-radius: 8px; text-align: center; border: 1px solid #00a884;">
          Open in CRM &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f2f5; border-top: 1px solid #e9edef; padding: 16px 24px; text-align: center; font-size: 12px; color: #8696a0;">
      Tech Team CRM &bull; Automated Task Notification &bull; ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>
    `;

    const plainText = `
[Tech Team CRM] New Task Assigned: ${task.id}
Hello ${employeeName},

You have been assigned a new task by ${assignedByName}.

Task Details:
- Title: ${taskTitle}
- Task ID: ${task.id}
- Project: ${project}
- Activity: ${activityType}
- Due Date: ${dueDate}
- Estimated Effort: ${estimatedHours} hrs
- Status: ${task.status || 'Yet to start'}
${comments ? `- Notes: ${comments}` : ''}

Open CRM to view: ${frontendUrl}
    `.trim();

    const mailOptions = {
      from: fromAddress,
      to: cleanRecipient,
      subject: `[Task Assigned] ${taskTitle} (${task.id})`,
      text: plainText,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Task notification email sent successfully to ${cleanRecipient} (ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Error] Failed to send email to ${employeeEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Validates SMTP connection and sends a test email
 */
export const testSmtpConnection = async (testRecipientEmail) => {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, message: 'SMTP credentials (SMTP_USER/SMTP_PASS) are missing in server/.env' };
  }

  try {
    await transporter.verify();
    
    if (testRecipientEmail) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Tech Team CRM" <${process.env.SMTP_USER}>`,
        to: testRecipientEmail,
        subject: '[Tech CRM] Email Notification Test',
        text: 'Congratulations! Your email notification setup is working properly with Tech Team CRM.',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-top: 0;">Email Notification Test Successful</h2>
            <p>Your email notification service for Tech Team CRM is connected and configured properly.</p>
            <p style="color: #64748b; font-size: 13px;">Sent at: ${new Date().toLocaleString()}</p>
          </div>
        `
      });
      return { success: true, message: `SMTP verified and test email dispatched to ${testRecipientEmail}`, messageId: info.messageId };
    }

    return { success: true, message: 'SMTP connection verified successfully' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
