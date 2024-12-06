import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-secondary-white text-secondary-black">
            {children}
        </div>
    );
};

export default Layout;