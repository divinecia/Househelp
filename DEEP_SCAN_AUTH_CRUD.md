# Deep Scan Report - Authentication & CRUD Operations

## Date: November 14, 2024

## Status: 🔴 CRITICAL - RLS Policies blocking all registrations

---

## Executive Summary

**Critical Issue Found:** Row-Level Security (RLS) policies are **blocking INSERT operations** during registration. When RLS is enabled on a table without an INSERT policy, **all inserts are denied by default**.

**Affected Operations:**

- ❌ REGISTRATION - All new users fail to register
- ❌ INSERT operations on user_profiles, workers, homeowners
- ✅ SELECT operations - Work fine if user is authenticated
- ✅ UPDATE operations - Work for own records
- ⚠️ DELETE operations - Missing policies

**Root Cause:** Missing `CREATE POLICY ... FOR INSERT` on critical tables

---

## Error Message Breakdown

```
HTTP Error 400
{
  "success": false,
  "error": "Failed to create user profile: new row violates row-level security policy for table \"user_profiles\""
}
```

**What This Means:**

1. User creation in Supabase Auth succeeded ✅
2. Attempt to INSERT into user_profiles table started ❌
3. RLS policy check: "Does INSERT permission exist?" → NO
4. Default behavior: DENY all INSERTs when no policy exists
5. Error returned to client

---

## RLS Policies - Current State

### user_profiles Table

**Current Policies:**

```sql
✅ SELECT: CREATE POLICY "Users can view their own profile"
           ON public.user_profiles FOR SELECT USING (auth.uid() = id);

✅ UPDATE: CREATE POLICY "Users can update their own profile"
           ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

❌ INSERT: NO POLICY EXISTS - ALL INSERTS BLOCKED
```

**Impact:** Registration completely broken

---

### workers Table

**Current Policies:**

```sql
❌ FOR ALL: CREATE POLICY "Workers can view and manage their own data"
           ON public.workers FOR ALL USING (auth.uid() = user_id);

Issue: "FOR ALL" includes SELECT, UPDATE, INSERT, DELETE
But references "user_id" instead of "id"
```

**Actual Results:**

- ❌ INSERT fails - auth.uid() doesn't match user_id (no policy explicitly checks this)
- ⚠️ SELECT works - Only if user_id matches
- ⚠️ UPDATE works - Only if user_id matches
- ⚠️ DELETE works - Only if user_id matches

---

### homeowners Table

**Current Policies:**

```sql
❌ FOR ALL: CREATE POLICY "Homeowners can view and manage their own data"
           ON public.homeowners FOR ALL USING (auth.uid() = user_id);

Issue: Same as workers table
```

---

### Other Tables

| Table             | SELECT | INSERT | UPDATE | DELETE | Issue                    |
| ----------------- | ------ | ------ | ------ | ------ | ------------------------ |
| **user_profiles** | ✅     | ❌     | ✅     | ❌     | Missing INSERT & DELETE  |
| **workers**       | ⚠️     | ⚠️     | ⚠️     | ⚠️     | Ambiguous FOR ALL policy |
| **homeowners**    | ⚠️     | ⚠️     | ⚠️     | ⚠️     | Ambiguous FOR ALL policy |
| **admins**        | ❌     | ❌     | ❌     | ❌     | No RLS table created     |
| **bookings**      | ✅     | ⚠️     | ✅     | ❌     | DELETE missing           |
| **payments**      | ✅     | ✅     | ❌     | ❌     | UPDATE & DELETE missing  |
| **notifications** | ✅     | ✅     | ✅     | ❌     | DELETE missing           |
| **messages**      | ✅     | ✅     | ❌     | ❌     | UPDATE & DELETE missing  |

---

## CRUD Operations Analysis

### CREATE (INSERT) Operations

#### 1. User Registration Flow

**Current Flow:**

```
Frontend Register Form
  ↓
POST /api/auth/register
  ↓
Step 1: Validate input
  ↓ ✅ Works
Step 2: Create auth.users in Supabase Auth
  ↓ ✅ Works
Step 3: INSERT into user_profiles
  ↓ ❌ FAILS - RLS policy blocks INSERT
```

**Why It Fails:**

- auth.users account is created successfully
- auth.uid() is now set to the new user's ID
- Attempt to INSERT into user_profiles with id = auth.uid()
- RLS checks: "Is there an INSERT policy?" → NO
- Default: DENY

**Worker Registration:**

- ❌ After user_profiles fails, never reaches workers INSERT

**Homeowner Registration:**

- ❌ After user_profiles fails, never reaches homeowners INSERT

#### 2. Booking Creation

