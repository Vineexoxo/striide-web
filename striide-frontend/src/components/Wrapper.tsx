"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BackgroundProps {
    children?: React.ReactNode;
    className?: string;
}

const Wrapper = ({ children, className }: BackgroundProps) => {
    return (
        <section
            className={cn(
                `text-secondary-white flex h-full w-full justify-center`,
                className,
            )}
        >
            <div className={`flex h-full w-full max-w-[400px] justify-center`}>
                {children}
            </div>
        </section>
    );
};

export default Wrapper;
