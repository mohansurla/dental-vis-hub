# OralVis Healthcare - Dental Scan Management System

A professional web application for managing dental scans with role-based access control. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🏥 Project Overview

OralVis Healthcare is a full-stack dental scan management system that allows:
- **Technicians** to upload patient dental scans with detailed information
- **Dentists** to view, manage, and download scan reports as PDFs
- Secure authentication with role-based access control
- Cloud storage for medical images
- Professional healthcare-themed UI

## 🚀 Features

### Authentication & Authorization
- Role-based login system (Technician/Dentist)
- Secure authentication via Supabase Auth
- Protected routes based on user roles

### Technician Features
- Upload patient dental scans (JPG/PNG)
- Record patient information (Name, ID, Scan Type, Region)
- Secure cloud storage integration
- Form validation and error handling

### Dentist Features
- View all uploaded scans in a professional dashboard
- Filter and search scan records
- View full-size images
- Generate and download PDF reports
- Responsive card-based scan display

### Technical Features
- Professional healthcare-themed design system
- Fully responsive mobile-first design
- Real-time data synchronization
- Image optimization and lazy loading
- PDF generation with embedded scan images

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom Design System
- **UI Components**: shadcn/ui, Lucide React Icons
- **Backend**: Supabase (Database, Auth, Storage)
- **PDF Generation**: jsPDF, html2canvas
- **State Management**: React Query (TanStack Query)
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd oralvis-healthcare
npm install
```

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

#### Database Schema
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create user profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('technician', 'dentist')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Create scans table
CREATE TABLE scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  region TEXT NOT NULL,
  image_url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Technicians can insert scans
CREATE POLICY "Technicians can insert scans" ON scans FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'technician'
  )
);

-- Dentists can view all scans
CREATE POLICY "Dentists can view scans" ON scans FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'dentist'
  )
);
```

#### Storage Setup
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `scan-images`
3. Set the bucket to public
4. Configure upload policies:

```sql
-- Allow technicians to upload images
CREATE POLICY "Technicians can upload images" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'scan-images' AND
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'technician'
  )
);

-- Allow public access to read images
CREATE POLICY "Public can view images" ON storage.objects FOR SELECT 
USING (bucket_id = 'scan-images');
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Create Demo Users
In your Supabase Auth dashboard, create test users:

**Technician Account:**
- Email: `technician@oralvis.com`
- Password: `demo123456`

**Dentist Account:**
- Email: `dentist@oralvis.com`
- Password: `demo123456`

The system will automatically assign roles based on email patterns.

### 5. Run the Application
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 🔐 Demo Accounts

Use these credentials to test the application:

| Role | Email | Password |
|------|-------|----------|
| Technician | technician@oralvis.com | demo123456 |
| Dentist | dentist@oralvis.com | demo123456 |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── LoginPage.tsx       # Authentication interface
│   ├── TechnicianDashboard.tsx  # Upload interface
│   └── DentistDashboard.tsx     # Scan viewer interface
├── lib/
│   ├── supabase.ts         # Supabase client configuration
│   └── utils.ts            # Utility functions
├── hooks/                  # Custom React hooks
└── pages/                  # Route components
```

## 🎨 Design System

The application uses a professional healthcare-themed design system with:
- Medical blue color palette (#2196F3)
- Clean, accessible typography
- Consistent spacing and shadows
- Professional card-based layouts
- Responsive grid systems

## 📱 Screenshots

### Login Interface
Professional authentication with role-based access indicators and demo account information.

### Technician Dashboard
Clean upload interface with form validation, file handling, and success notifications.

### Dentist Dashboard
Card-based scan viewer with thumbnail previews, metadata display, and PDF generation.

## 🚀 Deployment

### Netlify/Vercel
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform
4. Configure redirects for SPA routing

### Example `_redirects` file for Netlify:
```
/*    /index.html   200
```

## 🔒 Security Features

- Row Level Security (RLS) policies in Supabase
- Role-based access control
- Secure file upload with type validation
- Protected API routes
- Input sanitization and validation

## 📈 Future Enhancements

- Advanced search and filtering
- Bulk upload functionality
- Detailed analytics dashboard
- Email notifications
- Advanced PDF report templates
- Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For technical support or questions about the OralVis Healthcare system, please contact our development team.

---

Built with ❤️ for healthcare professionals