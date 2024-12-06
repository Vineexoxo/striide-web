"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface UserPageProps {
    name: string;
    href: string;
}

const UserPage = ({ name, href }: UserPageProps) => {
    return (
        <div className="relative flex h-full w-full items-center justify-center">
            <div className="relative flex h-[420px] w-[361px]">
                <h2 className="font-montserrat absolute left-[30px] top-0 text-[54px] font-extrabold">
                    HELLO!
                </h2>
                <h2 className="font-montserrat absolute right-[30px] top-[100px] text-[24px] font-extralight">
                    {name}
                </h2>
                <h3 className="font-nunito absolute bottom-0 w-full p-[35px] text-[20px] font-light">
                    We&apos;re building this for you! <br /> Tell us a bit about
                    yourself so we can tailor the experience to you.
                </h3>
            </div>
            <Link
                className="absolute bottom-[50px] right-0 flex cursor-pointer gap-[3px]"
                href={href}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="40"
                    viewBox="0 0 23 40"
                    fill="none"
                >
                    <path
                        d="M3 36.5L19.75 19.75L3 3"
                        stroke="#FFF6FF"
                        strokeOpacity="0.6"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="40"
                    viewBox="0 0 23 40"
                    fill="none"
                >
                    <path
                        d="M2.75 36.5L19.5 19.75L2.75 3"
                        stroke="#FFF6FF"
                        strokeOpacity="0.8"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="40"
                    viewBox="0 0 23 40"
                    fill="none"
                >
                    <path
                        d="M3.5 36.5L20.25 19.75L3.5 3"
                        stroke="#FFF6FF"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </Link>
        </div>
    );
};

export default UserPage;
