export interface TerminalLaunchUserLookupContext {
  authUserId: string;
  authEmail?: string;
  lookupByClerkId: (clerkId: string) => Promise<any | null>;
  lookupByEmail: (email: string) => Promise<any | null>;
  linkUserToAuth: (user: any) => Promise<void>;
}

export async function resolveTerminalLaunchUser(context: TerminalLaunchUserLookupContext): Promise<any | null>;
