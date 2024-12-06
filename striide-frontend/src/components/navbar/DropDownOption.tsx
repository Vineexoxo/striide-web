import { Dispatch, FC, SetStateAction } from 'react'
import { MapPin } from 'lucide-react';
import { Feature } from "@/lib/types"

interface DropDownOptionProps {
    features: Feature[] | string[], 
    setDestination: Dispatch<SetStateAction<Feature | undefined>>
}

const DropDownOption: FC<DropDownOptionProps> = ({ features, setDestination }) => {
    const isStringArray = (features: Feature[] | string[]): features is string[] => {
        return typeof (features as string[])[0] === 'string';
    };

    if (isStringArray(features)) {
        if (features[0] === "NO SEARCH VALUES RETURNED") {
            return (
                <div className='absolute top-8 right-14 w-64 border-b border-l border-r border-grey-hi-fi bg-offwhite-hi-fi'>
                    <div
                        className={"flex flex-row gap-x-2 px-1 justify-center items-center h-10 border-grey-hi-fi text-sm border-l border-r border-b"}
                    >
                        <MapPin className='w-5 h-w-5' />
                        Your query returned no results
                    </div>
                </div>
            );
        }
    }

    return (
        <>
            <div className='absolute top-8 right-14 w-64 bg-offwhite-hi-fi'>
                {features.length > 0 && (features as Feature[]).map((feature: Feature, idx: number) => (
                    <div
                        className={"flex flex-row gap-x-2 px-1 justify-center items-center h-fit border border-grey-hi-fi text-sm text-wrap cursor-pointer " + (idx === 0 ? "border-l border-r border-b" : "border")}
                        key={feature.properties.full_address}
                    >
                        <MapPin className='w-5 h-w-5' />
                        <div className="w-full active:scale-95" onClick={() => setDestination(feature)}>
                            {feature.properties.full_address}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

}

export default DropDownOption