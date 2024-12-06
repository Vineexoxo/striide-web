import React from "react";
import { SignUpForm } from "@/components/root/UserForm";
import Wrapper from "@/components/Wrapper";

const SignUp = () => {
    return (
        <Wrapper className="bg-signup-linear-gradient">
            <div className="relative flex h-full w-[90%] items-center justify-center">
                <h1 className="font-montserrat absolute top-[54px] flex w-full justify-center text-[30px] font-bold italic">
                    Striide
                </h1>
                <SignUpForm />
            </div>
        </Wrapper>
    );
};

export default SignUp;
