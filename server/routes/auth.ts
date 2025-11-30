
import { Router } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { supabaseService } from '../lib/supabase';

const PHONE_REGEX = /^\+\d{12,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const router = Router();

// Register a new user (supports admin, homeowner, and worker roles)
router.post('/register', async (req, res) => {
  // The normalizeRequestBody middleware converts camelCase to snake_case
  // So we primarily use snake_case, but support camelCase as fallback
  const { role, full_name, fullName, contact_number, contactNumber, gender, email, password } = req.body;

  // Normalize field names (snake_case takes priority due to middleware)
  const normalizedFullName = full_name || fullName;
  const normalizedContactNumber = contact_number || contactNumber;

  // Validate role
  if (!role || !['admin', 'homeowner', 'worker'].includes(role)) {
    return res.status(400).json({ 
      error: 'Role is required and must be admin, homeowner, or worker',
      code: 'INVALID_ROLE'
    });
  }

  // Comprehensive validation
  const errors: string[] = [];

  if (!normalizedFullName?.trim()) {
    errors.push('Full name is required');
  }

  if (!normalizedContactNumber?.trim()) {
    errors.push('Contact number is required');
  } else if (!PHONE_REGEX.test(normalizedContactNumber)) {
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

  // Role-specific validation (snake_case takes priority due to middleware)
  if (role === 'homeowner') {
    const homeAddress = req.body.home_address || req.body.homeAddress;
    if (!homeAddress?.trim()) {
      errors.push('Home address is required for homeowners');
    }
  }

  if (role === 'worker') {
    const dateOfBirth = req.body.date_of_birth || req.body.dateOfBirth;
    const nationalId = req.body.national_id || req.body.nationalId;

    if (!dateOfBirth?.trim()) {
      errors.push('Date of birth is required for workers');
    }
    if (!nationalId?.trim()) {
      errors.push('National ID is required for workers');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists in user_profiles (central user management)
    const { data: existingUsers } = await supabaseService
      .from('user_profiles')
      .select('id')
      .eq('email', email.toLowerCase()) // Normalize email case
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'Email already exists',
        code: 'EMAIL_EXISTS' // More specific error code
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Start a transaction by creating user profile first
    const userId = crypto.randomUUID();

    // Create user profile first (central user management)
    const { error: profileError } = await supabaseService
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: email.toLowerCase(),
          full_name: normalizedFullName,
          role: role,
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

    // Create role-specific record
    let roleData;
    let roleError;

    if (role === 'admin') {
      const { data, error } = await supabaseService
        .from('admins')
        .insert([
          {
            id: userId,
            email: email.toLowerCase(),
            full_name: normalizedFullName,
            contact_number: normalizedContactNumber,
            gender: gender,
            password_hash: passwordHash,
          },
        ])
        .select()
        .single();
      roleData = data;
      roleError = error;
    } else if (role === 'worker') {
      // Normalize field names for worker registration (snake_case takes priority)
      const dateOfBirth = req.body.date_of_birth || req.body.dateOfBirth;
      const nationalId = req.body.national_id || req.body.nationalId;

      console.log('Creating worker with data:', {
        id: userId,
        email: email.toLowerCase(),
        full_name: normalizedFullName,
        contact_number: normalizedContactNumber,
        gender: gender,
        password_hash: passwordHash,
        date_of_birth: dateOfBirth,
        // Add missing required fields
        verification_status: 'pending'
      });

      const { data, error } = await supabaseService
        .from('workers')
        .insert([
          {
            id: userId,
            email: email.toLowerCase(),
            full_name: normalizedFullName,
            contact_number: normalizedContactNumber,
            gender: gender,
            password_hash: passwordHash,
            date_of_birth: dateOfBirth,
            // Add missing required fields
            verification_status: 'pending'
          },
        ])
        .select()
        .single();
      roleData = data;
      roleError = error;
    } else if (role === 'homeowner') {
      // Normalize field names for homeowner registration (snake_case takes priority)
      const homeAddress = req.body.home_address || req.body.homeAddress;
      const typeOfResidence = req.body.type_of_residence || req.body.typeOfResidence;
      const numberOfFamilyMembers = req.body.number_of_family_members || req.body.numberOfFamilyMembers;
      const postalCode = req.body.postal_code || req.body.postalCode;

      console.log('Creating homeowner with data:', {
        id: userId,
        email: email.toLowerCase(),
        full_name: normalizedFullName,
        contact_number: normalizedContactNumber,
        gender: gender,
        password_hash: passwordHash,
        address: homeAddress,
        residence_type: typeOfResidence,
        household_size: numberOfFamilyMembers ? parseInt(numberOfFamilyMembers) : null,
        // Add required fields that might be missing
        city: req.body.city || null,
        state: req.body.state || null,
        postal_code: postalCode || null,
        verification_status: 'pending'
      });

      const { data, error } = await supabaseService
        .from('homeowners')
        .insert([
          {
            id: userId,
            email: email.toLowerCase(),
            full_name: normalizedFullName,
            contact_number: normalizedContactNumber,
            gender: gender,
            password_hash: passwordHash,
            address: homeAddress,
            residence_type: typeOfResidence,
            household_size: numberOfFamilyMembers ? parseInt(numberOfFamilyMembers) : null,
            // Add missing required fields
            city: req.body.city || null,
            state: req.body.state || null,
            postal_code: postalCode || null,
            verification_status: 'pending'
          },
        ])
        .select()
        .single();
      roleData = data;
      roleError = error;
    }

    if (roleError) {
      console.error(`${role} creation error:`, roleError);
      // Rollback: delete the user profile if role creation failed
      await supabaseService.from('user_profiles').delete().eq('id', userId);
      return res.status(500).json({ 
        error: `Failed to create ${role}`,
        code: `${role.toUpperCase()}_CREATION_FAILED`
      });
    }

    res.status(201).json({
      data: {
        id: roleData.id,
        email: roleData.email,
        role: role,
      },
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
    });
  } catch (error) {
    console.error(`${role} registration error:`, error);
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

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  // Validation
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      error: 'Please provide a valid email address'
    });
  }

  // Validate role if provided (optional but recommended for security)
  if (role && !['admin', 'homeowner', 'worker'].includes(role)) {
    return res.status(400).json({
      error: 'Invalid role specified',
      code: 'INVALID_ROLE'
    });
  }

  try {
    // Find user in user_profiles
    const { data: userProfile, error: profileError } = await supabaseService
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (profileError || !userProfile) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // If role is specified, verify it matches the user's role
    if (role && userProfile.role !== role) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Get user data based on role
    let userData;
    const { data: roleData, error: roleError } = await supabaseService
      .from(userProfile.role + 's') // workers, homeowners, or admins
      .select('*')
      .eq('id', userProfile.id)
      .single();

    if (roleError || !roleData) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    userData = roleData;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Create JWT token (you might want to use a proper JWT library)
    const tokenPayload = {
      userId: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      // Add expiration if needed
    };

    // For now, return a simple success response
    // In a production app, you'd want to use JWT tokens
    res.json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          fullName: userProfile.full_name,
        },
        token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64'), // Simple token for now
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Verify authentication endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Decode the token (simple base64 for now)
    try {
      const tokenPayload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Verify user still exists
      const { data: userProfile, error: profileError } = await supabaseService
        .from('user_profiles')
        .select('id, email, role, full_name')
        .eq('id', tokenPayload.userId)
        .eq('email', tokenPayload.email)
        .single();

      if (profileError || !userProfile) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid token' 
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
            fullName: userProfile.full_name,
          }
        }
      });

    } catch (decodeError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token format' 
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Logout endpoint
router.post('/logout', async (_req, res) => {
  try {
    // In a real implementation, you might want to:
    // 1. Invalidate the token on the server side
    // 2. Clear any server-side session data
    // 3. Log the logout event
    
    // For now, we'll just return a success response
    // The client should clear the token from storage
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ 
      error: 'Please provide a valid email address' 
    });
  }

  try {
    // Check if user exists
    const { data: userProfile, error: profileError } = await supabaseService
      .from('user_profiles')
      .select('id, email, role')
      .eq('email', email.toLowerCase())
      .single();

    if (profileError || !userProfile) {
      // Don't reveal whether email exists for security
      return res.json({ 
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token (simple implementation)
    const resetToken = crypto.randomUUID();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // Token expires in 1 hour

    // Store reset token in the user's role-specific table
    const { error: updateError } = await supabaseService
      .from(userProfile.role + 's')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetExpiry.toISOString()
      })
      .eq('id', userProfile.id);

    if (updateError) {
      console.error('Failed to store reset token:', updateError);
      return res.status(500).json({ 
        error: 'Failed to process password reset request'
      });
    }

    // In a real implementation, you'd send an email here
    // For now, we'll return the token (in development only)
    res.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email.',
      // Only include token in development for testing
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken,
        resetLink: `http://localhost:5173/reset-password?token=${resetToken}`
      })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  const { password, token } = req.body;

  if (!password?.trim() || !token?.trim()) {
    return res.status(400).json({ 
      error: 'Password and reset token are required' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  try {
    // Find user by reset token across all role tables
    let userData = null;
    let userRole = null;

    // Check in admins table
    const { data: adminData } = await supabaseService
      .from('admins')
      .select('*')
      .eq('reset_token', token)
      .single();

    if (adminData && adminData.reset_token_expiry) {
      const expiry = new Date(adminData.reset_token_expiry);
      if (expiry > new Date()) {
        userData = adminData;
        userRole = 'admin';
      }
    }

    // Check in workers table if not found
    if (!userData) {
      const { data: workerData } = await supabaseService
        .from('workers')
        .select('*')
        .eq('reset_token', token)
        .single();

      if (workerData && workerData.reset_token_expiry) {
        const expiry = new Date(workerData.reset_token_expiry);
        if (expiry > new Date()) {
          userData = workerData;
          userRole = 'worker';
        }
      }
    }

    // Check in homeowners table if not found
    if (!userData) {
      const { data: homeownerData } = await supabaseService
        .from('homeowners')
        .select('*')
        .eq('reset_token', token)
        .single();

      if (homeownerData && homeownerData.reset_token_expiry) {
        const expiry = new Date(homeownerData.reset_token_expiry);
        if (expiry > new Date()) {
          userData = homeownerData;
          userRole = 'homeowner';
        }
      }
    }

    if (!userData) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN'
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    const { error: updateError } = await supabaseService
      .from(userRole + 's')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Failed to reset password:', updateError);
      return res.status(500).json({ 
        error: 'Failed to reset password'
      });
    }

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
});

export default router;