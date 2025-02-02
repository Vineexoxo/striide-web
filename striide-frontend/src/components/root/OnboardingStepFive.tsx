"use client";

import React, { useState } from "react";
import { Button } from "../Button";

const options = ["Social Media", "Friends / Family", "Email / Newsletter", "Exploring the app store", "Other"];

const OnboardingStepFive = ({
    referralSource,
    handleReferralSourceChange,
    onContinue,
}: {
    referralSource: string | null;
    handleReferralSourceChange: (referralSource: string) => void;
    onContinue: () => void;
}) => {
    return (
        <div className="mt-4">
            <h1 className="font-montserrat text-[20px] font-normal leading-[29.26px] text-left text-[#1F1926] mb-[30px]">
                How did you hear about Striide?
            </h1>
            <div className="space-y-4">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => handleReferralSourceChange(option)}
                        className={`w-[323px] h-[48px] border border-[#6B18D8] rounded-[32px] flex items-center justify-center ${
                            referralSource === option ? "bg-[#6B18D8] text-white" : "text-[#6B18D8]"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-center mt-48">
                <Button onClick={onContinue} className="w-[323px]">
                    Continue
                </Button>
            </div>
        </div>
    );
};


export default OnboardingStepFive;