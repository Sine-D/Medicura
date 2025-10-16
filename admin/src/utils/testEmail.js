// Test EmailJS functionality
import { sendEmail } from './emailService';

export const testEmailJS = async () => {
  console.log('🧪 Testing EmailJS configuration...');
  
  const testData = {
    to: 'test@example.com', // Replace with your test email
    fullName: 'Test Patient',
    email: 'test@example.com',
    phone: '123-456-7890',
    age: '30',
    gender: 'male',
    testType: 'Blood Test',
    labLocation: 'Main Lab',
    appointmentDate: '2024-01-15',
    preferredTime: '09:00 AM',
    customTime: '',
    notes: 'This is a test email',
    insuranceProvider: 'Test Insurance',
    insuranceId: 'TEST123',
    physician: 'Dr. Test',
    referenceNumber: 'LB123456',
    priority: 'Normal',
    status: 'Scheduled'
  };

  try {
    const result = await sendEmail(testData);
    
    if (result.success) {
      console.log('✅ EmailJS test successful!');
      console.log('📧 Email would be sent to:', testData.to);
      console.log('📋 Template parameters:', {
        patient_name: testData.fullName,
        appointment_date: testData.appointmentDate,
        test_type: testData.testType,
        reference_number: testData.referenceNumber
      });
      return { success: true, message: 'EmailJS is properly configured!' };
    } else {
      console.error('❌ EmailJS test failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ EmailJS test error:', error);
    return { success: false, error: error.message };
  }
};

// Usage: Call testEmailJS() in browser console or component
export default testEmailJS;
