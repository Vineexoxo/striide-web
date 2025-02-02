"use client";

import { BASE_URL } from "@/lib/constants";  // Added base URL for API endpoint consistency
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

const refreshAccess = async (refreshToken: string) => {
    try {
        const response = await fetch("http://localhost:3001/api/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refresh_token: refreshToken }),  // Pass the refresh token
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (data.status === 200) {
            return data.body.token;  // Return the new access token
        }
        return null;
    } catch {
        return null;
    }
};

// Check if the session is valid on the frontend
const checkSessionFrontend = async () => {
    try {
        const response = await fetch("http://localhost:3001/api/auth/check-session", {
            method: "GET",
        });
        const data = await response.json();
        if (data.status === 200) {
            return data.session;  // Return session data if valid
        }
        return null;  // Return null if session is invalid
    } catch (error) {
        console.error("Failed to check session:", error);
        return null;
    }
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = React.useState<string | null>(null);
    const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
    const [user, setUser] = React.useState<any>(null);  // Store user data
    const router = useRouter();

    useEffect(() => {
        // Called on component mount to check if the session is valid
        const init = async () => {
            const session = await checkSessionFrontend();  // Check session validity
            if (session) {
                setToken(session.access_token);  // Set the access token
                setRefreshToken(session.refresh_token);  // Store refresh token
                setUser(session.user);  // Store user data
            } else {
            }
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
                Authorization: `Bearer ${token ?? ""}`,  // Pass token in headers for authorization
            },
        });

        if (response.status === 401) {  // If the response is unauthorized (token invalid)
            if (refreshToken) {
                const newToken = await refreshAccess(refreshToken);  // Try to refresh the token
                if (newToken) {
                    setToken(newToken);  // Set the new token
                    return await fetch(url, {
                        ...options,
                        headers: {
                            ...options?.headers,
                            Authorization: `Bearer ${newToken}`,  // Retry request with the new token
                        },
                    });
                }
            }
            router.push("/user/login");  // If refreshing the token fails, redirect to login
        }
        return response;  // Return the response if no issues
    };

    return (
        <AuthContext.Provider value={{ request }}>
            {children}  // Wrap the children with the AuthContext provider
        </AuthContext.Provider>
    );
};

export { useAuth };
export default AuthProvider;
