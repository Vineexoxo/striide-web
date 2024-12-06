"use client";

import React from "react";
import { sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";

interface LandingLinkProps {
    children?: React.ReactNode;
    href: string;
    className: string;
    scroll?: boolean;
}

const LandingLink = ({
    children,
    href,
    className,
    scroll,
}: LandingLinkProps) => {
    return (
        <Link
            href={href}
            scroll={scroll}
            className={className}
            onClick={() => {
                sendGAEvent("event", "landing_join_button", {
                    env: process.env.NODE_ENV,
                });
            }}
        >
            {children}
        </Link>
    );
};

export default LandingLink;
