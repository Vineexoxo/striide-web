"use client";

import React from "react";
import Image from "next/image";
import { Button } from "../Button";

const OnboardingStepSix = ({ onContinue }: { onContinue: () => void }) => {
    return (
        <div className="mt-4 flex flex-col items-center">
            <Image src="/image.png" alt="Onboarding Image" width={500} height={500} className="mb-8" />
            <p className="font-nunito-sans text-[16px] font-normal leading-[21.82px] text-left text-[#1F1926] mb-[30px] px-4">
                Your insights are invaluable. During this beta phase, we encourage you to share your feedback, report any issues, and suggest improvements.
                <br />
                <br />
                Together, let&apos;s empower one another!
            </p>
            <div className="flex items-center justify-center mt-auto mb-8">
                <Button onClick={onContinue} className="w-[323px]">
                    Let&apos;s Stride
                </Button>
            </div>
        </div>
    );
};

export default OnboardingStepSix;