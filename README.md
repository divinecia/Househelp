# HouseHelp Rwanda - Complete Authentication System

A comprehensive mobile application for connecting households with trusted home service providers in Rwanda.

## 🚀 Features

### ✅ Complete Authentication System
- **Multi-user Registration**: Worker, Household, and Admin portals
- **Social Authentication**: Google, Facebook, and Apple Sign-In
- **OTP Verification**: Phone and email verification
- **Password Management**: Reset and update functionality
- **Biometric Authentication**: Fingerprint and Face ID support
- **Multi-language Support**: Kinyarwanda, English, French, and Swahili

### ✅ Professional UI/UX
- **Material Design 3**: Modern, accessible design system
- **Smooth Animations**: Professional transitions and micro-interactions
- **Responsive Design**: Works on all screen sizes
- **Dark Mode Ready**: Theme system prepared for dark mode

### ✅ Production-Ready Backend
- **Supabase Integration**: Real-time database with authentication
- **Row Level Security**: Proper data access controls
- **File Storage**: Image and document upload system
- **Location Services**: GPS and geolocation features

## 📱 Screen Flow

1. **Splash Screen** (3-second animation with logo and version)
2. **Welcome Screen** (User type selection with language picker)
3. **Registration Flows** (Multi-step forms for each user type)
4. **Login System** (Email/phone + password with social auth)
5. **OTP Verification** (Phone/email verification with timer)
6. **Password Reset** (3-step password recovery flow)
7. **Success Screens** (Registration completion with next steps)

## 🛠 Technology Stack

- **Frontend**: Flutter (Cross-platform mobile)
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **State Management**: Provider pattern
- **Navigation**: Go Router
- **UI Design**: Material Design 3
- **Authentication**: Supabase Auth + Social providers
- **Storage**: Supabase Storage + Local secure storage

## 🗄️ Database Schema

The complete database schema includes:
- **Users Table**: Base user information
- **Workers Table**: Professional worker profiles
- **Households Table**: Family and property information
- **Admins Table**: Administrative access control
- **Service Requests**: Job posting system
- **Bookings**: Service booking management
- **Reviews**: Rating and feedback system
- **Payments**: Transaction management
- **Notifications**: Push notification system

## 📦 Installation

### Prerequisites
- Flutter SDK (3.8.1+)
- Dart SDK
- Android Studio / VS Code
- Supabase account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd househelp
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Set up Supabase Database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Configure authentication providers (Google, Facebook, Apple)

4. **Configure Environment**
   - Supabase URL and keys are already configured in `lib/constants/app_constants.dart`
   - Update social auth credentials in respective platform configurations

5. **Run the application**
   ```bash
   flutter run
   ```

## 📊 Database Setup

Execute the following SQL script in your Supabase SQL editor:

```sql
-- The complete schema is in database/schema.sql
-- It includes all tables, indexes, triggers, and security policies
```

## 🔐 Authentication Flow

### Registration Process
1. User selects account type (Worker/Household/Admin)
2. Multi-step form with validation
3. Document upload and verification
4. OTP verification for phone/email
5. Application review and approval
6. Account activation

### Login Options
- Email/Phone + Password
- Google Sign-In
- Facebook Login
- Apple Sign-In (iOS only)
- Biometric Authentication (if enabled)

## 🌍 Multi-language Support

The app supports 4 languages:
- **Kinyarwanda** (Default)
- **English**
- **French**
- **Swahili**

Language selection is available in the top-right corner of the welcome screen.

## 📱 User Types

### 👷 Workers
- Professional service providers
- Skills and certification management
- Availability and rate setting
- Document verification required
- Background check process

### 🏠 Households
- Service seekers
- Family and property information
- Service request posting
- Payment management
- Review and rating system

### 👨‍💼 Admins
- Platform administrators
- User management
- Content moderation
- System monitoring
- IT support access

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Encrypted Storage**: Sensitive data protection
- **Biometric Authentication**: Device-level security
- **OTP Verification**: Multi-factor authentication
- **Session Management**: Secure session handling
- **Input Validation**: Comprehensive form validation

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2196F3 (Workers)
- **Secondary Green**: #4CAF50 (Households)
- **Accent Gray**: #9E9E9E (Admins)
- **Success**: #38A169
- **Error**: #E53E3E
- **Warning**: #D69E2E

### Typography
- **Font Family**: Roboto
- **Heading Large**: 32px, Bold
- **Heading Medium**: 24px, Bold
- **Body Large**: 16px, Regular
- **Body Medium**: 14px, Regular

## 📂 Project Structure

```
lib/
├── constants/          # App constants and theme
├── core/              # Core functionality and routing
├── models/            # Data models
├── providers/         # State management
├── screens/           # UI screens
├── services/          # Backend services
├── utils/             # Utility functions
└── widgets/           # Reusable widgets

database/
└── schema.sql         # Complete database schema
```

## 🧪 Testing

Run tests with:
```bash
flutter test
```

## 🚀 Deployment

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## 📈 Future Enhancements

- [ ] Push notifications
- [ ] Real-time chat system
- [ ] Payment integration (MTN Mobile Money, Airtel Money)
- [ ] Advanced search and filtering
- [ ] Service tracking and GPS
- [ ] Calendar integration
- [ ] Multi-currency support

## 📞 Support

For technical support or questions:
- **Email**: support@househelp.rw
- **Phone**: +250 788 000 000
- **IT Support**: it@househelp.rw

## 📄 License

This project is proprietary software for HouseHelp Rwanda.

## 🤝 Contributing

This is a private project for HouseHelp Rwanda. Contact the development team for contribution guidelines.

---

**Built with ❤️ for Rwanda's home service community**
