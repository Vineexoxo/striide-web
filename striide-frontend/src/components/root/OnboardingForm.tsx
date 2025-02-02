"use client";

import React, { useState } from "react";
import OnboardingStepOne from "./OnboardingStepOne";
import OnboardingStepTwo from "./OnboardingStepTwo";
import OnboardingStepThree from "./OnboardingStepThree";
import OnboardingStepFour from "./OnboardingStepFour";
import OnboardingStepFive from "./OnboardingStepFive";
import OnboardingStepSix from "./OnboardingStepSix";
import { useRouter } from 'next/navigation';
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
    transportation: string[];
    frequency: string | null;
    travelTimes: string[];
    referralSource: string | null;
};

const OnboardingForm = () => {
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FormFields>({
        email: "",
        city: "",
        state: "",
        occupation: "",
        birthday: "",
        phoneNumber: "",
        gender: null,
        isConfirmed: false,
        transportation: [],
        frequency: null,
        travelTimes: [],
        referralSource: null,
    });

    const handleContinue = () => {
        // log.debug("Step", step, "Continuing to next step");
        setStep((prevStep) => prevStep + 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // log.debug(`Form field changed: ${name} = ${value}`);
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleGenderChange = (gender: string) => {
        // log.debug("Gender selection changed to:", gender);
        const genderMap: { [key: string]: string } = {
            "Man": "Male",
            "Woman": "Female",
            "Non-binary": "NonBinary",
            "Other": "Other",
            "Prefer not to say": "PreferNotToSay"
        };
        setFormData((prevData) => ({
            ...prevData,
            gender: genderMap[gender] || gender,
        }));
    };

    const handleCheckboxChange = () => {
        // log.debug("Checkbox for confirmation changed:", !formData.isConfirmed);

        setFormData((prevData) => ({
            ...prevData,
            isConfirmed: !prevData.isConfirmed,
        }));
    };

    const handleTransportationChange = (option: string) => {
        // log.debug("Transportation option selected:", option);

        setFormData((prevData) => {
            const transportation = prevData.transportation.includes(option)
                ? prevData.transportation.filter((opt) => opt !== option)
                : [...prevData.transportation, option];
            return { ...prevData, transportation };
        });

    };

    const handleFrequencyChange = (frequency: string) => {
        // log.debug("Frequency selected:", frequency);

        setFormData((prevData) => ({
            ...prevData,
            frequency: frequency.charAt(0).toUpperCase() + frequency.slice(1),
        }));
    };

    const handleTravelTimesChange = (option: string) => {
        // log.debug("Travel time option selected:", option);

        setFormData((prevData) => {
            const travelTimes = prevData.travelTimes.includes(option)
                ? prevData.travelTimes.filter((opt) => opt !== option)
                : [...prevData.travelTimes, option];
            return { ...prevData, travelTimes };
        });
    };

    const handleReferralSourceChange = (referralSource: string) => {
        // log.debug("Referral source changed to:", referralSource);

        setFormData((prevData) => ({
            ...prevData,
            referralSource,
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            email: formData.email,
            user_info: {
                city: formData.city,
                state: formData.state,
                occupation: formData.occupation,
                gender: formData.gender,
                birthdate: formData.birthday ? formData.birthday + "T00:00:00Z" : new Date().toISOString().split('T')[0] + "T00:00:00Z",
                phone_number: formData.phoneNumber,
                transport_modes: formData.transportation.map(mode => mode === "Public Transportation" ? "PublicTransport" : mode),
                commute_frequency: formData.frequency,
                travel_time: formData.travelTimes[0],
                feed_type: formData.referralSource,
                onboard: true
            },
        };

        console.log("Payload:", JSON.stringify(payload, null, 2));
      // log.info("Form data payload ready for submission:", JSON.stringify(payload, null, 2));


        try {
            const response = await fetch("/api/entry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);
            console.log("Response body:", responseText);

            //logs
          // log.info("Response received from server:");
          // log.debug("Status:", response.status);
          // log.debug("Headers:", response.headers);
          // log.debug("Response Body:", responseText);


            if (!response.ok) {
                throw new Error(`Failed to submit data: ${response.status} ${response.statusText}`);
            }

            try {
                const responseData = JSON.parse(responseText);
              // log.info("Parsed response data:", responseData);
                // console.log("Parsed response data:", responseData);
            } catch (parseError) {
              // log.error("Error parsing response as JSON: ", parseError);
                // console.error("Error parsing response as JSON: ", parseError);
            }

            console.log("Data submitted successfully");
            // Redirect to the map page
            router.push('/map');
        } catch (error) {
          // log.error("Error submitting data:", error);
            // console.error("Error submitting data:", error);
            // Handle error (e.g., show an error message to the user)
        }
        // router.push('/map');
    };

    return (
        <div className="mt-4">
            {step === 0 && (
                <OnboardingStepOne
                    formData={formData}
                    handleChange={handleChange}
                    handleGenderChange={handleGenderChange}
                    handleCheckboxChange={handleCheckboxChange}
                    onContinue={handleContinue}
                />
            )}
            {step === 1 && (
                <OnboardingStepTwo
                    transportation={formData.transportation}  // Ensure size is 4
                    handleTransportationChange={handleTransportationChange}
                    onContinue={handleContinue}
                />
            )}
            {step === 2 && (
                <OnboardingStepThree
                    frequency={formData.frequency}
                    handleFrequencyChange={handleFrequencyChange}
                    onContinue={handleContinue}
                />
            )}
            {step === 3 && (
                <OnboardingStepFour
                    travelTimes={formData.travelTimes}
                    handleTravelTimesChange={handleTravelTimesChange}
                    onContinue={handleContinue}
                />
            )}
            {step === 4 && (
                <OnboardingStepFive
                    referralSource={formData.referralSource}
                    handleReferralSourceChange={handleReferralSourceChange}
                    onContinue={handleContinue}
                />
            )}
            {step === 5 && (
                <OnboardingStepSix onContinue={handleSubmit} />
            )}
        </div>
    );
};

export default OnboardingForm;