# Quick Start - Test Registration & Login

## 🚀 All User Types Are Working!

---

## Test Admin Registration

### Step 1: Register
Visit: `/admin/register`

Fill in:
- **Full Name**: John Admin
- **Contact Number**: +250788123456
- **Gender**: Male
- **Email**: admin@example.com
- **Password**: password123

Click: **Create Admin Account**

✅ Should see success toast and redirect to `/admin/login`

### Step 2: Login
Visit: `/admin/login`

Enter:
- **Email**: admin@example.com
- **Password**: password123

Click: **Sign In**

✅ Should redirect to `/admin/dashboard`
✅ Should see admin overview with stats

---

## Test Worker Registration

### Step 1: Register
Visit: `/worker/register`

**Required Fields:**
- **Full Name**: Jane Worker
- **Email**: worker@example.com
- **Password**: password123
- **Phone Number**: +250788654321
- **National ID**: 1199970012345678 (valid Rwanda ID format)

**Optional Fields** (add as many as you want):
- Date of Birth
- Gender
- Marital Status
- Type of Work
- Work Experience
- Expected Wages
- etc.

Click: **Create Worker Account**

✅ Should see success toast and redirect to `/worker/login`

### Step 2: Login
Visit: `/worker/login`

Enter:
- **Email**: worker@example.com
- **Password**: password123

Click: **Sign In**

✅ Should redirect to `/worker/dashboard`
✅ Should see worker home page with available jobs

---

## Test Homeowner Registration

### Step 1: Register
Visit: `/homeowner/register`

**Required Fields:**
- **Full Name**: Bob Homeowner
- **Email**: homeowner@example.com
- **Password**: password123
- **Contact Number**: +250788999888
- **Home Address**: KG 123 St, Kigali

**Optional Fields:**
- Age
- Type of Residence
- Number of Family Members
- Home Composition (check boxes for adults/children/elderly/pets)
- Worker Info (full-time/part-time/live-in)
- Preferred Gender
- etc.

Click: **Create Homeowner Account**

✅ Should see success toast and redirect to `/homeowner/login`

### Step 2: Login
Visit: `/homeowner/login`

Enter:
- **Email**: homeowner@example.com
- **Password**: password123

Click: **Sign In**

✅ Should redirect to `/homeowner/dashboard`
✅ Should see homeowner home page with services

---

## Test RBAC (Role-Based Access Control)

### While logged in as Admin:
- Visit `/worker/dashboard` → ❌ Should redirect to `/worker/login`
- Visit `/homeowner/dashboard` → ❌ Should redirect to `/homeowner/login`
- Visit `/admin/dashboard` → ✅ Should stay on page

### While logged in as Worker:
- Visit `/admin/dashboard` → ❌ Should redirect to `/admin/login`
- Visit `/homeowner/dashboard` → ❌ Should redirect to `/homeowner/login`
- Visit `/worker/dashboard` → ✅ Should stay on page

### While logged in as Homeowner:
- Visit `/admin/dashboard` → ❌ Should redirect to `/admin/login`
- Visit `/worker/dashboard` → ❌ Should redirect to `/worker/login`
- Visit `/homeowner/dashboard` → ✅ Should stay on page

---

## Test Validation

### Email Validation
Try registering with invalid email: `notanemail`
✅ Should show error: "Invalid email format"

### Password Validation
Try registering with password: `12345`
✅ Should show error: "Password must be at least 6 characters"

### Duplicate Email
1. Register with email: `test@example.com`
2. Try registering again with same email
✅ Should show error: "Email already registered"

### Required Fields
Try submitting form without filling required fields
✅ Should show error messages for each missing field

---

## Test Database Persistence

### Verify Admin Registration
1. Register as admin
2. Check Supabase:
   - `user_profiles` table should have 1 row with role='admin'
   - `admins` table should have 1 row with same id

### Verify Worker Registration
1. Register as worker
2. Check Supabase:
   - `user_profiles` table should have 1 row with role='worker'
   - `workers` table should have 1 row with all submitted data

### Verify Homeowner Registration
1. Register as homeowner
2. Check Supabase:
   - `user_profiles` table should have 1 row with role='homeowner'
   - `homeowners` table should have 1 row with all submitted data

---

## Common Issues & Solutions

### Issue: "Missing required fields" error
**Solution**: Make sure all required fields are filled:
- Admin: fullName, contactNumber, gender, email, password
- Worker: fullName, email, password, phoneNumber, nationalId
- Homeowner: fullName, email, password, contactNumber, homeAddress

### Issue: "Invalid email format"
**Solution**: Use proper email format (e.g., user@example.com)

### Issue: "Email already registered"
**Solution**: Use a different email or login with existing account

### Issue: Redirected to login after accessing dashboard
**Solution**: You're not logged in or your session expired. Login again.

---

## What's in the Database

### Sample Services (8):
1. House Cleaning 🧹
2. Cooking 👨‍🍳
3. Laundry 👔
4. Childcare 👶
5. Elderly Care 👵
6. Garden Maintenance 🌱
7. Pet Care 🐕
8. General Household Help 🏠

### Sample Trainings (3):
1. Professional House Cleaning
2. Advanced Cooking Skills
3. First Aid and Safety

---

## Next Features to Implement

Based on VERIFICATION_REPORT.md:

### High Priority
1. **Profile Updates**
   - Allow workers to update their profile
   - Allow homeowners to update their profile
   - Need PUT /workers/:id and PUT /homeowners/:id endpoints

2. **Booking Persistence**
   - Homeowner can create real bookings
   - Bookings saved to database
   - Workers can view assigned bookings

3. **Task Management**
   - Add tasks table
   - Workers can view and update tasks
   - Replace hardcoded task data

### Medium Priority
4. Add loading states to profile pages
5. Add form validation to profile editing
6. Add toast notifications for errors

### Low Priority
7. Add pagination to lists
8. Complete WorkerTraining component
9. Complete HomeownerJobs component

---

## Summary

✅ **Admin registration & login** - FULLY WORKING
✅ **Worker registration & login** - FULLY WORKING  
✅ **Homeowner registration & login** - FULLY WORKING
✅ **RBAC protection** - FULLY WORKING
✅ **Database persistence** - FULLY WORKING
✅ **Validation** - FULLY WORKING

**All fixes applied are generic and work for all three user types!**

🎉 You can now use the application with full authentication!
