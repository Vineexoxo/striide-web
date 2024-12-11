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
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getIpAddress = async (): Promise<string | null> => {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const data = await response.json();
            log.debug("Fetched IP address:", data.ip);
            return data.ip;
        } catch (error) {
            log.error("Failed to fetch IP address:", error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        log.info("Form submission started.");
        setIsLoading(true);
        setErrorMessage("");

        // Input validation
        if (!name || !email || !password) {
            // log.error("Form submission failed: Could not fetch IP address.");
            log.warn("Form submission failed: Missing required fields.");
            setErrorMessage("Please fill out all fields.");
            setIsLoading(false);
            return;
        }
      
        try {
            const ipAddress = await getIpAddress();
            if (!ipAddress) {
                setErrorMessage("Failed to fetch IP address.");
                log.error("Failed to fetch IP address.");
                setIsLoading(false);
                return;
            }

            const payload = {
                name,
                email,
                password,
                ip: ipAddress,
            };

            log.info(`Form payload: ${JSON.stringify(payload, null, 2)}`)
            // log.info('Sign Up button clicked on the Welcome page');
            console.log("Payload:", JSON.stringify(payload, null, 2));  // For client-side debugging
    
            log.info("Redirecting user to the onboarding page.");
            router.push("/user/onboard");
        } catch (error) {
            log.error("An unexpected error occurred during form submission:", error);

            setErrorMessage("An unexpected error occurred.");
            console.error(error);
        } finally {
            log.info("Form submission process ended.");
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
                        value={name}
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        log.debug("Attempting to log in with email:", email);

        // e.preventDefault();
        // setIsLoading(true);
        // const response = await fetch("/api/auth/login", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     /* sending these info fields might be a bit unsecure to use in production */
        //     body: JSON.stringify({
        //         email: email,
        //         password: password,
        //     }),
        // });
        // const data = await response.json();
        if (true) {
            log.info("log successful");
            router.push("/map");
        } else {
            log.warn("Error during login");
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
