# Church Member Management System - Database Schema

This folder contains the SQL scripts to create the complete database schema for the Church Member Management System.

## File Order

Execute the SQL files in the following order to create the database:

1. **01_families.sql** - Creates the families table
2. **02_members.sql** - Creates the members table (references families)
3. **03_education_status.sql** - Creates the education_status table (references members)
4. **04_supporters.sql** - Creates the supporters table with sample data
5. **05_group_pin_codes.sql** - Creates the group_pin_codes table with triggers and sample data
6. **06_foreign_keys.sql** - Adds foreign key constraints between families and supporters
7. **07_storage_bucket.sql** - Creates Supabase storage bucket for file uploads
8. **08_storage_policies.sql** - Sets up storage bucket access policies

## Database Structure

### Tables Overview:

- **families** - Stores family information and registration status
- **members** - Stores individual family member details
- **education_status** - Tracks completion of courses for members
- **supporters** - Stores supporter/user accounts for family management
- **group_pin_codes** - Stores group codes, names, and pin codes for authentication

### Key Features:

- **Authentication System**: Pin code based authentication with personal and group codes
- **Role-based Access**: Different supporter groups (NOR, CAR, ALL) with different permissions
- **File Storage Integration**: Support for profile pictures and family photos via Supabase Storage
- **Audit Trail**: Created/updated timestamps on all tables
- **Data Integrity**: Foreign key constraints and check constraints for data validation

## Usage

To set up a new database:

```bash
# Execute each file in order
psql -U postgres -d your_database < 01_families.sql
psql -U postgres -d your_database < 02_members.sql
psql -U postgres -d your_database < 03_education_status.sql
psql -U postgres -d your_database < 04_supporters.sql
psql -U postgres -d your_database < 05_group_pin_codes.sql
psql -U postgres -d your_database < 06_foreign_keys.sql
psql -U postgres -d your_database < 07_storage_bucket.sql
psql -U postgres -d your_database < 08_storage_policies.sql
```

Or execute all at once:
```bash
cat sql/*.sql | psql -U postgres -d your_database
```