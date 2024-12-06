import type { Metadata } from "next";
import AuthProvider from "@/contexts/AuthProvider";

export const metadata: Metadata = {
    title: "Striide | Reporting Dev",
    description: "Development of the reporting feature",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
    return <section className="min-h-screen bg-secondary-white text-secondary-black">
        <AuthProvider>
            {children}
        </AuthProvider>
    </section>;
}
