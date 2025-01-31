"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../Button";
import { Input } from "../Input";
import Link from "next/link";
import Radio from "../Radio";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../../lib/constants";
import log from 'loglevel'; 

interface UserFormProps {
    title: string;
    children?: React.ReactNode;
}

const Glass = ({ title, children }: UserFormProps) => {
    return (
        <div className="flex h-[420px] w-[361px] items-center justify-center rounded-[20px] bg-white bg-opacity-[0.17]">
            <div className="flex h-[85%] w-[90%] flex-col items-center justify-between">
                <h2 className="font-nunito w-full text-center text-[24px] font-bold">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
};

const SignUpForm = () => {
    const router = useRouter();
    const [username, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getIpAddress = async (): Promise<string | null> => {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const data = await response.json();
          // log.debug("Fetched IP address:", data.ip);
            return data.ip;
        } catch (error) {
          // log.error("Failed to fetch IP address:", error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      // log.info("Form submission started.");
        setIsLoading(true);
        setErrorMessage("");

        // Input validation
        if (!username || !email || !password) {
            // log.error("Form submission failed: Could not fetch IP address.");
          // log.warn("Form submission failed: Missing required fields.");
            setErrorMessage("Please fill out all fields.");
            setIsLoading(false);
            return;
        }
      
        try {
            const ipAddress = await getIpAddress();
            if (!ipAddress) {
                setErrorMessage("Failed to fetch IP address.");
              // log.error("Failed to fetch IP address.");
                setIsLoading(false);
                return;
            }

            const payload = {
                username,
                email,
                password,
                ip: ipAddress,
            };
            // Send the payload to the `/api/auth/register` route
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            router.push("/check-email");

            const result = await response.json();

          // log.info(`Form payload: ${JSON.stringify(payload, null, 2)}`)
            // log.info('Sign Up button clicked on the Welcome page');
            console.log("Payload:", JSON.stringify(payload, null, 2));  // For client-side debugging

            
    
            if (!result.ok) {
                if (result.status === 409) {
                    // Handle the case where the email already exists
                    setErrorMessage("Email already exists. Please log in.");
                }
                // If response status is not OK (i.e., error code is not 2xx)
                // Use the error message from the response body
      
            } else {
                // Redirect to onboarding page on successful signup
                
            }
        } catch (error) {
          // log.error("An unexpected error occurred during form submission:", error);

            setErrorMessage("An unexpected error occurred.");
            console.error(error);
        } finally {
          // log.info("Form submission process ended.");
            setIsLoading(false);
    
        }
    };

    return (
        <Glass title="Create an Account">
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-[49px]"
            >
                <div className="flex w-full flex-col gap-[20px]">
                    <Input
                        type="text"
                        value={username}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        variant={"default"}
                        size={"full"}
                    />
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        variant={"default"}
                        size={"full"}
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        variant={"default"}
                        size={"full"}
                    />
                </div>
                <Button
                    type="submit"
                    size={"full"}
                    className="font-semibold"
                    isLoading={isLoading}
                >
                    Sign up
                </Button>
            </form>
            {/* Display error message */}
            {errorMessage && (
                <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}
            <div className="font-inter flex justify-center gap-[5px] text-[16px] leading-[20px]">
                <h3 className="font-light">Already have an account?</h3>
                <Link
                    href="../user/login"
                    className="text-primary-orange font-bold"
                >
                    Log in
                </Link>
            </div>
        </Glass>
    );
};


const LogInForm = () => {
    const router = useRouter();
    const [remember, setRemember] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getIpAddress = async (): Promise<string | null> => {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const data = await response.json();
          // log.debug("Fetched IP address:", data.ip);
            return data.ip;
        } catch (error) {
          // log.error("Failed to fetch IP address:", error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // Prevent the default form submission behavior

      // log.debug("Attempting to log in with email:", email);
    // Simple form validation
    if (!email || !password) {
      // log.warn("Email and password are required");
        setErrorMessage("Email and password are required.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setErrorMessage("");  // Clear any previous errors
    try {
        
        const ipAddress = await getIpAddress();
        if (!ipAddress) {
            setErrorMessage("Failed to fetch IP address.");
          // log.error("Failed to fetch IP address.");
            setIsLoading(false);
            return;
        }

        const payload = {
            email,
            password,
            ip: ipAddress,
        };
        const response = await fetch("/api/auth/login", {  // Adjust the URL to your backend endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        // Log the full response body to the console
        console.log("Response Body:", JSON.stringify(result, null, 2)); // Pretty-print the response
      // log.debug("Response status:", response.status);
        
        if (result.status!=200){
            // Handle error response
            if (result.status === 401) {
                setErrorMessage("Invalid email or password. Please try again.");
            } else {
                setErrorMessage(result.message || "An unexpected error occurred.");
            }
        }
        else{
        if (result.session) {
          // log.info("Login successful");
            if (!result.onboard){
                // If the user is not onboard, redirect to onboarding page
                router.push("/user/onboard");
            } else {
                // If the user is onboard, redirect to the map page
                router.push("/map");
            }
            
            // router.push("/map");  // Redirect to map page
        } else {
            // Handle case where login is successful, but session is missing
            setErrorMessage("An unexpected error occurred.");
        }
    }
    } catch (error) {
      // log.error("Error during login:", error);
        setErrorMessage("An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
};

    return (
        <Glass title="Sign in">
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-[49px]"
            >
                <div className="flex w-full flex-col gap-[20px]">
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        variant={"default"}
                        size={"full"}
                    />
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        variant={"default"}
                        size={"full"}
                    />
                    <div className="flex h-[24px] w-full items-center gap-[8px] pl-[5px] pt-[20px]">
                        <Radio
                            selected={remember}
                            onClick={() => {
                                setRemember(!remember);
                            }}
                        />
                        <label className="font-nunito text-[14px] font-light">
                            Remember me
                        </label>
                    </div>
                </div>
                <Button
                    type="submit"
                    size={"full"}
                    className="font-semibold"
                    isLoading={isLoading}
                >
                    Log in
                </Button>
            </form>
            {/* Display error message */}
            {errorMessage && (
                <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
            )}
            <div className="font-inter flex justify-center gap-[5px] text-[16px] leading-[20px]">
                <h3 className="font-light">Create an account.</h3>
                <Link
                    href="../user/signup"
                    className="text-primary-orange font-bold"
                >
                    Sign up
                </Link>
            </div>
        </Glass>
    );
};

export { SignUpForm, LogInForm };
