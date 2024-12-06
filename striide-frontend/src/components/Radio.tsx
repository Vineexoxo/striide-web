import React from "react";

interface RadioProps {
    selected: boolean;
    onClick: () => void;
}

const Radio = ({ selected, onClick }: RadioProps) => {
    return (
        <button
            className={`h-[24px] w-[24px] rounded-full border-[4px] border-[#D9D9D9] ${
                selected ? "bg-primary-green" : "bg-secondary-muted-purple"
            }`}
            onClick={onClick}
            type="button"
        />
    );
};

export default Radio;
