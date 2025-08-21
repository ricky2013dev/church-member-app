# Church Member Management App

A React-based application for managing church family members with supporter authentication and role-based access control.

## Features

- **Family Management**: Organize members by family units with husband, wife, and children
- **Supporter Authentication**: Pin code-based login system with personal and group codes
- **Role-based Access**: Different supporter groups (NOR, CAR, ALL) with varying permissions
- **Photo Upload**: Support for family and individual photos via Supabase Storage
- **Education Status**: Track completion of courses (101, 201, 301, 401)
- **Member Groups**: Categorize children into college, youth, kid, kinder groups
- **Display Sorting**: Custom sort order for supporters
- **Dashboard**: Weekly registration statistics and recent family overview
- **Search & Filter**: Find families by name, date, or registration status

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage for file uploads
- **Authentication**: Custom pin code system

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Database Setup

This project uses Supabase for the database. Follow these steps:

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your database credentials from project settings
3. Execute the SQL scripts in order from the `sql/` folder:

```bash
# Connect to your Supabase database and run:
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Execute each SQL file in order:
\i sql/01_families.sql
\i sql/02_members.sql
\i sql/03_education_status.sql
\i sql/04_supporters.sql
\i sql/05_group_pin_codes.sql
\i sql/06_foreign_keys.sql
\i sql/07_storage_bucket.sql
\i sql/08_storage_policies.sql
```

### 3. Environment Configuration

**Backend (.env):**
Create `server/.env` with your Supabase credentials:
```env
PORT=3000
DB_HOST=db.[YOUR-PROJECT-REF].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Frontend (.env):**
Create `.env` with:
```env
VITE_APP_TITLE=Church Member Management
VITE_API_URL=http://localhost:3000/api
```

### 4. Start the Application

**Backend Server:**
```bash
cd server
npm start
```

**Frontend Development Server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5177` (Vite auto-selects available port)
The API server runs at `http://localhost:3000`

## Database Schema

### Tables Overview

- **families** - Family information and registration status
- **members** - Individual family member details
- **education_status** - Course completion tracking
- **supporters** - User accounts for family management
- **group_pin_codes** - Group authentication codes

### Authentication System

The app uses a dual pin code authentication system:
- **Personal Pin Code**: 4-digit code unique to each supporter
- **Group Pin Code**: 4-digit code shared by supporter group (NOR, CAR, ALL)

### File Storage

Profile pictures and family photos are stored in Supabase Storage with proper access policies.

## Usage

### Login
1. Select your supporter account from the dropdown
2. Enter your personal 4-digit pin code
3. Enter your group's 4-digit pin code

### Supporter Management
- View and manage supporter accounts (if authorized)
- Edit supporter information and display sort order
- Manage group pin codes (ALL group only)

### Family Management
- Register new families with member details
- Upload photos for families and individual members
- Track education course completion
- Assign supporters to families

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Language)
├── pages/          # Main page components
├── services/       # API service layer
├── types/          # TypeScript type definitions
└── App.tsx         # Main app component

server/
├── server.js       # Express API server
├── package.json    # Server dependencies
└── .env           # Server configuration

sql/
├── 01_families.sql          # Families table
├── 02_members.sql           # Members table
├── 03_education_status.sql  # Education tracking
├── 04_supporters.sql        # Supporter accounts
├── 05_group_pin_codes.sql   # Group authentication
├── 06_foreign_keys.sql      # Table relationships
├── 07_storage_bucket.sql    # File storage setup
└── 08_storage_policies.sql  # Storage permissions
```

## Role-based Access Control

### Supporter Groups:
- **NOR (Normal)**: Can view/edit their assigned families and their own account
- **CAR (Care)**: Similar to NOR with additional care-related permissions
- **ALL**: Full access to all features including supporter management

### Permissions:
- NOR supporters cannot view ALL group supporters
- Only ALL group can manage other supporters and group pin codes
- Edit restrictions based on supporter ownership

## Development

### Adding New Features
1. Update TypeScript types in `src/types/index.ts`
2. Add API endpoints in `server/server.js`
3. Update frontend services in `src/services/api.ts`
4. Create/update UI components

### Database Changes
1. Create new SQL migration files in `sql/` folder
2. Follow the numbering convention (09_, 10_, etc.)
3. Update the README.md with new schema information

## Deployment

The application is designed to work with Supabase in production. Update the environment variables with your production Supabase credentials.

```bash
# Build for production
npm run build
```

## Security Notes

- Pin codes are stored in the database (consider hashing in production)
- Environment files contain sensitive credentials - never commit real .env files
- Supabase RLS policies control database access
- File uploads are restricted to images with size limits

## Contributing

1. Create feature branches from main
2. Follow existing code conventions
3. Add TypeScript types for new features
4. Test with different supporter roles
5. Update documentation as needed