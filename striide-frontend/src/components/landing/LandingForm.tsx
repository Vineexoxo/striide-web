"use client";

import React from "react";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import LandingInput from "./LandingInput";
import LandingDropdown from "./LandingDropdown";
import { Button } from "@/components/landing/LandingButton";
import { GetState, GetCity } from "react-country-state-city";
import { sendGAEvent } from "@next/third-parties/google";

const LandingForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        state: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [stateList, setStateList] = useState([] as any);
    const [stateOptions, setStateOptions] = useState([] as any);
    const [cityList, setCityList] = useState([]);

    useEffect(() => {
        sendGAEvent("event", "page_view", {
            env: process.env.NODE_ENV,
        });
    }, []);

    useEffect(() => {
        GetState(233).then((result: any) => {
            setStateList(result);
            setStateOptions(
                result
                    .map((state: any) => ({ id: state.id, name: state.name }))
                    .concat(
                        result.map((state: any) => ({
                            id: state.id,
                            name: state.state_code,
                        })),
                    ),
            );
        });
    }, []);

    useEffect(() => {
        setErrorMessage("");
    }, [formData]);

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            city: "",
        }));
    }, [formData.state]);

    useEffect(() => {
        const index = stateOptions.findIndex(
            (state: any) =>
                state.name.toLowerCase() === formData.state.toLowerCase(),
        );
        if (index > -1) {
            GetCity(233, stateOptions[index].id).then((result: any) => {
                setCityList(result);
            });
        }
    }, [stateOptions, formData.state, stateList]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.email ||
            !formData.phone ||
            !formData.city ||
            !formData.state
        ) {
            setErrorMessage("* All fields are required");
            return;
        }
        if (!stateOptions.some((state: any) => state.name === formData.state)) {
            setErrorMessage("* Invalid state");
            return;
        }
        if (
            cityList.length > 0 &&
            !cityList.some((city: any) => city.name === formData.city)
        ) {
            setErrorMessage("* Invalid city");
            return;
        }
        try {
            const index = stateOptions.findIndex(
                (state: any) =>
                    state.name.toLowerCase() === formData.state.toLowerCase(),
            );
            console.log({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                state: stateList.find(
                    (state: any) => state.id === stateOptions[index].id,
                )!.name,
            });
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/landing`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    state: stateList.find(
                        (state: any) => state.id === stateOptions[index].id,
                    )!.name,
                }),
            }).then((res) => {
                if (res.ok) {
                    setSubmitted(true);
                    sendGAEvent("event", "landing_form_submit", {
                        env: process.env.NODE_ENV,
                    });
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    if (submitted) {
        return (
            <div className="flex w-full flex-col gap-y-10 md:w-[500px]">
                <h2 className="text-landing-primary text-3xl font-extrabold">
                    Thank you for signing up!
                </h2>
                <p className="text-landing-primary text-lg font-semibold">
                    We will reach out to you soon.
                </p>
            </div>
        );
    }

    return (
        <form
            className="flex w-full flex-col gap-y-[25px] md:w-[480px]"
            onSubmit={handleSubmit}
        >
            <div className="flex flex-col gap-y-[24px]">
                <LandingInput
                    id="name"
                    name="name"
                    placeholder="Full name"
                    onChange={handleChange}
                />
                <LandingInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    onChange={handleChange}
                />
                <LandingInput
                    id="phone"
                    name="phone"
                    placeholder="Phone number"
                    onChange={handleChange}
                />
                <LandingDropdown
                    placeholder="State"
                    options={stateOptions}
                    value={formData.state}
                    setValue={(value: string) => {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            state: value,
                        }));
                    }}
                />
                <LandingDropdown
                    placeholder="City"
                    options={cityList}
                    value={formData.city}
                    setValue={(value: string) => {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            city: value,
                        }));
                    }}
                />
                <h2 className="font-montserrat text-base text-red-400">
                    {errorMessage}
                </h2>
            </div>
            <Button variant={"landing"} size={"landing"} type="submit">
                Join us
            </Button>
        </form>
    );
};

export default LandingForm;
