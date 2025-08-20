# Church Member Management App

A React-based application for managing church family members with Korean and English language support.

## Features

- **Family Management**: Organize members by family units with husband, wife, and children
- **Bilingual Support**: Toggle between Korean and English interface
- **Registration Tracking**: Track visitor status and registration completion
- **Photo Upload**: Support for family and individual member photos
- **Education Status**: Track completion of courses (101, 201, 301, 401)
- **Member Groups**: Categorize children into college, youth, kid, kinder groups
- **Sunday-only Registration**: Input dates restricted to Sundays
- **Dashboard**: Weekly registration statistics and recent family overview
- **Search & Filter**: Find families by name, date, or registration status

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Database**: PostgreSQL (with Docker)
- **Environment**: Separate configs for dev, qa, prod

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database

```bash
docker-compose up -d
```

This will start a PostgreSQL database with sample data.

### 3. Environment Configuration

The app uses different environment files:
- `.env` - Local development
- `.env.development` - Development environment
- `.env.qa` - QA environment  
- `.env.production` - Production environment

### 4. Start Backend Server

```bash
cd server
npm install
npm run dev
```

The API server will be available at `http://localhost:3000`

### 5. Start Frontend Development Server

```bash
# In a new terminal, go back to the root directory
cd ..
npm run dev
```

The app will be available at `http://localhost:5173`

## Database Schema

### Tables

- **families**: Store family information and registration status
- **members**: Store individual member details (husband, wife, children)
- **education_status**: Track education course completion

### Sample Data

The database includes sample Korean families with various registration statuses and member configurations.

## Usage

### Navigation

- **Dashboard**: View weekly statistics and recent families
- **Search Member**: Browse and filter all families
- **Add New**: Register new families

### Family Management

- Family names auto-generate from husband/wife Korean names
- Support up to 10 children per family
- Each member can have Korean name, English name, phone, birthdate
- Children can be assigned to groups (college/youth/kid/kinder)

### Language Toggle

Use the language buttons in the top-right corner to switch between Korean (한국어) and English interfaces.

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Language)
├── pages/          # Main page components
├── types/          # TypeScript type definitions
└── App.tsx         # Main app component
```

### Adding New Features

1. Update types in `src/types/index.ts`
2. Add translations in `src/contexts/LanguageContext.tsx`
3. Create new components in appropriate directories
4. Update routing in `App.tsx` if needed

## Deployment

### Development
```bash
npm run dev
```

### QA
```bash
npm run build --mode qa
```

### Production
```bash
npm run build --mode production
```

## Database Management

### Connect to Database
```bash
docker exec -it church-member-db psql -U postgres -d church_members
```

### View Tables
```sql
\dt
```

### Sample Queries
```sql
-- View all families with member count
SELECT f.family_name, f.registration_status, COUNT(m.id) as member_count
FROM families f
LEFT JOIN members m ON f.id = m.family_id
GROUP BY f.id, f.family_name, f.registration_status;

-- View children by group
SELECT m.korean_name, m.english_name, m.member_group, m.grade_level
FROM members m
WHERE m.relationship = 'child'
ORDER BY m.member_group, m.grade_level;
```

## Contributing

1. Create feature branches from main
2. Follow existing code conventions
3. Add TypeScript types for new features
4. Update translations for both languages
5. Test with both Korean and English interfaces
