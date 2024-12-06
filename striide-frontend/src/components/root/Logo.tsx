"use client";

import React from "react";
import {
    AnimatePresence,
    motion,
    TargetAndTransition,
    VariantLabels,
} from "framer-motion";

interface LogoScreenProps {
    children?: React.ReactNode;
    exit?: VariantLabels | TargetAndTransition;
    animate?: boolean;
}

const LogoScreen = ({ children, exit, animate }: LogoScreenProps) => {
    const [isComplete, setIsComplete] = React.useState(false);

    if (!animate) {
        return <>{children} </>;
    }

    return (
        <AnimatePresence>
            {!isComplete ? (
                <motion.h1
                    key="Logo"
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                        transition: {
                            duration: 1,
                            delay: 0.5,
                        },
                    }}
                    exit={exit}
                    onAnimationComplete={() =>
                        setTimeout(() => setIsComplete(true), 500)
                    }
                    className="text-secondary-white font-inter absolute top-[45%] w-full text-center text-[64px] font-bold italic"
                >
                    Striide
                </motion.h1>
            ) : (
                children
            )}
        </AnimatePresence>
    );
};

export default LogoScreen;
