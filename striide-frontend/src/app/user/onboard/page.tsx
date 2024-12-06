import React from "react";
import Wrapper from "@/components/Wrapper";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/root/OnboardingForm";

const Onboard = async () => {
    // const user = await auth();
    // if (!user) {
    //     redirect("/user/login");
    // }

    return (
        <Wrapper className="bg-secondary-white text-secondary-black">
            <div className="relative flex h-full w-[90%] items-center justify-center">
                <OnboardingForm />
            </div>
        </Wrapper>
    );
};

export default Onboard;