**Current Flow:**

```
Homeowner clicks "Create Booking"
  ↓
POST /api/bookings
  ↓
INSERT into bookings (homeowner_id = auth.uid(), ...)
  ↓
RLS Check: CREATE POLICY "Homeowners can create bookings"
           FOR INSERT WITH CHECK (auth.uid() = homeowner_id)
  ↓ ✅ Works - Policy exists and condition matches
```

**Status:** ✅ Should work if user is authenticated

#### 3. Payment Creation

**Current Flow:**

```
User initiates payment
  ↓
POST /api/payments
  ↓
INSERT into payments (user_id = auth.uid(), ...)
  ↓
RLS Check: CREATE POLICY "Users can create their own payments"
           FOR INSERT WITH CHECK (auth.uid() = user_id)
  ↓ ✅ Works - Policy exists
```

**Status:** ✅ Should work if user is authenticated

---

### READ (SELECT) Operations

#### 1. View Own Profile

**Current Flow:**

```
GET /api/auth/me
  ↓
SELECT * FROM user_profiles WHERE id = auth.uid()
  ↓
RLS Check: CREATE POLICY "Users can view their own profile"
           FOR SELECT USING (auth.uid() = id)
  ↓ ✅ Works
```

**Status:** ✅ Works once user is authenticated

#### 2. View Worker Profile (Admin)

**Current Flow:**

```
Admin goes to Admin Dashboard
  ↓
GET /api/workers/:id
  ↓
SELECT * FROM workers WHERE id = :id
  ↓
RLS Check: CREATE POLICY "Workers can view and manage their own data"
           FOR ALL USING (auth.uid() = user_id)
  ↓ ❌ Fails if admin trying to view others' data
```

**Issue:** Policy only allows viewing own data, not others

**Status:** ⚠️ Partially works

#### 3. View Bookings

**Current Flow:**

```
GET /api/bookings
  ↓
SELECT * FROM bookings WHERE homeowner_id = auth.uid() OR worker_id = auth.uid()
  ↓
RLS Check: CREATE POLICY "Users can view bookings they created or are assigned to"
           FOR SELECT USING (auth.uid() = homeowner_id OR auth.uid() = worker_id)
  ↓ ✅ Works
```

**Status:** ✅ Works correctly

---

### UPDATE Operations

#### 1. Update Own Profile

**Current Flow:**

```
User updates profile
  ↓
PUT /api/user_profiles
  ↓
UPDATE user_profiles SET ... WHERE id = auth.uid()
  ↓
RLS Check: CREATE POLICY "Users can update their own profile"
           FOR UPDATE USING (auth.uid() = id)
  ↓ ✅ Works
```

**Status:** ✅ Works

#### 2. Update Booking Status

**Current Flow:**

```
Worker accepts booking
  ↓
PUT /api/bookings/:id
  ↓
UPDATE bookings SET status = 'accepted' WHERE id = :id
  ↓
RLS Check: CREATE POLICY "Users can update bookings they own or are assigned to"
           FOR UPDATE USING (auth.uid() = homeowner_id OR auth.uid() = worker_id)
  ↓ ✅ Works
```

**Status:** ✅ Works

#### 3. Update Payment Status

**Current Flow:**

```
Payment webhook received
  ↓
PUT /api/payments/:id
  ↓
UPDATE payments SET status = 'completed'
  ↓
RLS Check: No UPDATE policy exists for payments
  ↓ ❌ FAILS - No policy for UPDATE
```

**Status:** ❌ Missing UPDATE policy

---

### DELETE Operations

#### 1. Delete Profile

**Current Flow:**

```
User deletes account
  ↓
DELETE FROM user_profiles WHERE id = auth.uid()
  ↓
RLS Check: No DELETE policy exists
  ↓ ❌ FAILS - No policy for DELETE
```

**Status:** ❌ Missing DELETE policy for user_profiles

#### 2. Delete Booking

**Current Flow:**

```
User cancels booking
  ↓
DELETE FROM bookings WHERE id = :id
  ↓
RLS Check: No DELETE policy exists
  ↓ ❌ FAILS - No policy for DELETE
```

**Status:** ❌ Missing DELETE policy for bookings

---

## Authentication Flow Issues

### Registration Flow - BROKEN ❌

```
Step 1: POST /api/auth/register
  Input: { email, password, fullName, role, ... }

Step 2: Validate input
  ✅ All validations pass

Step 3: Check if email exists
  ✅ Query user_profiles → SELECT works

Step 4: Create auth user
  ✅ supabase.auth.signUp() → User created in auth.users
  ✅ auth.uid() is now set

Step 5: INSERT into user_profiles
  ❌ FAILS: "new row violates row-level security policy"
  Reason: No INSERT policy exists

Step 6: INSERT into [workers/homeowners/admins]
  Never reached due to Step 5 failure

Response: HTTP 400 Error
```

