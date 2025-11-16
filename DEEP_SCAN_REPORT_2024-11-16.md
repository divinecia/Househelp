# Deep Scan Report - HouseHelp Project
**Date**: November 16, 2024
**Scope**: Full-stack analysis (Frontend → Backend → Database)

## Executive Summary

A comprehensive deep scan of the HouseHelp project revealed **critical schema mismatches** between the backend code and database schema that would cause **ALL user registrations and CRUD operations to fail**. These issues have been identified and migration scripts created to resolve them.

### Severity Breakdown
- **Critical Issues**: 3 (user_profiles, workers, homeowners schema mismatches)
- **High Issues**: 1 (payments table missing booking_id)
- **Medium Issues**: 2 (services table, JSONB field handling)
- **Low Issues**: 1 (CORS configuration warning)

---

## Critical Issues (Must Fix Immediately)

### 1. user_profiles Table Schema Mismatch ⚠️ CRITICAL
**File**: `server/migrations/001_init_schema.sql` (line 6)  
**Impact**: **ALL user registrations fail**

**Problem**:
- Database schema defines: `fullName TEXT` (camelCase)
- Backend expects: `full_name` (snake_case)
- Auth route tries to insert: `full_name` → **ERROR: column "full_name" does not exist**

**Evidence**:
```sql
-- Database (001_init_schema.sql)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  fullName TEXT NOT NULL,  ← CAMELCASE
  ...
);
```

```typescript
// Backend (server/routes/auth.ts:109)
.insert([{
  id: authData.user.id,
  email,
  full_name: fullName,  ← SNAKE_CASE
  role,
}])
```

**Solution**: Migration 004 renames `fullName` → `full_name`

**Test to Verify**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -d '{"email":"test@test.com","password":"test","fullName":"Test","role":"admin"}'
```
Without fix: `ERROR: column "full_name" does not exist`  
With fix: `SUCCESS: { "id": "...", "email": "...", "full_name": "Test" }`

---

### 2. workers Table Schema Mismatch ⚠️ CRITICAL
**File**: `server/migrations/001_init_schema.sql` (lines 41-65)  
**Impact**: **ALL worker registrations and updates fail**

**Problem**: 17 columns in camelCase but backend expects snake_case

**Mismatched Columns**:
| Database (camelCase) | Backend Expects (snake_case) |
|---------------------|------------------------------|
| dateOfBirth | date_of_birth |
| maritalStatus | marital_status |
| phoneNumber | phone_number |
| nationalId | national_id |
| typeOfWork | type_of_work |
| workExperience | work_experience |
| expectedWages | expected_wages |
| workingHoursAndDays | working_hours_and_days |
| educationQualification | education_qualification |
| trainingCertificate | training_certificate_url |
| languageProficiency | language_proficiency |
| healthCondition | health_condition |
| emergencyName | emergency_contact_name |
| emergencyContact | emergency_contact_phone |
| bankAccountNumber | bank_account_number |
| accountHolder | account_holder_name |
| insuranceCompany | insurance_company |

**Solution**: Migration 002 + 004 rename all columns to snake_case

---

### 3. homeowners Table Schema Mismatch ⚠️ CRITICAL
**File**: `server/migrations/001_init_schema.sql` (lines 67-96)  
**Impact**: **ALL homeowner registrations and updates fail**

**Problem**: 21 columns in camelCase but backend expects snake_case

**Mismatched Columns** (partial list):
- homeAddress → home_address
- typeOfResidence → type_of_residence
- numberOfFamilyMembers → number_of_family_members
- homeComposition → home_composition
- workerInfo → worker_info
- (and 16 more...)

**Solution**: Migration 002 + 004 rename all columns to snake_case

---

## High Priority Issues

### 4. payments Table Missing booking_id Column 🔴 HIGH
**File**: `server/migrations/001_init_schema.sql` (lines 12-25)  
**Impact**: Cannot link payments to bookings

**Problem**:
- Payment routes expect `booking_id` to link payments to bookings
- Schema only has `user_id`, no `booking_id` column
- Payment creation for bookings will fail

**Schema Definition**:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,      ← Only user_id
  amount DECIMAL(10, 2),
  -- Missing: booking_id ❌
);
```

**Backend Expectation** (server/routes/payment.ts):
```typescript
// Tries to insert booking_id
const { booking_id, amount, ... } = req.body;
```

