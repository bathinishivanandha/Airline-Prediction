const nodemailer = require('nodemailer');

const sendCancellationEmail = async (booking, refundAmount) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"AeroPredict" <${process.env.EMAIL_USER}>`,
      to: booking.passengerEmail,
      subject: 'Ticket Cancellation Confirmation - AeroPredict',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #ea580c; text-align: center;">Ticket Cancelled Successfully</h2>
          <p>Hi <strong>${booking.passengerName}</strong>,</p>
          <p>Your flight booking (TXN ID: <strong>${booking.transactionId}</strong>) has been cancelled as per your request.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Refund Details</p>
            <h3 style="margin: 5px 0 0 0; font-size: 24px;">₹${refundAmount.toLocaleString()}</h3>
            <p style="margin: 5px 0 0 0; color: #10b981; font-weight: bold;">Refund processed to your UPI ID: ${booking.upiId}</p>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 15px;">
            <p style="margin: 0; font-weight: bold; color: #374151;">Flight Details:</p>
            <p style="margin: 5px 0; color: #4b5563;">${booking.flightDetails.source_city} → ${booking.flightDetails.destination_city}</p>
            <p style="margin: 5px 0; color: #4b5563;">${booking.flightDetails.airline.replace('_', ' ')} • ${booking.flightDetails.class}</p>
          </div>

          <p style="margin-top: 20px; color: #9ca3af; font-size: 12px; text-align: center;">If you have any questions, please contact our support team.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${booking.passengerEmail}`);
  } catch (err) {
    console.error('Failed to send cancellation email:', err.message);
  }
};

module.exports = { sendCancellationEmail };
