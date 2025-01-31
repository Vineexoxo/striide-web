"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../Button";
import Link from "next/link";
import log from "@/logger";

// Function to handle log message when "Sign Up" button is clicked
const handleSignUpClick = () => {
    // Log the event (send log to console and to your log server if necessary)
  // log.info('Sign Up button clicked on the Welcome page');
    

    // // Optionally, you can send a log to your backend API (log server)
    // fetch('http://localhost:4001/api/log', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         message: 'Sign Up button clicked on the Welcome page',
    //         level: 'info',
    //         timestamp: new Date().toISOString(),
    //     }),
    // }).catch((error) => {
    //     console.error('Failed to send log:', error);
    // });
};


const WelcomePage = () => {
    return (
        <div className="relative z-10 flex h-full w-[90%] flex-col justify-evenly">
            <div className="flex h-fit w-full flex-col items-center gap-[82px]">
                <div className="font-montserrat text-secondary-white flex w-full justify-center gap-[10px] text-[30px] font-bold">
                    <motion.span
                        initial={{
                            opacity: 0,
                            y: -50,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 1,
                            },
                        }}
                    >
                        Welcome to
                    </motion.span>
                    <motion.span
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                duration: 1,
                                delay: 0.5,
                            },
                        }}
                        className="italic"
                    >
                        Striide

                    </motion.span>
                </div>
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        transition: { duration: 0.5, delay: 0.5 },
                    }}
                    className="font-nunito text-secondary-white w-[323px] pl-[5px] text-[20px] font-light leading-[28px]"
                >
                    Join us in building a connected and aware community where we
                    look out for each other.
                    <br /> <br /> Welcome to Version 1! It&apos;s not perfect,
                    but with your help, we can make it amazing.
                </motion.h2>
            </div>
            <motion.div
                initial={{
                    opacity: 0,
                    y: 150,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 1,
                        delay: 1,
                    },
                }}
                className="flex w-full flex-col items-center justify-center gap-[20px] pt-[50px]"
            >
                <Link
                    href="/user/signup"
                    className="flex w-full items-center justify-center"
                    onClick={handleSignUpClick}  // Add the log when button is clicked

                >
                    <Button variant="secondary" size="full" className="w-[80%]">
                        Sign Up
                    </Button>
                </Link>
                <Link
                    href="/user/login"
                    className="flex w-full items-center justify-center"
                >
                    <Button
                        variant="transparent"
                        size="full"
                        className="w-[80%]"
                    >
                        Log In
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
};

export default WelcomePage;
