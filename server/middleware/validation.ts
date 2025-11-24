import { NextFunction, Request, Response } from 'express';

export const validateAdminRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fullName, contactNumber, gender, email, password } = req.body;

  // Basic validation
  const errors: string[] = [];

  if (!fullName?.trim()) {
    errors.push('Full name is required');
  }

  if (!contactNumber?.trim()) {
    errors.push('Contact number is required');
  } else if (!/^\+\d{12,15}$/.test(contactNumber)) {
    errors.push('Please provide a valid international phone number');
  }

  if (!gender?.trim()) {
    errors.push('Gender is required');
  }

  if (!email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password?.trim()) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      errors,
    });
  }

  next();
};

export const validateBasicPaymentData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { booking_id, amount, payment_method, transaction_ref, description, status } = req.body;

  const errors: string[] = [];

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Amount is required and must be a positive number');
  }

  if (!payment_method?.trim()) {
    errors.push('Payment method is required');
  }

  if (booking_id !== undefined && booking_id !== null && !booking_id.trim()) {
    errors.push('Booking ID cannot be empty if provided');
  }

  if (transaction_ref !== undefined && transaction_ref !== null && !transaction_ref.trim()) {
    errors.push('Transaction reference cannot be empty if provided');
  }

  if (description !== undefined && description !== null && !description.trim()) {
    errors.push('Description cannot be empty if provided');
  }

  if (status !== undefined && status !== null) {
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      errors.push('Invalid payment status');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      errors,
    });
  }

  next();
};

export const validateBookingData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { homeowner_id, service_id, job_title, job_description, scheduled_date, address, phone_number } = req.body;

  const errors: string[] = [];

  if (!homeowner_id) {
    errors.push('Homeowner ID is required');
  }

  if (!service_id) {
    errors.push('Service ID is required');
  }

  if (!job_title?.trim()) {
    errors.push('Job title is required');
  }

  if (!job_description?.trim()) {
    errors.push('Job description is required');
  }

  if (!scheduled_date) {
    errors.push('Scheduled date is required');
  } else {
    const scheduledDate = new Date(scheduled_date);
    const now = new Date();
    if (scheduledDate <= now) {
      errors.push('Scheduled date must be in the future');
    }
  }

  if (!address?.trim()) {
    errors.push('Address is required');
  }

  if (!phone_number?.trim()) {
    errors.push('Phone number is required');
  } else if (!/^\+\d{12,15}$/.test(phone_number)) {
    errors.push('Please provide a valid international phone number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validatePaymentData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { booking_id, amount, payment_method, payment_reference } = req.body;

  const errors: string[] = [];

  if (!booking_id) {
    errors.push('Booking ID is required');
  }

  if (!amount || amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!payment_method?.trim()) {
    errors.push('Payment method is required');
  }

  if (!payment_reference?.trim()) {
    errors.push('Payment reference is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};