import React from "react";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Eye } from "lucide-react";

const inputVariants = cva(
    [
        "rounded-[8px]",
        "pl-[16px]",
        "pr-[36px]",
        "font-mulish",
        "font-normal",
        "text-[14px]",
        "focus:outline-none",
    ],
    {
        variants: {
            variant: {
                default:
                    "border bg-secondary-white border-secondary-muted-purple placeholder:text-secondary-muted-purple text-primary-purple",
            },
            size: {
                default: "w-[80%] h-[40px]",
                password: "w-[80%] h-[40px]",
                full: "w-full h-[40px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
        VariantProps<typeof inputVariants> {}

const Input = ({
    onChange,
    placeholder,
    value,
    className,
    type,
    variant,
    size,
}: InputProps) => {
    const [revealPassword, setRevealPassword] = React.useState(false);
    return (
        <div className="relative w-full">
            <input
                className={cn(inputVariants({ variant, size }), className)}
                onChange={onChange}
                placeholder={placeholder}
                value={value}
                type={revealPassword ? "text" : type}
                autoComplete="on"
            />
            {type === "password" ? (
                <div
                    className="text-secondary-muted-purple hover:text-primary-purple absolute right-3 top-[10px] select-none duration-200 hover:cursor-pointer"
                    onClick={() => setRevealPassword(!revealPassword)}
                >
                    <Eye className="h-5 w-5" />
                </div>
            ) : null}
        </div>
    );
};

export { Input, inputVariants };
