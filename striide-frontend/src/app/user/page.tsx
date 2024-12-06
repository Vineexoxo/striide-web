import React from "react";
import UserPage from "@/components/root/UserPage";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Wrapper from "@/components/Wrapper";

const User = async () => {
    const user = await auth();
    if (!user) {
        redirect("/user/login");
    }

    return (
        <Wrapper className="bg-signup-linear-gradient">
            <div className="relative flex h-full w-[90%] items-center justify-center">
                <h1 className="font-montserrat absolute top-[54px] flex w-full justify-center text-[30px] font-bold italic">
                    Striide
                </h1>
                <UserPage
                    name={user.name.split(" ")[0]}
                    href={user.onboard ? "/map" : "/user/onboard"}
                />
            </div>
        </Wrapper>
    );
};

export default User;
