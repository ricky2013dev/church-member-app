# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React/Vite)
```bash
# Development server (auto-selects port, usually 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Code formatting
npm run format
npm run format:check  # Check only
npm run format:fix    # Format + lint fix

# Testing
npm test              # Watch mode
npm run test:run      # Single run
npm run test:ui       # UI mode
```

### Backend (Node.js/Express)
```bash
cd server

# Production server
npm start

# Development with auto-reload
npm run dev

# Test database connection
npm run test-db
```

### Database Operations
```bash
# Add new database column (example)
node server/add-life-group-column.js

# Test specific functionality (example)
node server/test-life-group.js
```

## Architecture Overview

### Full-Stack Structure
- **Frontend**: React 19 + TypeScript + Vite development server
- **Backend**: Express.js API server with PostgreSQL integration
- **Database**: Supabase PostgreSQL with custom authentication system
- **Storage**: Supabase Storage for photo uploads
- **Authentication**: Dual pin code system (personal + group codes)

### Core Data Model
The application manages church families with a hierarchical structure:
- **Families** contain multiple **Members** (husband, wife, children)
- **Supporters** are staff who manage families (NOR/CAR/ALL groups)
- **Education Status** tracks course completion (101/201/301/401)
- **Group Pin Codes** control access levels by supporter group

### Authentication Flow
1. User selects supporter account from dropdown
2. Enters personal 4-digit pin code
3. Enters group 4-digit pin code
4. System validates both codes against database
5. Sets authenticated user context with role-based permissions

### Permission System
- **NOR Group**: Manage assigned families only
- **CAR Group**: Similar to NOR with care-specific features
- **ALL Group**: Full system access including supporter management

### Key Directories
```
src/
├── contexts/       # React contexts (AuthContext, LanguageContext)
├── pages/          # Main route components (Dashboard, AddEditMember, SearchMember, etc.)
├── services/       # API client (api.ts with full CRUD operations)
├── types/          # TypeScript interfaces (Family, Member, Supporter, etc.)
└── components/     # Reusable UI components

server/
├── server.js       # Express API with all endpoints
├── *.js           # Utility scripts (migrations, tests)
└── uploads/       # Local file storage (fallback)

sql/
├── 01_families.sql          # Core family data table
├── 02_members.sql           # Individual member details
├── 03_education_status.sql  # Course completion tracking
├── 04_supporters.sql        # Staff/user accounts
├── 05_group_pin_codes.sql   # Authentication groups
├── 06_foreign_keys.sql      # Table relationships
├── 07_storage_bucket.sql    # Supabase storage setup
└── 08_storage_policies.sql  # File access permissions
```

## Development Patterns

### API Integration
- All API calls go through `src/services/api.ts` using the ApiService class
- Frontend uses React contexts for state management (auth, language)
- Backend follows RESTful conventions with comprehensive error handling
- Database operations use parameterized queries to prevent SQL injection

### Form Handling
- Family forms auto-generate family names from husband/wife names
- Member relationship enforcement (husband, wife, children)
- File uploads integrate with Supabase Storage with fallback to local storage
- Date inputs restricted to Sundays only for registration dates

### Mobile-First Design
- CSS uses mobile-first responsive breakpoints
- Forms stack vertically on mobile, grid layout on desktop
- Touch-friendly button sizes (minimum 44px height)
- Optimized navigation for mobile screens

### Testing Strategy
- Unit tests for business logic using Vitest
- Component tests avoided due to React 19 compatibility issues
- API integration tests for critical data flows
- Database migration scripts with rollback capabilities

## Environment Configuration

### Required Environment Variables

**Frontend (.env):**
```env
VITE_APP_TITLE=Church Member Management
VITE_API_URL=http://localhost:3000/api
```

**Backend (server/.env):**
```env
PORT=3000
DB_HOST=db.[PROJECT-REF].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema Notes

### Family Data Structure
- Families have `life_group` field for small group assignments
- `registration_status` tracks visitor vs. complete registration
- `input_date` must be a Sunday (business rule)
- Optional main/sub supporter assignments

### Member Relationships
- Fixed relationships: 'husband' | 'wife' | 'child'
- Children can have member_group: 'college' | 'youth' | 'kid' | 'kinder'
- Education status tracks course completion with dates
- Phone numbers and birthdates are optional

### File Storage
- Family and member photos stored in Supabase 'church-pictures' bucket
- Fallback to local uploads/ directory if Supabase unavailable
- Image uploads restricted by type and size (5MB limit)

## Common Development Tasks

### Adding New Database Fields
1. Create migration script in server/ directory (see add-life-group-column.js example)
2. Update TypeScript interfaces in src/types/index.ts
3. Modify API endpoints in server/server.js (both create and update operations)
4. Update frontend forms and API service calls
5. Add validation and error handling

### Testing API Changes
- Use server/test-*.js scripts for integration testing
- Test both create and update operations
- Verify data persistence with separate read operations
- Check error handling for invalid inputs

### Mobile Responsive Updates
- Always test forms on mobile devices
- Use CSS mobile-first approach with @media breakpoints
- Ensure touch targets meet 44px minimum size
- Test navigation and form submission on small screens
- when save the file, make code prettier by improving formatting, organization, and readability
- Try to create reusable component if there is duplication in the code 


### CSS
- Better Maintainability: Styles are centralized and organized
- Consistent Design: Common patterns reused across components
- Mobile Optimization: All touch targets meet 44px minimum
- Performance: No inline style recalculation on re-renders
- Modularity: Component-specific styles are scoped
- Theme Support: Easy to modify colors and spacing globally