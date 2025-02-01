"use client";

import React, { useEffect } from "react";
import Feedback from "@/components/feedback/Feedback";
import { checkAuthCookie } from "@/lib/check-auth";


const page = () => {

    useEffect(() => {
        checkAuthCookie();
    }, []);

    return <Feedback />;
};

export default page;
