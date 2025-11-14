# HouseHelp Database Setup Guide

## Prerequisites

- Supabase account (free at https://supabase.com)
- Node.js 16+
- Familiarity with SQL

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `househelp`
   - **Database Password**: Create a strong password
   - **Region**: Choose your region
4. Wait for project to be created (5-10 minutes)

## Step 2: Get Your Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon key** → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → For backend (optional)

## Step 3: Setup Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Create Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Copy the entire content of `DATABASE_SCHEMA.sql`
4. Paste into the SQL Editor
5. Click "Run"
6. Wait for all tables to be created

### What tables are created:

| Table | Purpose |
|-------|---------|
| `user_profiles` | Main user table with role info |
| `workers` | Worker-specific information |
| `homeowners` | Homeowner-specific information |
| `admins` | Admin-specific information |
| `bookings` | Booking records between homeowners and workers |
| `payments` | Payment transaction records |
| `services` | Available services (Cooking, Cleaning, etc.) |
| `trainings` | Training programs |
| `worker_trainings` | Many-to-many relationship between workers and trainings |
| `notifications` | User notifications |
| `reports` | User reports/complaints |
| `ratings` | Worker ratings from homeowners |

## Step 5: Configure Email (SendGrid)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API Key
3. Add to `.env`:
   ```env
   SENDGRID_API_KEY=SG.your-api-key-here
   ```

## Step 6: Configure Payments (Flutterwave)

1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Get API keys from Dashboard
3. Add to `.env`:
   ```env
   VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST_your-key
   VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_your-key
   ```

## Step 7: Enable Row Level Security (RLS)

The database schema includes RLS policies. To ensure security:

1. Go to Supabase Dashboard → Authentication
2. Enable "Email Provider" (should be default)
3. Configure email templates if needed

## Step 8: Test the Connection

### Frontend Test:

1. Open `client/lib/supabase.ts` and verify it shows credentials
2. Start the dev server:
   ```bash
   pnpm dev
   ```
3. Try to register a new user at `/worker/register`
4. Check Supabase Dashboard → Authentication → Users to see if user was created

### Backend Test:

1. Test the API:
   ```bash
   curl http://localhost:5173/api/ping
   ```
   Should return: `{"message":"ping"}`

2. Test auth endpoint:
   ```bash
   curl -X POST http://localhost:5173/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"worker"}'
   ```

## Step 9: Seed Demo Data (Optional)

To add demo data for testing, you can create a SQL script in Supabase SQL Editor:

```sql
-- Insert sample services
INSERT INTO services (name, description, icon) VALUES
('Cleaning', 'Home cleaning services', 'Sparkles'),
('Cooking', 'Meal preparation services', 'ChefHat'),
('Laundry', 'Laundry and ironing', 'Shirt'),
('Gardening', 'Garden and lawn care', 'Leaf'),
('Childcare', 'Professional childcare', 'Baby'),
('Elder Care', 'Care for elderly family members', 'Users');

-- Insert sample trainings
INSERT INTO trainings (title, description, category, status) VALUES
('Professional Cleaning', 'Learn professional cleaning techniques', 'Cleaning', 'active'),
('Food Safety', 'Food safety and hygiene certification', 'Cooking', 'active'),
('Customer Service', 'Excellent customer service skills', 'General', 'active');
```

## Troubleshooting

### Connection Errors

**Error**: `Cannot read properties of undefined (reading 'from')`
- **Solution**: Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`

### Authentication Errors

**Error**: `401 Unauthorized`
- **Solution**: Make sure RLS policies are properly set (they should be in the schema SQL)

### Table Not Found

**Error**: `relation "workers" does not exist`
- **Solution**: Run the DATABASE_SCHEMA.sql script again to create all tables

### Password Reset Issues

**Error**: Email not received
- **Solution**: Configure SendGrid API key and email templates in Supabase

## Next Steps

1. ✅ Database setup complete
2. ✅ API routes connected
3. ✅ Frontend forms wired to API
4. Test all registration and login flows
5. Configure email templates for password reset
6. Set up payment webhooks for Flutterwave
7. Deploy to production (Netlify/Vercel)

## API Endpoints

All endpoints require the database to be configured:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Create worker
- `GET /api/homeowners` - Get all homeowners
- `POST /api/homeowners` - Create homeowner
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `POST /api/payments` - Process payment
- And more...

See `client/lib/api-client.ts` for full API documentation.
