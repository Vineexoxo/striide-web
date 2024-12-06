"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/root/Logo";
import Welcome from "@/components/root/Welcome";
import Wrapper from "@/components/Wrapper";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        async function checkSession() {
            const response = await fetch("http://127.0.0.1:8000/api/check_session", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === "Ok") {
                    router.push("/home");
                }
            }
        }

        checkSession();
    }, [router]);

    return (
        <Wrapper className="bg-landing-linear-gradient">
            <Logo
                exit={{
                    fontSize: "30px",
                    top: "15%",
                    x: 100,
                    opacity: 0,
                    transition: { duration: 1, ease: "easeInOut" },
                }}
                animate={true}
            >
                <Welcome />
            </Logo>
        </Wrapper>
    );
}