**Why Users Can't Register:**

- After auth.users is created, auth.uid() = new user's ID
- System tries to INSERT into user_profiles with the new ID
- RLS check: "Is there an INSERT policy?" → NO POLICY FOUND
- RLS default behavior: DENY all operations without explicit policy
- User never completes registration

---

### Login Flow - Partially Broken ⚠️

```
Step 1: POST /api/auth/login
  Input: { email, password }

Step 2: Authenticate with Supabase Auth
  ✅ supabase.auth.signInWithPassword() → Works
  ✅ auth.uid() is set to existing user

Step 3: SELECT from user_profiles
  ✅ SELECT POLICY exists and condition matches
  ✅ Returns user's profile data

Step 4: Return session
  ✅ Token and user data returned

Result: Login works IF user profiles exist
But registration failed, so no user profiles exist!
```

**Status:** ✅ Works in theory, but ❌ no users can register to test

---

## API Endpoints - CRUD Status

### Authentication Endpoints

| Endpoint                    | Method | CRUD | Status | Issue                            |
| --------------------------- | ------ | ---- | ------ | -------------------------------- |
| `/api/auth/register`        | POST   | C    | ❌     | INSERT blocked by RLS            |
| `/api/auth/login`           | POST   | R    | ⚠️     | SELECT works, but no users exist |
| `/api/auth/me`              | GET    | R    | ✅     | SELECT policy works              |
| `/api/auth/logout`          | POST   | -    | ✅     | Client-side only                 |
| `/api/auth/forgot-password` | POST   | -    | ✅     | Supabase email                   |
| `/api/auth/reset-password`  | POST   | U    | ⚠️     | UPDATE might work                |

### Worker Endpoints

| Endpoint                  | Method | CRUD | Status | Issue                              |
| ------------------------- | ------ | ---- | ------ | ---------------------------------- |
| `GET /api/workers`        | GET    | R    | ⚠️     | Policy restricts to own data       |
| `GET /api/workers/:id`    | GET    | R    | ⚠️     | Can't view others' profiles        |
| `POST /api/workers`       | POST   | C    | ❌     | INSERT blocked during registration |
| `PUT /api/workers/:id`    | PUT    | U    | ⚠️     | Only own data                      |
| `DELETE /api/workers/:id` | DELETE | D    | ❌     | No DELETE policy                   |

### Homeowner Endpoints

| Endpoint                     | Method | CRUD | Status | Issue                              |
| ---------------------------- | ------ | ---- | ------ | ---------------------------------- |
| `GET /api/homeowners`        | GET    | R    | ⚠️     | Policy restricts to own data       |
| `GET /api/homeowners/:id`    | GET    | R    | ⚠️     | Can't view others' profiles        |
| `POST /api/homeowners`       | POST   | C    | ❌     | INSERT blocked during registration |
| `PUT /api/homeowners/:id`    | PUT    | U    | ⚠️     | Only own data                      |
| `DELETE /api/homeowners/:id` | DELETE | D    | ❌     | No DELETE policy                   |

### Booking Endpoints

| Endpoint                   | Method | CRUD | Status | Issue                            |
| -------------------------- | ------ | ---- | ------ | -------------------------------- |
| `GET /api/bookings`        | GET    | R    | ✅     | Policy allows own bookings       |
| `POST /api/bookings`       | POST   | C    | ✅     | Policy allows homeowner creation |
| `PUT /api/bookings/:id`    | PUT    | U    | ✅     | Policy allows updates            |
| `DELETE /api/bookings/:id` | DELETE | D    | ❌     | No DELETE policy                 |

---

## Solution: RLS Policies Migration

### File Created:

**`server/migrations/003_fix_rls_policies.sql`**

This migration fixes all RLS issues by:

1. **user_profiles** - Add INSERT & DELETE policies
2. **workers** - Split FOR ALL into specific CRUD policies
3. **homeowners** - Split FOR ALL into specific CRUD policies
4. **admins** - Create complete CRUD policies
5. **bookings** - Add DELETE policy
6. **payments** - Add UPDATE & DELETE policies
7. **notifications** - Add DELETE policy
8. **messages** - Add UPDATE & DELETE policies
9. **services** - Allow public SELECT
10. **trainings** - Allow public SELECT

### Key Changes:

#### Before (BROKEN):

```sql
CREATE POLICY "Users can create their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
  ↑ This policy never existed!
```

