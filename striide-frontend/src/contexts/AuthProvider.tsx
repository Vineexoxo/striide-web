"use client";

import { BASE_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface ACProps {
    request: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = React.createContext<ACProps>({} as ACProps);

const useAuth = () => {
    const authContext = React.useContext(AuthContext);
    if (authContext === undefined) {
        throw new Error("useAuth must be inside an AuthProvider");
    }
    return authContext;
};

interface AuthProviderProps {
    children?: React.ReactNode;
}

const refreshAccess = async () => {
    try {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
        });
        const data = await response.json();
        if (data.status === 200) {
            return data.body.token;
        }
        return null;
    } catch {
        return null;
    }
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = React.useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const token = await refreshAccess();
            setToken(token);
        };
        init();
    }, []);

    /**
     * Fetch request wrapper with session validation
     * @param url API endpoint
     * @param options fetch options
     * @returns fetch response
     */
    const request = async (url: string, options?: RequestInit) => {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options?.headers,
                Authorization: `Bearer ${token ?? ""}`,
            },
        });
        if (response.status === 401) {
            const newToken = await refreshAccess();
            if (newToken) {
                setToken(newToken);
                return await fetch(url, {
                    ...options,
                    headers: {
                        ...options?.headers,
                        Authorization: `Bearer ${newToken}`,
                    },
                });
            }
            router.push("/user/login");
        }
        return response;
    };

    return (
        <AuthContext.Provider value={{ request }}>
            {children}
        </AuthContext.Provider>
    );
};

export { useAuth };
export default AuthProvider;
