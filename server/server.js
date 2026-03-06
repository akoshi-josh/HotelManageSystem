const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Admin client using service role key — bypasses email confirmation
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/create-user
app.post('/api/create-user', async (req, res) => {
  const { full_name, email, password, role, status } = req.body;

  if (!full_name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Create user in Supabase Auth instantly (no email confirmation)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  // Insert into users table
  const { error: insertError } = await supabaseAdmin
    .from('users')
    .insert({ id: userId, full_name, email, role, status: status || 'active' });

  if (insertError) {
    // Rollback: delete auth user if insert fails
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));