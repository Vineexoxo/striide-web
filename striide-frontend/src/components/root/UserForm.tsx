"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../Button";
import { Input } from "../Input";
import Link from "next/link";
import Radio from "../Radio";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../../lib/constants";

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/user/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            /* sending these info fields might be a bit unsecure to use in production */
            body: JSON.stringify({
                email: email,
                password: password,
                name: name,
            }),
        });
        const data = await response.json();
        console.log(data);
        if (data.status === 200) {
            router.push("/user");
        } else {
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
        e.preventDefault();
        setIsLoading(true);
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            /* sending these info fields might be a bit unsecure to use in production */
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });
        const data = await response.json();
        if (data.status === 200) {
            router.push("/map");
        } else {
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
