// Demo email service for when EmailJS is not configured
export const sendDemoEmail = async (emailData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a demo email preview
    const emailPreview = {
      to: emailData.to || emailData.email,
      subject: `Lab Appointment Confirmation - ${emailData.fullName || emailData.patientName} (${emailData.appointmentDate})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px dashed #ccc;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🏥 MedicuraLab</h1>
            <h2>Lab Appointment Confirmation</h2>
            <p style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; margin-top: 10px;">
              📧 DEMO MODE - This is how your email would look
            </p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Dear <strong>${emailData.fullName || emailData.patientName || 'Patient'}</strong>,</p>
            
            <p>Your lab appointment has been confirmed. Please find the details below:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3>📋 Appointment Details</h3>
              <p><strong>Patient Name:</strong> ${emailData.fullName || emailData.patientName || 'Not specified'}</p>
              <p><strong>Appointment Date:</strong> ${emailData.appointmentDate || 'Not specified'}</p>
              <p><strong>Time:</strong> ${emailData.preferredTime === 'any-time' ? (emailData.customTime || 'Any time') : (emailData.preferredTime || 'Not specified')}</p>
              <p><strong>Test Type:</strong> ${emailData.testType || 'Not specified'}</p>
              <p><strong>Lab Location:</strong> ${emailData.labLocation || 'Not specified'}</p>
              <p><strong>Physician:</strong> ${emailData.physician || 'Not specified'}</p>
              <p><strong>Priority:</strong> ${emailData.priority || 'Normal'}</p>
              <p><strong>Status:</strong> ${emailData.status || 'Scheduled'}</p>
              <p><strong>Reference Number:</strong> <strong>${emailData.referenceNumber || 'Not assigned'}</strong></p>
              <p><strong>Insurance Provider:</strong> ${emailData.insuranceProvider || 'Not specified'}</p>
              <p><strong>Insurance ID:</strong> ${emailData.insuranceId || 'Not specified'}</p>
              <p><strong>Notes:</strong> ${emailData.notes || 'No special notes'}</p>
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
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>MedicuraLab</strong><br>
              📞 Phone: (555) 123-4567<br>
              📧 Email: info@medicuralab.com<br>
              🌐 Website: www.medicuralab.com</p>
            </div>
          </div>
        </div>
      `
    };
    
    console.log('📧 DEMO EMAIL PREVIEW:');
    console.log('To:', emailPreview.to);
    console.log('Subject:', emailPreview.subject);
    console.log('HTML Content:', emailPreview.html);
    
    return {
      success: true,
      message: 'Demo email preview generated successfully!',
      demo: true,
      preview: emailPreview
    };
    
  } catch (error) {
    console.error('Demo email error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate demo email',
      demo: true
    };
  }
};

export default sendDemoEmail;
