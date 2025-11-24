# HouseHelp Application Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update the Supabase credentials with your project details
   - Update payment gateway keys (Flutterwave, PayPack)
   - Set admin email and other configuration

3. **Set up database:**
   ```bash
   node setup.js
   ```
   This will test your database connection and show what tables need to be created.

4. **Apply database schema:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/seed.sql`
   - Run the SQL to create the database schema

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Test the setup:**
   - Check server health: http://localhost:5000/api/ping
   - Check database connection: http://localhost:5000/api/health/db

## Configuration

### Environment Variables

Key variables to configure in `.env`:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SENDGRID_API_KEY` - For email notifications (optional)
- `FLUTTERWAVE_SECRET_KEY` - For payment processing (optional)
- `PAYPACK_APPLICATION_ID` and `PAYPACK_APPLICATION_SECRET` - For mobile payments (optional)
- `ADMIN_REPORT_EMAIL` - Admin email for reports

### Port Configuration

The application runs on port 5000 by default (configured in `.env`).

## Database Schema

The application uses the following main tables:

- `user_profiles` - User account information
- `househelp_profiles` - Househelp worker profiles
- `bookings` - Service bookings
- `payments` - Payment records
- `messages` - User messaging
- `notifications` - System notifications
- `reviews` - User reviews and ratings

## Troubleshooting

### Database Connection Issues

If you see "Database connection failed":
1. Verify your Supabase credentials in `.env`
2. Check that your Supabase project is active
3. Ensure network connectivity to Supabase

### Server Issues

If the server doesn't start:
1. Check that port 5000 is available
2. Verify all dependencies are installed
3. Check the console for error messages

## Next Steps

After successful setup:

1. Register as an admin user
2. Configure worker profiles
3. Set up payment gateways
4. Customize the application for your needs

For more information, see the main README.md file.