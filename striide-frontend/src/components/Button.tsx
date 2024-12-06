import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
    [
        "rounded-[8px]",
        "justify-center",
        "items-center",
        "flex",
        "font-montserrat",
        "font-normal",
        "text-[16px]",
        "duration-200",
        "hover:opacity-80",
    ],
    {
        variants: {
            variant: {
                default: "text-secondary-white bg-primary-purple",
                secondary: "text-primary-purple bg-secondary-white",
                transparent:
                    "border border-secondary-white text-secondary-white",
            },
            size: {
                default: "w-[80%] h-[48px]",
                full: "w-full h-[48px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, children, variant, isLoading, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size }), className)}
                ref={ref}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {children}
            </button>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
