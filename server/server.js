const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Admin client using service role key — bypasses email confirmation
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Gmail SMTP transporter — credentials hardcoded as fallback
const GMAIL_USER = process.env.GMAIL_USER || 'akoshijosh03@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'exjuvmytxqsvokth';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

// GET /api/test-email — visit http://localhost:5000/api/test-email in browser to verify
app.get('/api/test-email', async (req, res) => {
  console.log('GMAIL_USER:', GMAIL_USER);
  console.log('GMAIL_PASS set:', !!GMAIL_PASS);
  try {
    await transporter.verify();
    console.log('SMTP connection verified OK');
    res.json({ success: true, message: 'SMTP connected! Credentials are valid.', user: GMAIL_USER });
  } catch (err) {
    console.error('SMTP verify failed:', err.message);
    res.status(500).json({ error: err.message, user: GMAIL_USER, passSet: !!GMAIL_PASS });
  }
});

// POST /api/create-user
app.post('/api/create-user', async (req, res) => {
  const { full_name, email, password, role, status } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  const { error: insertError } = await supabaseAdmin
    .from('users')
    .insert({ id: userId, full_name, email, role, status: status || 'active' });

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return res.status(400).json({ error: insertError.message });
  }

  res.json({ success: true, message: 'User created successfully.' });
});

// POST /api/delete-user
app.post('/api/delete-user', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required.' });

  await supabaseAdmin.auth.admin.deleteUser(id);
  await supabaseAdmin.from('users').delete().eq('id', id);

  res.json({ success: true });
});

// POST /api/send-reservation-email
app.post('/api/send-reservation-email', async (req, res) => {
  const {
    guest_name,
    guest_email,
    room_number,
    room_type,
    check_in,
    check_out,
    nights,
    total_amount,
    notes,
  } = req.body;

  console.log('send-reservation-email called for:', guest_email);
  if (!guest_email) {
    return res.status(400).json({ error: 'Guest email is required.' });
  }

  // Validate email format before attempting to send
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(guest_email)) {
    console.log('Skipping email — invalid format:', guest_email);
    return res.status(400).json({ error: `Invalid email address: "${guest_email}". Please use a full email like name@example.com` });
  }

  const isOpenStay = !check_out;
  const formattedTotal = parseFloat(total_amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
  });

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f6f0; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #07713c, #0a9150); padding: 32px 36px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 1.5rem; letter-spacing: -0.3px; }
    .header p  { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 0.9rem; }
    .body { padding: 32px 36px; }
    .greeting { font-size: 1.05rem; color: #222; margin-bottom: 8px; }
    .subtitle { color: #777; font-size: 0.9rem; margin-bottom: 28px; line-height: 1.5; }
    .section-title { font-size: 0.72rem; font-weight: 700; color: #07713c; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
    .detail-box { background: #f4f6f0; border-radius: 12px; padding: 18px 22px; margin-bottom: 20px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e0e0e0; font-size: 0.88rem; }
    .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-label { color: #777; }
    .detail-value { color: #222; font-weight: 700; text-align: right; }
    .open-badge { background: #fff8e1; color: #f57f17; padding: 2px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; border: 1px solid #ffe082; }
    .total-bar { background: linear-gradient(135deg, #07713c, #0a9150); border-radius: 12px; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .total-label { color: rgba(255,255,255,0.8); font-size: 0.88rem; }
    .total-value { color: white; font-weight: 700; font-size: 1.15rem; }
    .note-box { background: #fffde7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 24px; font-size: 0.86rem; color: #555; line-height: 1.5; }
    .footer-msg { font-size: 0.88rem; color: #666; line-height: 1.6; margin-bottom: 0; }
    .divider { height: 1px; background: #f0f0f0; }
    .footer { background: #f8f9fa; padding: 18px 36px; text-align: center; font-size: 0.78rem; color: #aaa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>&#127968; Reservation Confirmed</h1>
      <p>Your booking is all set &mdash; we can't wait to welcome you!</p>
    </div>

    <div class="body">
      <p class="greeting">Dear <strong>${guest_name}</strong>,</p>
      <p class="subtitle">
        Thank you for your reservation. Here is a summary of your booking details for your reference.
      </p>

      <div class="section-title">Booking Details</div>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Room</span>
          <span class="detail-value">Room ${room_number}${room_type ? ' &mdash; ' + room_type : ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-In</span>
          <span class="detail-value">${check_in}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Check-Out</span>
          <span class="detail-value">
            ${isOpenStay ? '<span class="open-badge">Open Stay</span>' : check_out}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">
            ${isOpenStay ? 'Open-ended stay' : (nights + ' night' + (nights !== 1 ? 's' : ''))}
          </span>
        </div>
      </div>

      <div class="total-bar">
        <span class="total-label">${isOpenStay ? 'Rate per Night' : 'Total Amount'}</span>
        <span class="total-value">&#8369;${formattedTotal}${isOpenStay ? ' / night' : ''}</span>
      </div>

      ${notes ? `
      <div class="section-title">Special Requests</div>
      <div class="note-box">${notes}</div>
      ` : ''}

      <p class="footer-msg">
        If you have any questions or need to make changes, please contact us directly.
        We look forward to your visit!
      </p>
    </div>

    <div class="divider"></div>
    <div class="footer">
      This is an automated confirmation. Please do not reply to this email.
      Akushi_Josh.singson
    </div>
  </div>
</body>
</html>`;

  const textBody = [
    'RESERVATION CONFIRMED',
    '=====================',
    `Dear ${guest_name},`,
    '',
    'Your reservation has been confirmed. Details:',
    '',
    `Room      : Room ${room_number}${room_type ? ' — ' + room_type : ''}`,
    `Check-In  : ${check_in}`,
    `Check-Out : ${isOpenStay ? 'Open Stay' : check_out}`,
    `Duration  : ${isOpenStay ? 'Open-ended stay' : nights + ' night(s)'}`,
    `${isOpenStay ? 'Rate ' : 'Total'}     : P${formattedTotal}${isOpenStay ? '/night' : ''}`,
    notes ? '\nSpecial Requests: ' + notes : '',
    '',
    'We look forward to your stay!',
  ].join('\n');

  try {
    await transporter.sendMail({
      from: `"Hotel Reservations" <${GMAIL_USER}>`,
      to: guest_email,
      subject: `Reservation Confirmed — Room ${room_number}, Check-in ${check_in}`,
      text: textBody,
      html: htmlBody,
    });

    console.log(`Email sent to ${guest_email} for Room ${room_number}`);
    res.json({ success: true, message: 'Confirmation email sent.' });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));