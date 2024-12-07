"use client";

import React from "react";
import { Button } from "../Button";

const options = ["Morning", "Afternoon", "Evening", "Night"];

const OnboardingStepFour = ({
    travelTimes,
    handleTravelTimesChange,
    onContinue,
}: {
    travelTimes: string[];
    handleTravelTimesChange: (option: string) => void;
    onContinue: () => void;
}) => {
    return (
        <div className="mt-4">
            <h1 className="font-montserrat text-[20px] font-normal leading-[29.26px] text-left text-[#1F1926] mb-[30px]">
                What times of the day do you usually travel?
            </h1>
            <p className="font-nunito-sans text-[16px] font-normal leading-[22px] text-left text-[#1F1926] mb-[30px]">
                Help us customize your navigation! Select all that apply.
            </p>
            <div className="space-y-4">
                {options.map((option) => {
                    const index = travelTimes.indexOf(option);
                    return (
                        <button
                            key={option}
                            onClick={() => handleTravelTimesChange(option)}
                            className={`w-[323px] h-[48px] border border-[#6B18D8] rounded-[32px] flex items-center justify-center text-[#6B18D8] ${
                                index !== -1 ? "bg-[#6B18D8] text-white" : ""
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            <div className="flex items-center justify-center mt-40">
                <Button 
                    onClick={onContinue}
                    className="w-[323px]"
                    disabled={travelTimes.length === 0}  // Disable the button if no option is selected
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default OnboardingStepFour;