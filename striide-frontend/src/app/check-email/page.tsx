"use client";

import { checkAuthCookie } from "@/lib/check-auth";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckEmailPage = () => {
    const router = useRouter();

    useEffect(() => {
        const checkUserAuthentication = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3001/api/get-user",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    },
                );
                const data = await response.json();
                if (!data.user || data.user.role !== "authenticated") {
                    router.push("/user/login");
                }
            } catch (error) {
                console.error("Error checking user authentication:", error);
            }
        };

        checkUserAuthentication();
    }, [router]);
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="rounded bg-white p-8 text-center shadow-md">
                <h1 className="mb-4 text-2xl font-bold">
                    Please Verify Your Email
                </h1>
                <p className="mb-6 text-gray-700">
                    We've sent a verification link to your email. Please check
                    your inbox and click the link to verify your email address,
                    and then login in our website.
                </p>
            </div>
        </div>
    );
};

export default CheckEmailPage;
