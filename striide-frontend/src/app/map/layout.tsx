import { auth } from "@/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Striide | Map",
    description: "Welcome back, Ready For Your Next Destination?",
};

export default async function MapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const user = await auth();
    // if (!user) {
    //     redirect("/user/login");
    // }
    return <section className="h-full w-full">{children}</section>;
}
