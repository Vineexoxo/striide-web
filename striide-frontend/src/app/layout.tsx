import type { Metadata } from "next";
import { Inter, Montserrat, Mulish, Nunito_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/contexts/AuthProvider";
import { GoogleAnalytics } from "@next/third-parties/google";

const mulish = Mulish({
    weight: ["400", "500", "600", "700", "800"],
    subsets: ["latin"],
    variable: "--font-mulish",
});
const inter = Inter({
    weight: ["300", "400", "500", "600", "700", "800"],
    subsets: ["latin"],
    variable: "--font-inter",
});
const montserrat = Montserrat({
    weight: ["200", "300", "400", "500", "600", "700", "800"],
    subsets: ["latin"],
    variable: "--font-montserrat",
});
const nunito = Nunito_Sans({
    weight: ["300", "400", "600", "700", "800"],
    subsets: ["latin"],
    variable: "--font-nunito",
});

const GA_TRACKING_ID = "G-PT58DYRQ1P";

export const metadata: Metadata = {
    title: "Striide | Home",
    description: "Your First Step For A Worry Free Compute",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`bg-secondary-black fixed h-full w-full overscroll-none ${montserrat.variable} ${inter.variable} ${mulish.variable} ${nunito.variable}`}
            >
                <div className="h-full w-full overflow-scroll overscroll-none">
                    <AuthProvider>{children}</AuthProvider>
                </div>
            </body>
            <GoogleAnalytics gaId={GA_TRACKING_ID} />
        </html>
    );
}
