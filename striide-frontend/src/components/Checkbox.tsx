import React from "react";

interface CheckboxProps {
    checked: boolean;
    onClick: () => void;
}

const Checkbox = ({ checked, onClick }: CheckboxProps) => {
    return (
        <button
            className={`h-[16px] w-[30px] border-[2px] border-[#6B18D8] rounded-[4px] flex items-center justify-center`}
            onClick={onClick}
            type="button"
        >
            {checked && <div className="h-[10px] w-[10px] bg-[#FF7A4B]"></div>}
        </button>
    );
};

export default Checkbox;