"use client";

import { FC, SetStateAction, Dispatch, useEffect, useState } from "react";
import SearchInput from "@/components/navbar/SearchInput";
import SettingsButton from "@/components/navbar/SettingsButton";
import NotificationsButton from "@/components/navbar/NotificationsButton";
import SOSButton from "@/components/navbar/SOSButton";
import DropDownOption from "@/components/navbar/DropDownOption";
import { Feature, PathQuery } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";

interface NavbarProps {
    setQueryPath?: Dispatch<SetStateAction<string | undefined>>;
    userCoords: any;
    className?: string;
}

const Navbar: FC<NavbarProps> = ({ setQueryPath, userCoords, className }) => {
    const [searchValue, setSearchValue] = useState<string>();
    const [features, setFeatures] = useState<Feature[] | string[]>([]);
    const [destination, setDestination] = useState<Feature>();

    const debounce_time_factor = 500;
    useEffect(() => {
        const timeOut = setTimeout(() => {
            if (!searchValue) {
                setFeatures([]);
                return;
            }

            const params = new URLSearchParams({
                q: searchValue!,
                access_token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
            });

            const url = `https://api.mapbox.com/search/geocode/v6/forward?${params.toString()}`;
            fetch(url, {
                headers: {
                    method: "GET",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    let features: Feature[] | string[] =
                        data?.features.map((feature: Feature) => {
                            return {
                                geometry: {
                                    coordinates:
                                        feature.geometry.coordinates ?? [],
                                },
                                properties: {
                                    full_address:
                                        feature.properties.full_address ?? "",
                                },
                            };
                        }) ?? [];

                    if (features.length === 0) {
                        features = ["NO SEARCH VALUES RETURNED"];
                    }

                    setFeatures(features);
                })
                .catch((err) => console.log(err));
        }, debounce_time_factor);
        return () => clearTimeout(timeOut);
    }, [searchValue]);

    useEffect(() => {
        if (!destination) {
            return;
        }

        // const source_coords = [userCoords.longitude, userCoords.latitude];
        const source_coords = [-71.0521206843562, 42.36368463654058];

        if (source_coords.length !== 2) {
            throw new Error("INVALID COORDINATES GIVEN FOR DESTINATION");
        }

        let destination_coords = destination.geometry.coordinates;
        // const destination_coords = [-71.05638522273712, 42.36809379745236];

        if (destination_coords.length !== 2) {
            throw new Error("INVALID COORDINATES GIVEN FOR DESTINATION");
        }

        fetch(`${BASE_URL}/api/query_route`, {
            method: "POST",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                origin: source_coords,
                destination: destination_coords,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data) {
                    throw new Error("BACKEND DID NOT RETURN ANYTHING");
                }
                if (data.status !== 200) {
                    throw new Error(
                        "BACKEND RETURNED A STATUS THAT WAS NOT 200",
                    );
                }
                // console.log(data);
                setQueryPath!(JSON.parse(data.path));
            })
            .catch((err) => {
                throw new Error("SOMETHING WENT WRONG - QUERYING BACKEND", err);
            });
    }, [destination, setQueryPath]); // Added setQueryPath as a dependency

    return (
        <div className={cn("relative flex flex-col gap-y-2", className)}>
            <div className="flex flex-row items-center justify-center gap-x-2">
                <SettingsButton />
                <SearchInput setValue={setSearchValue!} />
                <NotificationsButton />
            </div>
            <DropDownOption
                features={features}
                setDestination={setDestination}
            />
            <div className="flex items-end justify-end">
                <SOSButton />
            </div>
        </div>
    );
};

export default Navbar;
