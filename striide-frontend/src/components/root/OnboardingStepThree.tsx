"use client";

import React from "react";
import { Button } from "../Button";

const options = ["Daily", "Weekly", "Monthly", "Never"];

const OnboardingStepThree = ({
    frequency,
    handleFrequencyChange,
    onContinue,
}: {
    frequency: string | null;
    handleFrequencyChange: (frequency: string) => void;
    onContinue: () => void;
}) => {
    return (
        <div className="mt-4">
            <h1 className="font-montserrat text-[20px] font-normal leading-[29.26px] text-left text-[#1F1926] mb-[30px]">
                How often do you walk or commute on foot?
            </h1>
            <p className="font-nunito-sans text-[16px] font-normal leading-[22px] text-left text-[#1F1926] mb-[30px]">
                Help us customize your navigation! Select all that apply.
            </p>
            <div className="space-y-4">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => handleFrequencyChange(option)}
                        className={`w-[323px] h-[48px] border border-[#6B18D8] rounded-[32px] flex items-center justify-center text-[#6B18D8] ${
                            frequency === option ? "bg-[#6B18D8] text-white" : ""
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-center mt-40">
            <Button
                    onClick={onContinue}
                    className="w-[323px]"
                    disabled={frequency === null}  // Disable the button if 'frequency' is null
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default OnboardingStepThree;