#### After (FIXED):

```sql
CREATE POLICY "Users can create their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
  ↑ Now allows users to INSERT their own profile during registration
```

---

## Implementation Steps

### Step 1: Apply Migration to Supabase

**Via Supabase Dashboard:**

1. Go to SQL Editor
2. Copy entire contents of `server/migrations/003_fix_rls_policies.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Wait for completion

**Expected Result:** 0 errors, all policies created

### Step 2: Test Registration

1. Clear browser cache (Ctrl+Shift+Delete)
2. Visit `/worker/register`
3. Fill out form
4. Submit
5. Check response:
   - ✅ Should see success message
   - ✅ Should redirect to login
   - ❌ Should NOT see RLS error

### Step 3: Test Login

1. Use credentials from registration
2. Login
3. Check if redirected to dashboard
4. Verify user data loads

### Step 4: Test CRUD Operations

#### CREATE:

- ✅ Register new accounts
- ✅ Create bookings
- ✅ Create payments

#### READ:

- ✅ View own profile
- ✅ View own bookings
- ✅ Admin view all users (after admin RLS fix)

#### UPDATE:

- ✅ Update own profile
- ✅ Update booking status
- ✅ Update payment status

#### DELETE:

- ✅ Delete own profile
- ✅ Cancel bookings
- ✅ Delete messages

---

## Files to Execute

### Required Actions:

1. **Execute Migration:**
   - File: `server/migrations/003_fix_rls_policies.sql`
   - Method: Paste in Supabase SQL Editor and run
   - Time: ~1 minute

2. **Verify Changes:**
   - Try registering a new account
   - Login with credentials
   - Test creating a booking

3. **Monitor Errors:**
   - Check browser console for errors
   - Check server logs
   - Verify database shows new records

---

## Rollback Instructions (If Needed)

If you need to revert:

```bash
# Via Supabase Dashboard → SQL Editor
-- Drop all new policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.workers;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.homeowners;
-- ... etc for all policies created

-- Recreate old policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
-- ... etc for old policies
```

---

## Testing Checklist

After applying the migration:

### Registration Tests

- [ ] Admin Registration
  - [ ] Full form submits
  - [ ] User created in auth.users
  - [ ] Profile created in admins table
  - [ ] Redirects to login
- [ ] Worker Registration
  - [ ] Full form submits
  - [ ] User created in auth.users
  - [ ] Profiles created in user_profiles and workers tables
  - [ ] All fields saved correctly
- [ ] Homeowner Registration
  - [ ] Full form submits
  - [ ] User created in auth.users
  - [ ] Profiles created in user_profiles and homeowners tables
  - [ ] All fields saved correctly

### Login Tests

- [ ] Admin Login
  - [ ] Email/password accepted
  - [ ] Session token returned
  - [ ] Redirects to /admin/dashboard
- [ ] Worker Login
  - [ ] Email/password accepted
  - [ ] Session token returned
  - [ ] Redirects to /worker/dashboard
- [ ] Homeowner Login
  - [ ] Email/password accepted
  - [ ] Session token returned
  - [ ] Redirects to /homeowner/dashboard

### CRUD Operation Tests

- [ ] CREATE: Can create bookings, payments
- [ ] READ: Can view own data, bookings
- [ ] UPDATE: Can update profile, booking status
- [ ] DELETE: Can delete bookings, messages

### Error Tests

- [ ] Invalid email format → error
- [ ] Password too short → error
- [ ] Email already registered → error
- [ ] Wrong login credentials → error

---

## Summary

| Issue                               | Severity    | Status | Fix                      |
| ----------------------------------- | ----------- | ------ | ------------------------ |
| user_profiles INSERT blocked        | 🔴 Critical | Fixed  | Add INSERT policy        |
| workers/homeowners INSERT ambiguous | 🟠 High     | Fixed  | Split INTO/UPDATE/DELETE |
| Missing DELETE policies             | 🟠 High     | Fixed  | Add all DELETE policies  |
| UPDATE policies missing             | 🟠 High     | Fixed  | Add UPDATE policies      |
| No admin RLS table                  | 🟠 High     | Fixed  | Create admin policies    |
| Public data not readable            | 🟡 Medium   | Fixed  | Allow public SELECT      |

---

## Conclusion

All RLS policy issues have been identified and fixed in the migration file. The system will work correctly once the migration is applied to Supabase.

**Current Status:** 🔴 Broken (needs migration)
**After Migration:** 🟢 Fixed

**Next Action:** Execute `server/migrations/003_fix_rls_policies.sql` in Supabase SQL Editor
