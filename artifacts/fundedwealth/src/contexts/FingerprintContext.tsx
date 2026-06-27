/**
 * FingerprintJS Open Source React Context
 *
 * Provides device fingerprint (visitorId) to the entire app.
 * No paid API key needed. Runs entirely client-side.
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { getFingerprint, getVisitorId, reportFingerprint, type FingerprintData } from "@/lib/fingerprint";
import { installFetchInterceptor } from "@/lib/fetch-interceptor";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface FingerprintContextValue {
    fingerprint: FingerprintData | null;
    visitorId: string;
    isLoaded: boolean;
    error: string | null;
    reidentify: () => Promise<void>;
}

const FingerprintContext = createContext<FingerprintContextValue>({
    fingerprint: null,
    visitorId: "",
    isLoaded: false,
    error: null,
    reidentify: async () => { },
});

export function FingerprintProvider({ children }: { children: ReactNode }) {
    const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
    const [visitorId, setVisitorId] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { session, isSignedIn } = useAuth();

    const identify = useCallback(async () => {
        try {
            const fp = await getFingerprint();
            setFingerprint(fp);
            setVisitorId(fp.visitorId);
            setIsLoaded(true);
            setError(null);
        } catch (err: any) {
            const fallbackId = await getVisitorId();
            setVisitorId(fallbackId);
            setIsLoaded(true);
            setError(err.message || "Fingerprint failed");
        }
    }, []);

    useEffect(() => {
        identify();
    }, [identify]);

    // Install global fetch interceptor as soon as visitorId is available
    useEffect(() => {
        if (visitorId) {
            installFetchInterceptor(visitorId);
        }
    }, [visitorId]);

    // Report to backend when authenticated
    useEffect(() => {
        if (isSignedIn && visitorId && session?.access_token) {
            const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
            reportFingerprint(apiUrl, session.access_token).catch(() => { });
        }
    }, [isSignedIn, visitorId, session?.access_token]);

    const reidentify = useCallback(async () => {
        setIsLoaded(false);
        await identify();
    }, [identify]);

    return (
        <FingerprintContext.Provider value={{ fingerprint, visitorId, isLoaded, error, reidentify }}>
            {children}
        </FingerprintContext.Provider>
    );
}

export function useFingerprint() {
    return useContext(FingerprintContext);
}

export default FingerprintContext;
