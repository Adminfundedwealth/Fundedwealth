/**
 * DEPRECATED: Clerk auth has been replaced with Supabase Auth.
 * This file re-exports the Supabase equivalents for backward compatibility
 * so that route files using `import { clerkAuth } from "./middlewares/clerkAuth"`
 * continue to work without modification.
 */
import { requireAuth, requireAdminAuth, getAuth } from "./supabaseAuth";

export const clerkAuth = requireAuth;
export const clerkAdminAuth = requireAdminAuth;
export { getAuth };
export default requireAuth;
