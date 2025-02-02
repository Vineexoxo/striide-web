"use client";

import Image from "next/image";
import LandingForm from "@/components/landing/LandingForm";
import Link from "next/link";
import LandingLink from "@/components/landing/LandingLink";
import { useEffect } from "react";
import { checkAuthCookie } from "@/lib/check-auth";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const checkUserAuthentication = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/get-user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (!data.user || data.user.role !== 'authenticated') {
                    router.push('/user/login');
                }
            } catch (error) {
                console.error('Error checking user authentication:', error);
            }
        };

        checkUserAuthentication();
    }, [router]);

    return (
        <main className="bg-landing-background">
            <div className="relative h-[929px] max-h-screen w-screen md:max-h-none">

                <div className="absolute top-0 z-10 flex h-[80px] w-full items-center bg-white bg-opacity-[0.17] backdrop-blur-[20px]">
                    <h1 className="font-inter text-landing-background ml-[40px] h-fit w-fit p-[8px] text-center text-[37px] font-bold italic md:ml-[144px]">
                        Striide
                    </h1>
                </div>
                <div className="absolute left-[8px] top-[4%] z-10 flex h-[442px] w-4/5 max-w-[400px] flex-col items-center justify-center gap-[20px] rounded-[16px] bg-white bg-opacity-0 backdrop-blur-0 md:left-[74px] md:top-[325px] md:w-5/6 md:max-w-[791px] md:gap-12 md:bg-opacity-[0.04] md:backdrop-blur-[20px]">
                    <h2 className="font-montserrat w-full pl-[40px] pr-[30px] text-[25px] font-extrabold leading-[36px] text-white md:pl-[70px] md:text-[50px] md:leading-[66px]">
                        Ever felt anxious
                        <br /> walking alone?
                    </h2>
                    <h3 className="font-montserrat w-full pl-[40px] pr-[30px] text-[20px] font-semibold leading-[29px] text-white md:pl-[70px] md:text-[25px] md:leading-[40px]">
                        We have too. <br /> And now we are doing{" "}
                        <br className="flex md:hidden" />
                        something about it.
                    </h3>
                    <h3 className="font-montserrat hidden w-full pl-[40px] pr-[30px] text-[16px] font-semibold leading-[23px] text-white md:flex md:pl-[70px] md:text-[20px] md:leading-[25px]">
                        We are creating an app that makes going out at night
                        more comfortable.
                    </h3>
                </div>
                <h3 className="font-montserrat absolute bottom-[220px] left-[50px] z-10 w-4/5 max-w-[400px] pr-[70px] text-[16px] font-semibold leading-[23px] text-white md:hidden">
                    We are creating an app that makes going out at night more
                    comfortable.
                </h3>
                <LandingLink
                    href={"#form-section"}
                    className="font-montserrat border-landing-primary bg-landing-primary md:bg-landing-background text-landing-background md:text-landing-primary absolute bottom-[130px] left-[40px] z-10 flex h-[45px] w-[138px] items-center justify-center rounded-[16px] border p-[16px] text-[14px] font-semibold hover:bg-opacity-80 md:bottom-auto md:left-auto md:right-[144px] md:top-[18px] md:text-[20px] md:drop-shadow-[4px_4px_4px_#1F192640]"
                    scroll={true}
                >
                    Join us
                </LandingLink>
                <Image
                    src="/HomeImage.jpg"
                    alt="Home Image"
                    fill
                    unoptimized={true}
                    style={{
                        objectFit: "cover",
                        objectPosition: "70%",
                    }}
                />
            </div>
            <div
                className="relative flex w-screen justify-center pb-[100px]"
                id="form-section"
            >
                <div className="flex w-4/5 flex-col gap-[36px] pt-[80px] md:w-full md:gap-[76px] md:pl-[152px]">
                    <div className="font-montserrat text-landing-primary flex flex-col items-stretch">
                        <h2 className="text-3xl font-extrabold md:text-[36px]">
                            We need you!
                        </h2>
                        <h2 className="mt-[10px] text-3xl font-extrabold md:mt-[30px] md:text-[36px]">
                            Co-create a solution with us.
                        </h2>
                        <h3 className="mt-[50px] text-lg font-semibold md:mt-[30px] md:text-[24px]">
                            Sign up to be a private beta tester.
                        </h3>
                    </div>
                    <div className="font-montserrat">
                        <LandingForm />
                    </div>
                </div>
                <div className="absolute bottom-[100px] right-[8%] hidden h-[450px] w-[225px] lg:flex">
                    <Image
                        src="/LandingPhone1.png"
                        alt="Landing Phone"
                        fill
                        sizes="100vw 400px"
                    />
                </div>
                <div className="absolute bottom-[100px] right-[20%] z-10 hidden h-[340px] w-[170px] lg:flex">
                    <Image
                        src="/LandingPhone2.png"
                        alt="Landing Phone"
                        fill
                        unoptimized={true}
                        priority
                        sizes="100vw 400px"
                    />
                </div>
            </div>
        </main>
    );
}
