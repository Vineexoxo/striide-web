"use client";

import React from "react";
import Radio from "@/components/Radio";
import Checkbox from "@/components/Checkbox";
import { Button } from "../Button";
import Image from "next/image";
import log from "@/logger";

type FormFields = {
    email: string;
    city: string;
    state: string;
    occupation: string;
    birthday: string;
    phoneNumber: string;
    gender: string | null;
    isConfirmed: boolean;
};

const OnboardingStepOne = ({
    formData,
    handleChange,
    handleGenderChange,
    handleCheckboxChange,
    onContinue,
}: {
    formData: FormFields;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleGenderChange: (gender: string) => void;
    handleCheckboxChange: () => void;
    onContinue: () => void;
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if all fields are filled
        const isFormValid =
            formData.email.trim() &&
            formData.city.trim() &&
            formData.state.trim() &&
            formData.occupation.trim() &&
            formData.birthday.trim() &&
            // formData.phoneNumber.trim() &&
            formData.gender &&
            formData.isConfirmed;

        if (!isFormValid) {
            alert("Please fill in all fields and confirm the terms to continue.");
          // log.warn("Form submission failed: Missing required fields or terms not confirmed.");

            return;
        }
        onContinue();
    };

    const genderOptions = ['Male', 'Female', 'NonBinary', 'Other', 'PreferNotToSay'];

    return (
        <div className="mt-4">
            <h1 className="font-montserrat text-[24px] font-medium leading-[29.26px] text-left text-[#1F1926] mb-[30px]">
                You are helping us make a data driven solution.
            </h1>
            <form className="space-y-[38px]" onSubmit={handleSubmit}>
                {['Email', 'City', 'State', 'Occupation', 'Birthday', 'Phone number'].map((field) => (
                    <div key={field} className="relative mb-4">
                        <label className="block font-nunito-sans text-[14px] font-semibold leading-[22px] text-left text-[#9E88B2]">
                            {field}
                        </label>
                        <div className="relative">
                            <input
                                type={field === 'Birthday' ? 'date' : 'text'}
                                name={field.toLowerCase().replace(" ", "")}
                                value={String(formData[field.toLowerCase().replace(" ", "") as keyof FormFields])}
                                onChange={handleChange}
                                className={`font-semibold w-full border-b border-[#A9A9A9] pt-3 bg-secondary-white focus:outline-none ${field === 'Birthday' ? 'date-input pr-8' : ''
                                    }`}
                                autoComplete="off"
                            />
                            {field === 'Birthday' && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Image
                                        src="/calendar.svg"
                                        alt="Calendar"
                                        width={24}
                                        height={24}
                                        className="calendar-icon"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div>
                    <label className="block font-nunito-sans text-[20px] font-bold leading-[22px] text-left text-[#1F1926] mb-[30px]">
                        Gender
                    </label>
                    <div className="space-y-2">
                        {genderOptions.map((option) => (
                            <div key={option} className="flex items-center gap-1">
                                <Radio
                                    selected={formData.gender === option}
                                    onClick={() => handleGenderChange(option)}
                                />
                                <span className="ml-2 mb-1 text-[#1F1926]">{option}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex mt-4 gap-1">
                    <Checkbox
                        checked={formData.isConfirmed}
                        onClick={handleCheckboxChange}
                    />
                    <span className="ml-2 -mt-1.5 font-semibold text-[#1F1926]">
                        I hereby confirm that I have read and agree with the{" "}
                        <span className="underline">Terms of Service</span>
                        {"  "}and{" "}
                        <span className="underline">Privacy Policy.</span>
                    </span>
                </div>
                <div className="flex justify-center pb-8">
                    <Button type="submit" className="w-[323px]">
                        Continue
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default OnboardingStepOne;