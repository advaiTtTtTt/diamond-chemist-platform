/**
 * @deprecated Use generate_chemist_db.mjs instead (writes upload_chemist_db.sql for Supabase).
 * This script no longer writes mock frontend product data.
 */
import { execSync } from 'child_process';
execSync('node generate_chemist_db.mjs', { stdio: 'inherit' });
