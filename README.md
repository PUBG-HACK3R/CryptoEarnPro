# CryptoEarn Pro - Professional Crypto Investment Platform

A modern, secure cryptocurrency investment platform built with Next.js, Supabase, and TypeScript. Users can invest in pre-defined earning plans using cryptocurrency deposits and track their daily returns through a comprehensive dashboard.

## 🚀 Features

### User Features
- **Secure Authentication** - Email/password signup and login with Supabase Auth
- **Professional Dashboard** - Real-time metrics, earnings tracking, and portfolio overview
- **Investment Plans** - Multiple tiers with different daily return rates and durations
- **Crypto Deposits** - Support for BTC, ETH, and USDT with QR code generation
- **Withdrawal System** - Request withdrawals to external crypto wallets
- **Transaction History** - Complete audit trail of all deposits, withdrawals, and earnings
- **Responsive Design** - Mobile-first approach with dark theme

### Admin Features
- **Plan Management** - Create, update, and manage investment plans
- **Deposit Verification** - Review and approve/reject crypto deposits
- **Withdrawal Processing** - Manage withdrawal requests
- **User Management** - View and manage user accounts and balances
- **Real-time Updates** - Instant notifications for status changes

## 🛠 Tech Stack

- **Frontend/Backend**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom dark theme
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- Git for version control

## 🏗 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd earning-web-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Missing Dependencies
If you encounter import errors, install these additional packages:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
npm install lucide-react recharts class-variance-authority
npm install clsx tailwind-merge
```

### 4. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `database-schema.sql` to create all tables and functions
4. Enable Row Level Security (RLS) policies (included in the script)

### 6. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Database Schema

The application uses the following main tables:
- `profiles` - User profiles with investment totals and balances
- `plans` - Investment plans with rates and durations
- `user_plans` - Active user investments
- `transactions` - All financial transactions
- `withdrawal_requests` - Withdrawal requests for admin approval

## 🔐 Security Features

- Row Level Security (RLS) policies for data protection
- Admin role-based access control
- Secure authentication with Supabase
- Environment variable protection for sensitive data
- Input validation and sanitization

## 🎨 Design System

The application features a professional FinTech design with:
- Dark theme optimized for financial applications
- Consistent color palette (blue/green accents)
- Responsive grid layouts
- Glass morphism effects
- Smooth animations and transitions

## 🚀 Deployment

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
Ensure these are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📱 Usage

### For Users
1. **Register** - Create an account with email/password
2. **Browse Plans** - View available investment plans
3. **Make Deposit** - Send crypto to provided addresses
4. **Track Earnings** - Monitor daily returns in dashboard
5. **Request Withdrawal** - Submit withdrawal requests

### For Admins
1. **Access Admin Panel** - Navigate to `/admin` (admin role required)
2. **Manage Plans** - Create and modify investment plans
3. **Process Deposits** - Verify and approve crypto deposits
4. **Handle Withdrawals** - Review and process withdrawal requests
5. **Monitor Users** - View user accounts and balances

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── lib/                # Utilities and configurations
└── types/              # TypeScript type definitions
```

### Key Components
- `AuthContext` - Authentication state management
- `Navbar` - Main navigation component
- `UI Components` - Reusable button, card, input components
- `Dashboard` - Main user dashboard
- `Admin Panel` - Administrative interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the database schema

## 🔮 Roadmap

- [ ] Complete investment plans system
- [ ] Implement crypto wallet integration
- [ ] Add real-time notifications
- [ ] Build comprehensive admin panel
- [ ] Add earning calculation automation
- [ ] Implement 2FA authentication
- [ ] Add mobile app support
