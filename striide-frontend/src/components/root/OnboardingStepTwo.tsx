"use client";

import React from "react";
import { Button } from "../Button";

const options = ["Walking", "Biking", "Driving", "Public Transportation"];

const OnboardingStepTwo = ({
    transportation,
    handleTransportationChange,
    onContinue,
}: {
    transportation: string[];
    handleTransportationChange: (option: string) => void;
    onContinue: () => void;
}) => {

    return (
        <div className="mt-4">
            <h1 className="font-montserrat text-[20px] font-normal leading-[29.26px] text-left text-[#1F1926] mb-[30px]">
                How do you usually get around?
            </h1>
            <p className="font-nunito-sans text-[16px] font-normal leading-[22px] text-left text-[#1F1926] mb-[30px]">
                Select your preferred options and rank them from #1. It&apos;s okay to leave some out.
            </p>
            <div className="space-y-4">
                {options.map((option) => {
                    const index = transportation.indexOf(option);
                    return (
                        <button
                            key={option}
                            onClick={() => handleTransportationChange(option)}
                            className={`w-[323px] h-[48px] border border-[#6B18D8] rounded-[32px] flex items-center justify-center text-[#6B18D8] ${index !== -1 ? "bg-[#6B18D8] text-white" : ""
                                } relative`}
                        >
                            <span>{option}</span>
                            {index !== -1 && <span className="absolute right-4">#{index + 1}</span>}
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center justify-center mt-48">
                <Button
                    onClick={onContinue}
                    className="w-[323px]"
                    disabled={transportation.length !== 4}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default OnboardingStepTwo;
