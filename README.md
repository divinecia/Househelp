# HouseHelp Rwanda - Flutter Mobile App

A comprehensive mobile application connecting households with trusted home service professionals in Rwanda.

## Overview

HouseHelp Rwanda is a Flutter-based mobile application that facilitates connections between households seeking home services and skilled workers providing those services. The app supports three user types: Workers, Households, and Administrators.

## Features

### 🎯 Core Features

- **Multi-user Support**: Workers, Households, and Administrators
- **Supabase Integration**: Real-time database and authentication
- **Multi-language Support**: Kinyarwanda, English, French, and Swahili
- **Real-time Messaging**: In-app communication system
- **Location Services**: GPS integration for worker-household matching
- **Payment Integration**: Mobile money and card payments
- **Rating System**: Review and rating system for quality assurance

### 🔐 Authentication System

- **Email/Phone Registration**: Multiple registration options
- **Social Login**: Google, Facebook, and Apple Sign-In
- **OTP Verification**: Phone number verification
- **Password Recovery**: Secure password reset functionality
- **Biometric Authentication**: Fingerprint and Face ID support

### 👷 Worker Features

- **Profile Management**: Comprehensive worker profiles
- **Service Categories**: Multiple service specializations
- **Job Discovery**: Real-time job matching
- **Schedule Management**: Availability and booking system
- **Earnings Tracking**: Income and payment history
- **Training Programs**: Skill development opportunities
- **Verification System**: Identity and background verification

### 🏠 Household Features

- **Worker Discovery**: Advanced search and filtering
- **Job Posting**: Detailed service requirements
- **Booking System**: Flexible scheduling options
- **Payment Processing**: Secure payment methods
- **Review System**: Rate and review workers
- **Favorite Workers**: Save preferred service providers

### 🛠 Admin Features

- **User Management**: Monitor and manage all users
- **Verification Control**: Approve worker registrations
- **Analytics Dashboard**: Platform performance metrics
- **Content Moderation**: Review and moderate content
- **Payment Management**: Transaction monitoring
- **Support System**: Customer support tools

## Technical Architecture

### 🏗 Project Structure

```
lib/
├── constants/
│   ├── app_constants.dart      # App-wide constants
│   └── app_theme.dart          # Theme configuration
├── models/
│   └── user_model.dart         # Data models
├── providers/
│   └── auth_provider.dart      # State management
├── screens/
│   ├── auth/                   # Authentication screens
│   ├── worker/                 # Worker-specific screens
│   ├── household/              # Household-specific screens
│   ├── admin/                  # Admin-specific screens
│   └── shared/                 # Common screens
├── services/
│   └── supabase_service.dart   # Database services
├── utils/
│   └── app_router.dart         # Navigation configuration
├── widgets/                    # Reusable widgets
└── main.dart                   # App entry point
```

### 📱 Screen Flow

1. **Splash Screen** → App initialization and branding
2. **Welcome Screen** → User type selection
3. **Registration Flow** → Multi-step registration process
4. **Authentication** → Login and verification
5. **Dashboard** → User-specific home screens
6. **Feature Screens** → Specific functionality screens

### 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Adaptable to different screen sizes
- **Smooth Animations**: Enhanced user experience
- **Custom Themes**: Brand-consistent styling
- **Accessibility**: Support for screen readers and accessibility features

## Technical Stack

### 🔧 Dependencies

- **Flutter SDK**: ^3.8.1
- **Supabase Flutter**: ^2.5.0 (Database & Auth)
- **Provider**: ^6.1.2 (State Management)
- **Go Router**: ^14.2.7 (Navigation)
- **Google Fonts**: ^6.2.1 (Typography)
- **Image Picker**: ^1.0.8 (Media handling)
- **Geolocator**: ^12.0.0 (Location services)
- **Lottie**: ^3.1.2 (Animations)
- **Pin Code Fields**: ^8.0.1 (OTP input)
- **Local Auth**: ^2.3.0 (Biometric authentication)

### 🔒 Security Features

- **Data Encryption**: All sensitive data encrypted
- **Secure Authentication**: JWT tokens and session management
- **Input Validation**: Comprehensive form validation
- **File Upload Security**: Secure file handling
- **Privacy Controls**: GDPR compliant data handling

## Installation & Setup

### Prerequisites

- Flutter SDK (>= 3.8.1)
- Dart SDK (>= 2.19.0)
- Android Studio / VS Code
- Supabase account and project

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd househelp
   ```

2. **Install Dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Supabase**
   - Update `lib/constants/app_constants.dart` with your Supabase credentials:
   ```dart
   static const String supabaseUrl = 'YOUR_SUPABASE_URL';
   static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
   ```

4. **Run the App**
   ```bash
   flutter run
   ```

## Database Schema

### Users Table
- User authentication and basic profile information
- Support for multiple user types (worker, household, admin)
- Phone and email verification status

### Worker Profiles
- Comprehensive worker information
- Skills, certifications, and availability
- Location and service preferences
- Rating and review data

### Household Profiles
- Household information and preferences
- Address and family composition
- Service requirements and history

### Jobs/Bookings
- Job postings and booking information
- Status tracking and scheduling
- Payment and completion records

## Features Roadmap

### Phase 1 (Current)
- ✅ Basic app structure
- ✅ Authentication system
- ✅ User type management
- ✅ Navigation system
- ✅ Basic dashboards

### Phase 2 (Next)
- [ ] Complete registration flows
- [ ] Advanced search and matching
- [ ] In-app messaging
- [ ] Payment integration
- [ ] Rating and review system

### Phase 3 (Future)
- [ ] Advanced analytics
- [ ] Push notifications
- [ ] Offline capabilities
- [ ] Multi-currency support
- [ ] Advanced reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support and questions, please contact:
- Email: support@househelp.rw
- Phone: +250 XXX XXX XXX

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**HouseHelp Rwanda** - Connecting you to trusted home services 🏠✨
