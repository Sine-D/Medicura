import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Create transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For Gmail (you'll need to use App Password)
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail App Password
    }
  });

  // Alternative: For other email services
  // return nodemailer.createTransporter({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: true,
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS
  //   }
  // });
};

// Send appointment email
router.post("/send-email", async (req, res) => {
  try {
    const {
      to_email,
      patient_name,
      appointment_date,
      appointment_time,
      test_type,
      lab_location,
      physician,
      priority,
      status,
      reference_number,
      notes,
      insurance_provider,
      insurance_id
    } = req.body;

    // Validate required fields
    if (!to_email || !patient_name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and patient name are required" 
      });
    }

    const transporter = createTransporter();

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lab Appointment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .priority-urgent { color: #e74c3c; font-weight: bold; }
          .priority-high { color: #f39c12; font-weight: bold; }
          .priority-normal { color: #27ae60; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MedicuraLab</h1>
            <h2>Lab Appointment Confirmation</h2>
          </div>
          
          <div class="content">
            <p>Dear <strong>${patient_name}</strong>,</p>
            
            <p>Your lab appointment has been confirmed. Please find the details below:</p>
            
            <div class="appointment-details">
              <h3>📋 Appointment Details</h3>
              
              <div class="detail-row">
                <span class="detail-label">Patient Name:</span>
                <span class="detail-value">${patient_name}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Appointment Date:</span>
                <span class="detail-value">${appointment_date}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${appointment_time}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Test Type:</span>
                <span class="detail-value">${test_type}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Lab Location:</span>
                <span class="detail-value">${lab_location}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Physician:</span>
                <span class="detail-value">${physician}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Priority:</span>
                <span class="detail-value priority-${priority.toLowerCase()}">${priority}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${status}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Reference Number:</span>
                <span class="detail-value"><strong>${reference_number}</strong></span>
              </div>
              
              ${insurance_provider !== 'Not specified' ? `
              <div class="detail-row">
                <span class="detail-label">Insurance Provider:</span>
                <span class="detail-value">${insurance_provider}</span>
              </div>
              ` : ''}
              
              ${insurance_id !== 'Not specified' ? `
              <div class="detail-row">
                <span class="detail-label">Insurance ID:</span>
                <span class="detail-value">${insurance_id}</span>
              </div>
              ` : ''}
              
              ${notes && notes !== 'None' ? `
              <div class="detail-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${notes}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4>📝 Important Instructions:</h4>
              <ul>
                <li>Please arrive 15 minutes before your scheduled appointment time</li>
                <li>Bring a valid ID and your insurance card (if applicable)</li>
                <li>Follow any pre-test instructions provided by your physician</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
              </ul>
            </div>
            
            <p>If you have any questions or need to make changes to your appointment, please contact us immediately.</p>
            
            <p>Thank you for choosing MedicuraLab for your healthcare needs.</p>
            
            <div class="footer">
              <p><strong>MedicuraLab</strong><br>
              📞 Phone: (555) 123-4567<br>
              📧 Email: info@medicuralab.com<br>
              🌐 Website: www.medicuralab.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to_email,
      subject: `Lab Appointment Confirmation - ${patient_name} (${appointment_date})`,
      html: emailHtml,
      text: `
        Lab Appointment Confirmation
        
        Dear ${patient_name},
        
        Your lab appointment has been confirmed for ${appointment_date} at ${appointment_time}.
        
        Test Type: ${test_type}
        Lab Location: ${lab_location}
        Physician: ${physician}
        Priority: ${priority}
        Reference Number: ${reference_number}
        
        Please arrive 15 minutes before your scheduled time.
        
        Thank you for choosing MedicuraLab.
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: "Email sent successfully" 
    });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send email",
      error: error.message 
    });
  }
});

export default router;
