# ISCHOOLGO - Educational Management System

A comprehensive educational management system built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🎯 Multi-Role System
- **Admin**: Full system access and user management
- **Director**: Strategic oversight and reporting
- **Head Trainer**: Academic supervision and training coordination
- **Teacher**: Class management and student tracking
- **Agent**: Student enrollment and payment processing
- **Marketer**: Campaign management and lead generation

### 📊 Core Modules
- **Dashboard**: Real-time analytics and insights
- **Students**: Complete student lifecycle management
- **Groups**: Class and study group organization
- **Attendance**: Digital attendance tracking
- **Payments**: Financial transaction management
- **Marketing**: AI-powered campaign generation
- **Analytics**: Advanced reporting and predictions

### 🤖 AI Integration
- **Smart Analytics**: AI-powered student performance analysis
- **Risk Prediction**: Identify students at risk of dropping out
- **Marketing Content**: Auto-generate compelling marketing materials
- **Smart Assistant**: AI chatbot for administrative support

### 🔐 Security Features
- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Granular access management
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Data Encryption**: Secure handling of sensitive information

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Edge Functions** for serverless AI processing
- **Google Gemini AI** for intelligent features

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Google Gemini API key

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Click "Connect to Supabase" in the top right of this interface
   - The database schema will be automatically created

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Demo Credentials

The system comes with pre-configured demo accounts:

- **Admin**: admin@ischoolgo.com / admin123
- **Teacher**: teacher@ischoolgo.com / teacher123
- **Marketer**: marketer@ischoolgo.com / marketer123

## Database Schema

### Core Tables
- `users` - System users with role-based access
- `students` - Student information and enrollment
- `groups` - Classes and study groups
- `attendance` - Digital attendance tracking
- `payments` - Financial transactions
- `visitors` - Lead management
- `marketing_campaigns` - Campaign tracking
- `expenses` - Business expense management
- `inventory` - Resource and equipment tracking
- `notifications` - System notifications
- `ai_interactions` - AI usage analytics

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure authentication with Supabase Auth
- Data validation and sanitization

## AI Features

### Student Analytics
- Performance trend analysis
- Attendance pattern recognition
- Risk assessment for dropouts
- Personalized recommendations

### Marketing Intelligence
- Target audience analysis
- Campaign content generation
- Conversion optimization
- Lead scoring and prioritization

### Smart Assistant
- Natural language queries
- Administrative task automation
- Report generation
- Data insights and recommendations

## API Documentation

### Authentication
All API calls require authentication via Supabase Auth. The system automatically handles token management and renewal.

### Error Handling
Comprehensive error handling with user-friendly messages and proper HTTP status codes.

### Rate Limiting
Built-in rate limiting to prevent abuse and ensure system stability.

## Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
Ensure all environment variables are properly configured for production:
- Supabase production URLs
- Secure API keys
- CORS settings
- SSL certificates

### Monitoring
- Real-time error tracking
- Performance monitoring
- User activity analytics
- System health checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@ischoolgo.com
- Documentation: [docs.ischoolgo.com](https://docs.ischoolgo.com)
- Issues: GitHub Issues

---

Built with ❤️ for educational excellence