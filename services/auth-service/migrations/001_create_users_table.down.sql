-- Drop indexes
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;

-- Drop users table
DROP TABLE IF EXISTS users;
