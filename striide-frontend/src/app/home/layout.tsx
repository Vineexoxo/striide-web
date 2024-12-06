import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Striide | Home",
    description: "Welcome back, Ready For Your Next Destination?",
};

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <section className="">{children}</section>;
}
