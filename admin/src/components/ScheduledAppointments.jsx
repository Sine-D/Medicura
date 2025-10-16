import React, { useEffect, useState } from "react";
import axios from "axios";
import { sendEmail } from "../utils/emailService";

const ScheduledAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [emailStatus, setEmailStatus] = useState({});
  const [sendingEmail, setSendingEmail] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/lab-appointments/scheduled");
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };

    fetchAppointments();

    // 🔄 Auto-refresh every 5 seconds
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle sending email for a specific appointment
  const handleSendEmail = async (appointment) => {
    const appointmentId = appointment._id;
    
    // Set loading state
    setSendingEmail(prev => ({ ...prev, [appointmentId]: true }));
    setEmailStatus(prev => ({ ...prev, [appointmentId]: null }));

    try {
      const emailData = {
        to: appointment.email,
        ...appointment
      };

      const result = await sendEmail(emailData);
      
      if (result.success) {
        setEmailStatus(prev => ({ 
          ...prev, 
          [appointmentId]: { success: true, message: 'Email sent successfully!' }
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setEmailStatus(prev => ({ ...prev, [appointmentId]: null }));
        }, 3000);
      } else {
        setEmailStatus(prev => ({ 
          ...prev, 
          [appointmentId]: { success: false, message: result.error || 'Failed to send email' }
        }));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus(prev => ({ 
        ...prev, 
        [appointmentId]: { success: false, message: 'Error sending email' }
      }));
    } finally {
      setSendingEmail(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  return (
    <div>
      <h3>📋 Scheduled Appointments</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Email</th>
            <th>Age</th>
            <th>Test Type</th>
            <th>Date</th>
            <th>Time</th>
            <th>Lab</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td>{appt.fullName}</td>
              <td>{appt.email}</td>
              <td>{appt.age}</td>
              <td>{appt.testType}</td>
              <td>{appt.appointmentDate}</td>
              <td>{appt.preferredTime === "any-time" ? appt.customTime : appt.preferredTime}</td>
              <td>{appt.labLocation}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <button
                    onClick={() => handleSendEmail(appt)}
                    disabled={sendingEmail[appt._id]}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: sendingEmail[appt._id] ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: sendingEmail[appt._id] ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {sendingEmail[appt._id] ? 'Sending...' : '📧 Send Email'}
                  </button>
                  
                  {emailStatus[appt._id] && (
                    <div style={{
                      fontSize: '10px',
                      color: emailStatus[appt._id].success ? 'green' : 'red',
                      textAlign: 'center',
                      maxWidth: '100px'
                    }}>
                      {emailStatus[appt._id].message}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduledAppointments;
