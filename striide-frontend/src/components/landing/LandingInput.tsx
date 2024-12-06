"use client";

import { useState, forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, label, placeholder, id, type, ...props },
    ref,
) {
    const [revealPassword, setRevealPassword] = useState<boolean>(false);

    return (
        <div className="relative flex flex-col gap-y-1">
            <label htmlFor={id}>{label}</label>
            <input
                ref={ref}
                type={revealPassword ? "text" : type}
                id={id}
                className={cn(
                    "border-landing-border font-mulish focus:border-landing-primary bg-landing-background h-[56px] w-full rounded-[8px] border px-[16px] text-[14px] font-normal focus:border-2 focus:outline-none",
                    className,
                )}
                placeholder={placeholder}
                {...props}
            />
            {type === "password" ? (
                <div
                    className="absolute right-4 top-10 hover:cursor-pointer"
                    onClick={() => setRevealPassword(!revealPassword)}
                >
                    <Eye className="h-6 w-6" />
                </div>
            ) : null}
        </div>
    );
});

export default Input;
