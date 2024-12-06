import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Striide | Welcome",
    description: "Welcome back, Ready For Your Next Destination?",
};

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
