# HouseHelp - Professional Household Services Platform

## Overview
HouseHelp is a full-stack web application that connects trusted household workers with families in Rwanda. The platform enables homeowners to find and book qualified workers for various household services, while workers can find employment opportunities and manage their bookings.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Build Tool**: Vite 7
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript
- **API Architecture**: RESTful API with JSON responses
- **Authentication**: JWT tokens with refresh token mechanism
- **Database**: Supabase (PostgreSQL)
- **Email Service**: SendGrid (optional)
- **Payment Gateways**: Flutterwave and PayPack (optional)

### Development Environment
- **Package Manager**: npm
- **Dev Server Port**: 5000 (both dev and production)
- **Host**: 0.0.0.0 (for Replit proxy compatibility)

## Project Structure

```
.
├── client/              # Frontend React application
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin dashboard pages
│   │   ├── homeowner/  # Homeowner portal pages
│   │   └── worker/     # Worker portal pages
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── global.css      # Global styles
│
├── server/             # Backend Express application
│   ├── lib/           # Server utilities
│   ├── middleware/    # Express middleware
│   ├── migrations/    # Database migration scripts
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic services
│   ├── index.ts       # Express server setup
│   └── node-build.ts  # Production server entry
│
├── shared/            # Shared code between client/server
│   └── api.ts         # Shared API types
│
├── public/            # Static assets
│   ├── manifest.json  # PWA manifest
│   └── service-worker.js
│
└── dist/              # Build output (generated)
    ├── spa/           # Built frontend
    └── server/        # Built backend
```

## User Roles

### 1. Admin
- Manage platform settings
- View and manage all users
- Access reports and analytics
- Configure services and trainings

### 2. Worker
- Create and manage profile
- Browse available job opportunities
- Apply for positions
- Track bookings and payments
- Access training materials

### 3. Homeowner
- Search and filter workers
- Book household services
- Manage bookings
- Process payments
- Rate and review workers

## Available Services

1. House Cleaning
2. Cooking
3. Laundry
4. Childcare
5. Elderly Care
6. Garden Maintenance
7. Pet Care
8. General Household Help

## Key Features

### Authentication & Authorization
- Role-based access control (RBAC)
- JWT-based authentication with refresh tokens
- Password reset via email
- Secure route protection

### Worker Management
- Comprehensive worker profiles
- Skills and experience tracking
- National ID verification
- Insurance information
- Language proficiency
- Work history

### Homeowner Management
- Detailed homeowner profiles
- Home composition tracking
- Worker preferences
- Booking history

### Booking System
- Service booking creation
- Status tracking (pending, confirmed, completed, cancelled)
- Payment integration
- Calendar management

### Payment Integration
- Flutterwave (bank transfers)
- PayPack (mobile money)
- Payment verification
- Transaction history

## Environment Variables

### Required
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_SUPABASE_URL`: Supabase URL for frontend
- `VITE_SUPABASE_ANON_KEY`: Supabase key for frontend

### Optional
- `SENDGRID_API_KEY`: For email notifications
- `FLUTTERWAVE_SECRET_KEY`: For payment verification
- `VITE_FLUTTERWAVE_PUBLIC_KEY`: For payment initialization
- `PAYPACK_APPLICATION_ID`: PayPack app ID
- `PAYPACK_APPLICATION_SECRET`: PayPack secret
- `ADMIN_REPORT_EMAIL`: Admin contact email

### Development
- `PORT`: Server port (default: 5000)
- `PING_MESSAGE`: Custom health check message
- `VITE_API_URL`: API base URL (defaults to /api)

## Database Schema

The application uses Supabase with the following main tables:
- `user_profiles`: Core user information with role
- `admins`: Admin-specific data
- `workers`: Worker profiles and details
- `homeowners`: Homeowner profiles and preferences
- `bookings`: Service booking records
- `payments`: Payment transactions
- `services`: Available service types
- `trainings`: Training programs
- `reports`: Issue reports

See `server/migrations/` for full schema details.

## Development Workflow

### Starting the Development Server
```bash
npm install
npm run dev
```
The server runs on http://localhost:5000

### Building for Production
```bash
npm run build
```
This builds both client and server into the `dist/` directory.

### Running Production Build
```bash
npm start
```

### Testing
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Workers
- `GET /api/workers` - List workers
- `GET /api/workers/:id` - Get worker details
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker
- `GET /api/workers/search/advanced` - Advanced search

### Homeowners
- `GET /api/homeowners` - List homeowners
- `GET /api/homeowners/:id` - Get homeowner details
- `POST /api/homeowners` - Create homeowner
- `PUT /api/homeowners/:id` - Update homeowner
- `DELETE /api/homeowners/:id` - Delete homeowner

### Bookings
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/paypack/initialize` - Initialize PayPack payment
- `POST /api/payments/paypack/verify` - Verify PayPack payment

### Services & Trainings
- `GET /api/services` - List services
- `GET /api/trainings` - List trainings
- `GET /api/reports` - List reports

### Options/Dropdowns
- `GET /api/options/genders` - Gender options
- `GET /api/options/marital-statuses` - Marital status options
- `GET /api/options/service-types` - Service type options
- And many more...

## Recent Changes (Replit Setup)

### 2024-11-16: Replit Environment Configuration
1. **Vite Configuration**:
   - Configured server to bind to `0.0.0.0:5000`
   - Added HMR WebSocket configuration for Replit proxy
   - Updated file system allow list to include root directory
   
2. **Production Server**:
   - Updated port to 5000 (from 3000)
   - Changed host to 0.0.0.0 for external accessibility
   
3. **Deployment**:
   - Configured autoscale deployment
   - Build command: `npm run build`
   - Run command: `npm start`

4. **Dependencies**:
   - Installed all npm packages (515 packages)
   - All required dependencies are present

## Getting Started

### For Testing (See QUICK_START.md for detailed testing guide)

1. **Test Admin Registration**:
   - Visit `/admin/register`
   - Fill in required fields
   - Login at `/admin/login`

2. **Test Worker Registration**:
   - Visit `/worker/register`
   - Complete profile with National ID
   - Login at `/worker/login`

3. **Test Homeowner Registration**:
   - Visit `/homeowner/register`
   - Provide home details
   - Login at `/homeowner/login`

## Known Issues

1. **HMR WebSocket Warning**: There's a minor WebSocket connection warning in the browser console for hot module reload. This doesn't affect functionality but may require manual page refresh during development.

2. **Email Services**: Email features require Supabase email configuration or SendGrid API key.

3. **Payment Integration**: Payment features require API keys from Flutterwave and/or PayPack.

## Deployment Notes

### Replit Deployment
The application is configured for Replit's autoscale deployment:
- Builds both frontend and backend
- Serves static frontend files from Express
- All routes handled by single server on port 5000
- Environment variables managed through Replit Secrets

### Production Considerations
- Set `NODE_ENV=production`
- Configure CORS origins properly
- Set up Supabase Row Level Security (RLS) policies
- Configure email service (SendGrid or Supabase)
- Add payment gateway credentials
- Set up SSL/HTTPS

## Support & Documentation

- Quick Start Guide: See `QUICK_START.md`
- Database Setup: See `SCHEMA_MIGRATION_INSTRUCTIONS.md`
- API Issues: See `API_ERROR_FIXES.md`
- Auth & CRUD: See `DEEP_SCAN_AUTH_CRUD.md`

## License
Private project for HouseHelp Rwanda