**Solution**: Migration 004 adds `booking_id UUID REFERENCES bookings(id)`

**Additional Fixes**:
- Make `user_id` nullable (can be derived from booking)
- Make `currency` nullable (has default value)

---

## Medium Priority Issues

### 5. services Table Column Name Mismatch 🟡 MEDIUM
**File**: `server/migrations/001_init_schema.sql` (line 161)  
**Impact**: Service creation/updates may fail

**Problem**:
- Database: `baseRate DECIMAL(10, 2)` (camelCase)
- Backend expects: `base_rate` (snake_case)

**Solution**: Migration 004 renames `baseRate` → `base_rate`

---

### 6. JSONB Field Handling (homeComposition) 🟡 MEDIUM
**File**: `server/middleware/normalize-request.ts`  
**Impact**: Nested object fields may have inconsistent casing

**Problem**:
- Frontend sends: `homeComposition: { "hasAdults": true, "hasChildren": true }`
- Middleware converts to: `home_composition: { "has_adults": true, "has_children": true }`
- But if database expects JSON with camelCase keys, mismatch occurs

**Analysis**:
The normalize-request middleware recursively converts ALL keys to snake_case, including nested objects. This is correct IF the backend/database consistently use snake_case.

**Current Behavior**:
```javascript
// Input
{ homeComposition: { hasAdults: true } }

// After middleware
{ home_composition: { has_adults: true } }
```

**Recommendation**: 
- Keep current behavior (full snake_case conversion)
- Document that JSONB fields should use snake_case keys
- Or: Exclude JSONB fields from conversion if needed

**Status**: No immediate action needed if backend consistently expects snake_case

---

## Low Priority Issues

### 7. CORS Configuration with Wildcard Origin 🔵 LOW
**File**: `server/index.ts` (lines 26-35)  
**Impact**: Cookie-based auth would fail in development

**Problem**:
```typescript
cors({
  origin: true,           // Allow all origins in dev
  credentials: false,     // Must be false with wildcard
})
```

**Analysis**:
- Current config is correct for token-based auth
- If switching to cookie-based auth, this would break
- Supabase auth cookies would not work

**Recommendation**: 
- Current setup is fine for JWT tokens
- Document this limitation
- If adding cookie auth, update CORS config

**Status**: No action needed (working as designed)

---

## Frontend-Backend Alignment

