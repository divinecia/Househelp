import { Router } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '@/server/lib/supabase';
import { Admin } from '@/server/lib/types';

const PHONE_REGEX = /^\+\d{12,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = Router();

// Register a new admin
router.post('/register', async (req, res) => {
  const { fullName, contactNumber, gender, email, password } = req.body;

  // Comprehensive validation
  const errors: string[] = [];

  if (!fullName?.trim()) {
    errors.push('Full name is required');
  }

  if (!contactNumber?.trim()) {
    errors.push('Contact number is required');
  } else if (!PHONE_REGEX.test(contactNumber)) {
    errors.push('Please provide a valid international phone number (e.g., +25078xxxxxxx)');
  }

  if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
    errors.push('Gender must be male, female, or other');
  }

  if (!email?.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password?.trim()) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists in user_profiles (central user management)
    const { data: existingUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email.toLowerCase()) // Normalize email case
      .limit(1);

    if (existingUsers?.length > 0) {
      return res.status(400).json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' // More specific error code
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Start a transaction by creating user profile first
    const adminId = crypto.randomUUID();

    // Create user profile first (central user management)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: adminId,
          email: email.toLowerCase(),
          full_name: fullName,
          role: 'admin',
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('User profile creation error:', profileError);
      return res.status(500).json({ 
        error: 'Failed to create user profile',
        code: 'PROFILE_CREATION_FAILED'
      });
    }

    // Create admin record with correct field names matching the database schema
    const { data: newAdmin, error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          id: adminId,
          email: email.toLowerCase(),
          full_name: fullName,
          contact_number: contactNumber,
          gender: gender,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (adminError) {
      console.error('Admin creation error:', adminError);
      // Rollback: delete the user profile if admin creation failed
      await supabase.from('user_profiles').delete().eq('id', adminId);
      return res.status(500).json({ 
        error: 'Failed to create admin',
        code: 'ADMIN_CREATION_FAILED'
      });
    }

    res.status(201).json({
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        // Don't return sensitive data
      },
      message: 'Admin registered successfully',
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    // Better error handling
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;