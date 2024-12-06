import type { Metadata } from "next";
import AuthProvider from "@/contexts/AuthProvider";

export const metadata: Metadata = {
    title: "Striide | Saved Drafts",
    description: "View your reports",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
    return <section>
        <AuthProvider>
            {children}
        </AuthProvider>
    </section>;
}
