"use client";

import React, { useEffect, useRef, useState } from "react";
import LandingInput from "./LandingInput";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LandingDropdownProps {
    options: any;
    placeholder: string;
    value: string;
    setValue: any;
}

const test = [
    { id: 0, name: "Option 1" },
    { id: 1, name: "Option 2" },
    { id: 2, name: "Option 3" },
    { id: 3, name: "Aption 1" },
    { id: 4, name: "Option 2" },
    { id: 5, name: "Option 3" },
    { id: 6, name: "Option 1" },
    { id: 7, name: "Option 2" },
    { id: 8, name: "Option 3" },
];

const LandingDropdown = ({
    options,
    placeholder,
    value,
    setValue,
}: LandingDropdownProps) => {
    const [open, setOpen] = useState(false);

    const inputRef = useRef(null);

    const handleClick = (e: any) => setOpen(e && e.target === inputRef.current);

    useEffect(() => {
        document.addEventListener("click", handleClick);
        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <div className="relative">
            <LandingInput
                ref={inputRef}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    setOpen(true);
                    setValue(e.target.value);
                }}
            />
            {open ? (
                <ChevronUp
                    className="absolute right-4 top-[24px] cursor-pointer"
                    size={20}
                />
            ) : (
                <ChevronDown
                    className="pointer-events-none absolute right-4 top-[24px]"
                    size={20}
                />
            )}
            {open && (
                <ul className="border-landing-border mt-[20px] flex max-h-[98px] flex-col overflow-scroll overscroll-contain rounded-[8px] border px-[16px] py-[8px] text-[14px]">
                    {options.filter((option: any) =>
                        option.name
                            .toLowerCase()
                            .startsWith(value.toLowerCase()),
                    ).length > 0 ? (
                        options
                            .filter((option: any) =>
                                option.name
                                    .toLowerCase()
                                    .startsWith(value.toLowerCase()),
                            )
                            .map((option: any, index: number) => (
                                <li
                                    key={index}
                                    onClick={() => setValue(option.name)}
                                    className="hover:bg-landing-background hover:text-landing-primary cursor-pointer"
                                >
                                    {option.name}
                                </li>
                            ))
                    ) : (
                        <li className="text-landing-primary">
                            * No results found
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default LandingDropdown;