### API Client Configuration ✅ CORRECT
**File**: `client/lib/api-client.ts` (line 11)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
```

**Analysis**:
- Uses relative `/api` path by default
- Works correctly with Vite dev server proxy
- No hardcoded localhost URLs
- Replit-compatible

**Status**: ✅ No issues found

---

### Request/Response Format ✅ CORRECT
**Files**: All API client functions use consistent format

**Analysis**:
- All requests send JSON with proper headers
- Responses follow consistent `{ success, data, error }` format
- Error handling is consistent
- Token refresh logic is implemented

**Status**: ✅ No issues found

---

## Backend-Database Alignment

### Normalize Request Middleware ✅ CORRECT
**File**: `server/middleware/normalize-request.ts`

**Analysis**:
- Converts ALL incoming camelCase to snake_case
- Recursive conversion handles nested objects
- Applied to POST, PUT, PATCH requests
- This is WHY backend expects snake_case columns

**Status**: ✅ Working correctly (once schema is fixed)

---

### Database Query Patterns ✅ CORRECT
**Files**: `server/routes/*.ts`

**Analysis**:
- All queries use snake_case column names
- Consistent with normalize-request middleware
- Proper foreign key relationships
- Uses parameterized queries (no SQL injection risk)

**Status**: ✅ No issues found

---

## Missing Implementations

### 1. Worker Profile Update Endpoint ⚠️ MISSING
**Status**: PUT /api/workers/:id exists but incomplete

**Found In**: `server/routes/workers.ts`

**Issue**: Route exists but may need additional validation

**Recommendation**: Test and verify after schema fix

---

### 2. Homeowner Profile Update Endpoint ⚠️ MISSING
**Status**: PUT /api/homeowners/:id exists but incomplete

**Found In**: `server/routes/homeowners.ts`

**Issue**: Route exists but may need additional validation

**Recommendation**: Test and verify after schema fix

---

## Environment Variables

### Required Secrets ✅ PRESENT
**Analysis of .env.example**:

**Critical (Must Have)**:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY  
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY

**Optional (Nice to Have)**:
- SENDGRID_API_KEY (for emails)
- FLUTTERWAVE_SECRET_KEY (for payments)
- PAYPACK_APPLICATION_ID (for payments)

**Status**: All required variables documented in .env.example

---

## TypeScript Errors Fixed

### server/node-build.ts ✅ FIXED
**Error**: Type mismatch for port variable
```typescript
// Before
const port = process.env.PORT || 5000; // string | number

// After
const port = Number(process.env.PORT) || 5000; // number
```

**Status**: ✅ Fixed

---

## Migration Summary

### Files Created/Modified

1. **004_complete_schema_fixes.sql** (NEW)
   - Renames user_profiles.fullName → full_name
   - Adds payments.booking_id column
   - Renames services.baseRate → base_rate
   - Adds missing columns to workers/homeowners
   - Makes payment constraints more flexible

2. **DATABASE_MIGRATION_GUIDE.md** (NEW)
   - Comprehensive migration instructions
   - Test cases for verification
   - Troubleshooting guide

3. **server/node-build.ts** (MODIFIED)
   - Fixed port type conversion

---

## Testing Checklist

### After Running Migrations

- [ ] Test Admin Registration (`POST /api/auth/register`)
- [ ] Test Worker Registration (`POST /api/auth/register`)
- [ ] Test Homeowner Registration (`POST /api/auth/register`)
- [ ] Test Admin Login (`POST /api/auth/login`)
- [ ] Test Worker Login (`POST /api/auth/login`)
- [ ] Test Homeowner Login (`POST /api/auth/login`)
- [ ] Test Worker Profile Update (`PUT /api/workers/:id`)
- [ ] Test Homeowner Profile Update (`PUT /api/homeowners/:id`)
- [ ] Test Booking Creation (`POST /api/bookings`)
- [ ] Test Payment Creation (`POST /api/payments`)
- [ ] Verify all dropdown/options endpoints work
- [ ] Check browser console for any API errors

---

## Recommendations

### Immediate Actions (Before Testing)

1. **Run All Migrations in Supabase**
   ```
   001_init_schema.sql
   002_schema_normalization.sql
   003_fix_rls_policies.sql
   004_complete_schema_fixes.sql  ← NEW
   ```

2. **Verify Schema**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name IN ('user_profiles', 'workers', 'homeowners', 'payments')
   ORDER BY table_name, ordinal_position;
   ```

3. **Test Registration Flow**
   - Use curl commands or Postman
   - Try all three user types
   - Verify data in Supabase dashboard

### Short-term Improvements

1. Add migration runner script
2. Add schema validation tests
3. Add API integration tests
4. Improve error messages to be user-friendly
5. Add request/response logging for debugging

### Long-term Improvements

1. Consider using an ORM (Prisma, Drizzle) for type safety
2. Add database backups before migrations
3. Implement database seeding for test data
4. Add API rate limiting
5. Add request validation middleware

---

## Conclusion

The HouseHelp project has a well-structured architecture, but suffers from a critical schema mismatch between the database (camelCase) and backend expectations (snake_case). This mismatch was introduced when:

1. The initial schema (001) used camelCase column names
2. The backend was written to expect snake_case (via normalize-request middleware)
3. Migration 002 fixed workers/homeowners but **missed user_profiles**
4. Migration 004 was created to complete the fixes

**Impact**: Without fixes, **0% of user registrations would work**.

**With fixes**: All functionality should work as designed.

**Next Step**: Run migrations 001→002→003→004 in Supabase and test!

---

## Files Modified/Created

### New Files
- `server/migrations/004_complete_schema_fixes.sql`
- `DATABASE_MIGRATION_GUIDE.md`
- `DEEP_SCAN_REPORT_2024-11-16.md` (this file)

### Modified Files
- `server/node-build.ts` (TypeScript error fix)
- `vite.config.ts` (Replit configuration)

### Files Verified (No Changes Needed)
- `client/lib/api-client.ts`
- `server/middleware/normalize-request.ts`
- `server/routes/*.ts`
- `server/index.ts`

---

**Scan completed successfully. Ready for migration and testing.**
