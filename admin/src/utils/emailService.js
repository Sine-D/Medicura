import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs.config.js';
import { sendDemoEmail } from './demoEmailService.js';

// Check if EmailJS is properly configured
const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.serviceId !== 'service_abc123' && 
         EMAILJS_CONFIG.templateId !== 'template_xyz789' && 
         EMAILJS_CONFIG.publicKey !== 'user_abc123def456';
};

// Real EmailJS implementation
export const sendEmail = async (emailData) => {
  try {
    // Check if EmailJS is properly configured
    if (!isEmailJSConfigured()) {
      console.warn('EmailJS not configured. Using demo mode.');
      
      // Show demo email preview
      const demoResult = await sendDemoEmail(emailData);
      
      return {
        success: false,
        error: 'EmailJS not configured. Please set up your EmailJS credentials in src/config/emailjs.config.js',
        demo: true,
        configError: true,
        demoPreview: demoResult.preview
      };
    }

    // Initialize EmailJS with public key
    emailjs.init(EMAILJS_CONFIG.publicKey);
    
    // Prepare template parameters
    const templateParams = {
      patient_name: emailData.patientName || emailData.fullName || 'Patient',
      appointment_date: emailData.appointmentDate || 'Not specified',
      appointment_time: emailData.preferredTime === 'any-time' ? 
        (emailData.customTime || 'Any time') : 
        (emailData.preferredTime || 'Not specified'),
      test_type: emailData.testType || 'Not specified',
      lab_location: emailData.labLocation || 'Not specified',
      physician: emailData.physician || 'Not specified',
      priority: emailData.priority || 'Normal',
      status: emailData.status || 'Scheduled',
      reference_number: emailData.referenceNumber || 'Not assigned',
      insurance_provider: emailData.insuranceProvider || 'Not specified',
      insurance_id: emailData.insuranceId || 'Not specified',
      notes: emailData.notes || 'No special notes',
      patient_email: emailData.to || emailData.email,
      patient_phone: emailData.phone || 'Not provided',
      patient_age: emailData.age || 'Not provided',
      patient_gender: emailData.gender || 'Not specified'
    };

    console.log('Sending email via EmailJS to:', emailData.to);
    console.log('Template parameters:', templateParams);
    
    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );
    
    console.log('EmailJS response:', response);
    
    return { 
      success: true, 
      message: 'Email sent successfully!',
      response: response,
      demo: false 
    };
    
  } catch (error) {
    console.error('EmailJS error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    if (error.text) {
      errorMessage = error.text;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: error
    };
  }
};

// Alternative: Simple email service using Web3Forms (Free)
export const sendEmailWeb3Forms = async (emailData) => {
  try {
    const formData = new FormData();
    formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY'); // Get from web3forms.com
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.html);
    formData.append('from_name', 'MedicuraLab Team');
    
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true, response: result };
    } else {
      throw new Error(result.message || 'Email sending failed');
    }
    
  } catch (error) {
    console.error('Web3Forms email error:', error);
    throw error;
  }
};

// Alternative: Using Resend (Modern email API)
export const sendEmailResend = async (emailData) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_RESEND_API_KEY', // Get from resend.com
      },
      body: JSON.stringify({
        from: 'MedicuraLab <noreply@medicuralab.com>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      return { success: true, response: result };
    } else {
      throw new Error(result.message || 'Email sending failed');
    }
    
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};
