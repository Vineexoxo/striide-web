"use client";

import { FC, FormEvent, useEffect, useReducer, useState } from "react";
import { Button } from "@/components/Button";
import {
    Navigation,
    MapPin,
    ChevronDown,
    ChevronLeft,
    Loader2,
} from "lucide-react";
import Map from "@/components/Map";
import { MediaType, ReportFormDataType } from "@/lib/types";
import { BASE_URL } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import MapProvider from "@/contexts/MapProvider";
import Geolocator from "../Geolocator";

interface ReportFormProps {
    address?: string;
    coordinates?: number[];
    duration?: string;
    description?: string;
    media?: MediaType[];
    isDraft?: boolean;
    reportID?: string;
}

const MapOptions = {
    latitude: 42.362,
    longitude: -71.057,
    zoom: 10,
};

const reducer = (state: ReportFormDataType, action: any) => {
    switch (action.type) {
        case "SET_COORDINATES":
            return { ...state, coordinates: action.payload };
        case "SET_DURATION":
            return { ...state, duration: action.payload };
        case "SET_DESCRIPTION":
            return { ...state, description: action.payload };
        case "SET_ADDRESS":
            return { ...state, address: action.payload };
        case "ADD_MEDIA":
            return { ...state, media: action.payload };
        case "INDICATE_ACTION":
            return { ...state, buttonType: action.payload };
        case "REMOVE_MEDIA":
            return { ...state, media: action.payload };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

const ImageModal = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="relative max-w-[90%] max-h-[90%]">
            <Image src={src} alt={alt} layout="responsive" objectFit="contain" width={800} height={600} />
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    </div>
);

const ReportForm: FC<ReportFormProps> = ({
    address,
    coordinates,
    description,
    duration,
    media,
    isDraft,
    reportID,
}) => {
    const { request } = useAuth();
    const router = useRouter();
    const [expandedImage, setExpandedImage] = useState<any>(null);

    const initialFormState: ReportFormDataType = {
        address: address ?? "",
        coordinates: coordinates ?? [],
        duration: duration ?? "",
        description: description ?? "",
        media: media ?? [],
        buttonType: "",
    };

    const [formData, dispatch] = useReducer(reducer, initialFormState);

    useEffect(() => {
        dispatch({ type: "SET_COORDINATES", payload: coordinates ?? [] });
        dispatch({ type: "SET_ADDRESS", payload: address ?? "" });
        dispatch({ type: "SET_DURATION", payload: duration ?? "" });
        dispatch({ type: "SET_DESCRIPTION", payload: description ?? "" });
        dispatch({ type: "ADD_MEDIA", payload: media ?? [] });
    }, [coordinates, duration, description, media, address]);

    const [userLocation, setUserLocation] = useState("");
    const [openDropDown, setOpenDropDown] = useState(false);
    const [timeDuration, setTimeDuration] = useState("");
    const [openMap, setOpenMap] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mapCoords, setMapCoords] = useState<number[]>([]);

    const [submissionLoading, setSubmissionLoading] = useState(false);

    const [error, setError] = useState("");
    const [time, setTime] = useState(4);

    useEffect(() => {
        if (!time) {
            return;
        }

        const intervalId = setInterval(() => {
            setTime(time - 1);
        }, 5000);

        return () => {
            clearInterval(intervalId);
            setError("");
        };
    }, [time]);

    const durationValues = [
        {
            value: "Short",
            text: "less than a day",
        },
        {
            value: "Medium",
            text: "more than a day less than a week",
        },
        {
            value: "Long",
            text: "more than a week",
        },
    ];

    const handleGetUserCoords = () => {
        setIsLoading(!isLoading);
        const userCoords: number[] = [];
        navigator.geolocation.getCurrentPosition(
            function (location) {
                userCoords.push(location.coords.longitude);
                userCoords.push(location.coords.latitude);

                fetch(
                    `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${userCoords[0]}&latitude=${userCoords[1]}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
                    {
                        method: "GET",
                    },
                )
                    .then((response) => response.json())
                    .then((data) => {
                        dispatch({
                            type: "SET_COORDINATES",
                            payload: userCoords,
                        });
                        dispatch({
                            type: "SET_ADDRESS",
                            payload: data.features[0].properties.name,
                        });
                        setUserLocation(data.features[0].properties.name);
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        throw new Error(err);
                    });
            },
            (error) => {
                setIsLoading(!isLoading);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        console.log("here");
                        setError("Please enable location for this service.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        setError("The request to get user location timed out.");
                        break;
                    default:
                        setError(
                            "An unknown error occurred. While trying to get user location",
                        );
                        break;
                }
            },
        );
    };

    const validateInput = () => {
        return (
            formData.coordinates.length !== 0 &&
            formData.description.length !== 0 &&
            formData.duration.length !== 0 &&
            formData.address !== 0
        );
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateInput()) {
            setError("Required fields are missing");
            return;
        }

        if (!formData.buttonType) {
            setError("Please indicate an action by pressing a button");
            return;
        }
        setSubmissionLoading(true);

        console.log(formData.buttonType);

        if (formData.buttonType === "discard") {
            const response = await request(`http://localhost:3001/api/discard_draft`, {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reportID: reportID,
                }),
            });

            if (response.status !== 200) {
                setError("Something went wrong, please try again later");
            }

            setSubmissionLoading(false);
            if (response.status === 200) {
                router.push('/map?draft_discarded=true');
            }
            return;
        }

        if (formData.buttonType === "submit" && isDraft) {
            const response = await request(`http://localhost:3001/api/publish_draft`, {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reportID: reportID,
                }),
            });

            if (response.status !== 200) {
                setError("Something went wrong, please try again later");
            }

            setSubmissionLoading(false);
            router.push("/map?marked=true");
            return;
        }

        const response = await request(`http://localhost:3001/api/upload_report`, {
            method: "POST",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                address: formData.address,
                location: formData.coordinates.join(', '),
                description: formData.description,
                duration: formData.duration,
                is_published: true,
            }),
        });

        if (response.status !== 200) {
            setError("Something went wrong, please try again later");
            return;
        }

        setSubmissionLoading(false);
        router.push("/map?marked=true");
    };

    useEffect(() => {
        if (!mapCoords) {
            return;
        }
        if (mapCoords.length === 0) {
            return;
        }

        if (mapCoords.length !== 2) {
            setError(
                "Something went wrong getting the map coordinates - please try again later",
            );
            return;
        }

        fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${mapCoords[0]}&latitude=${mapCoords[1]}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
            {
                method: "GET",
            },
        )
            .then((response) => response.json())
            .then((data) => {
                dispatch({ type: "SET_COORDINATES", payload: mapCoords });
                dispatch({
                    type: "SET_ADDRESS",
                    payload: data.features[0].properties.name,
                });
                setUserLocation(data.features[0].properties.name);
                setOpenMap(false);
            })
            .catch((err) => {
                throw new Error(err);
            });
    }, [mapCoords]);

    const [geolocatorCoords, setGeolocatorCoords] = useState<number[]>([]);


    return (
        <div className="font-mulish relative flex min-h-screen items-center justify-center bg-[#FFF6FF] overflow-y-auto">
            <div className="relative z-0 w-full max-w-[393px] py-8">
                <div className="relative flex h-full w-[393px] flex-col items-center justify-center">
                    <div className="text-primary-purple mb-5 flex w-[301px] items-center justify-center">
                        <ChevronLeft
                            size={22}
                            className="absolute left-2 top-1 hover:cursor-pointer"
                            onClick={() => {
                                router.push("/map");
                            }}
                        />
                        <h1 className="font-montserrat text-[20px] font-bold">
                            Map Reporting
                        </h1>
                    </div>
                    <div className="relative w-full bg-[#9E88B2] py-2 mb-16 -mt-2">
                        <span className="block text-sm text-white text-center">
                            Anything concerning? Report below!
                        </span>
                    </div>
                    <form
                        className="relative flex flex-col gap-y-5"
                        onSubmit={handleSubmit}
                    >
                        <input
                            readOnly
                            type="text"
                            value={formData.address}
                            className="h-10 w-full appearance-none rounded-md border border-[#9e88b24d] bg-[#FFF6FF] pl-4 text-sm focus:border-2 focus:outline-none focus:outline-0 active:border-2"
                            placeholder="Location"
                        />

                        <div className="flex w-full flex-col items-center justify-center">
                            <Button
                                type="button"
                                variant={"transparent"}
                                className="font-mulish font-[14px] flex w-full justify-start gap-x-2 rounded-none border-b border-b-[#9e88b24d] px-1 text-sm text-[#1F1926] active:scale-95"
                                onClick={handleGetUserCoords}
                                isLoading={isLoading}
                            >
                                <Navigation className="text-[#00A886]" fill="#00A886" />
                                Select my current location
                            </Button>
                            <Button
                                type="button"
                                variant={"transparent"}
                                className="font-mulish font-[14px] flex w-full justify-start gap-x-2 px-1 text-sm text-[#1F1926] active:scale-95"
                                onClick={() => setOpenMap(!openMap)}
                            >
                                <MapPin className="text-[#00A886]" />
                                Pick on map
                            </Button>

                            {formData.coordinates.length > 0 && (
                                <Button
                                    type="button"
                                    className="mt-4 bg-[#E2D5E8] text-[#6B18D8] font-mulish text-sm px-4 py-2 rounded-lg w-[138px] h-[36px] active:scale-95"
                                    onClick={() => {
                                        // Reset location data
                                        dispatch({ type: "SET_COORDINATES", payload: [] });
                                        dispatch({ type: "SET_ADDRESS", payload: "" });
                                    }}
                                >
                                    Change location
                                </Button>
                            )}
                        </div>
                        <div
                            className="relative h-fit w-full"
                            onClick={() => setOpenDropDown(!openDropDown)}
                        >
                            <input
                                readOnly
                                value={formData.duration}
                                type="text"
                                placeholder="Report Duration"
                                className="h-10 w-full appearance-none overflow-x-hidden rounded-md border border-[#9e88b24d] bg-[#FFF6FF] pl-4 pr-12 text-sm focus:border-2 focus:outline-none focus:outline-0 active:border-2"
                            />
                            <ChevronDown
                                className={`absolute right-3 top-[9px] transform text-[#6B18D8] transition-transform duration-300 ${openDropDown ? "rotate-180" : "rotate-0"}`}
                            />
                            {openDropDown && (
                                <div className="absolute left-1/2 top-1/2 mx-auto flex w-[300px] -translate-x-1/2 translate-y-5 flex-col items-center justify-center bg-[#9e88b21f] backdrop-blur-md">
                                    {durationValues.map((duration) => (
                                        <Button
                                            variant={"transparent"}
                                            key={duration.value}
                                            className="w-full justify-start rounded-none border border-[#9e88b24d] pl-4 text-xs text-white active:scale-95"
                                            onClick={() => {
                                                const formatted_string =
                                                    duration.value +
                                                    " ~ " +
                                                    duration.text;
                                                setTimeDuration(
                                                    formatted_string,
                                                );
                                                dispatch({
                                                    type: "SET_DURATION",
                                                    payload: formatted_string,
                                                });
                                            }}
                                        >
                                            <span className="text-[#1F1926]">
                                                {duration.value}
                                            </span>
                                            <span className="text-[#9E88B2]">
                                                &nbsp;~&nbsp;
                                            </span>
                                            <span className="text-[#FF6630]">
                                                {duration.text}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <textarea
                            className="h-[184px] appearance-none rounded-md border border-[#9e88b24d] bg-[#FFF6FF] px-4 pt-2 text-sm placeholder:flex placeholder:items-start placeholder:justify-start focus:border-2 focus:outline-none focus:outline-0 active:border-2"
                            placeholder="Share more about what you witnessed."
                            value={formData.description}
                            onChange={(e) => {
                                dispatch({
                                    type: "SET_DESCRIPTION",
                                    payload: e.target.value,
                                });
                            }}
                        />
                        <div className="mb-10 flex items-center gap-[20px]">
                            {formData.media.map(
                                (media: MediaType, index: number) => (
                                    <div
                                        key={index}
                                        className="relative flex items-center justify-center"
                                    >
                                        <Image
                                            src={media.url}
                                            alt={media.name}
                                            width={69}
                                            height={69}
                                            className="border-primary-green rounded-[8px] border-[2px]"
                                            onClick={() => setExpandedImage(media)}
                                        />
                                        <button
                                            className="absolute -right-[10px] -top-[10px] flex h-[24px] w-[24px] items-center justify-center stroke-[#9E88B2] hover:stroke-[#C30000]"
                                            onClick={() => {
                                                dispatch({
                                                    type: "REMOVE_MEDIA",
                                                    payload:
                                                        formData.media.filter(
                                                            (m: MediaType) =>
                                                                m != media,
                                                        ),
                                                });
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="25"
                                                height="25"
                                                viewBox="0 0 25 25"
                                                fill="none"
                                            >
                                                <rect
                                                    x="0.273438"
                                                    y="0.447266"
                                                    width="23.5"
                                                    height="23.5"
                                                    rx="7.75"
                                                    strokeWidth="0.5"
                                                />
                                                <path
                                                    d="M7.02344 7.19727L17.0234 17.1973M7.02344 17.1973L17.0234 7.19727"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                ),
                            )}
                            <label
                                htmlFor="media"
                                className="border-secondary-muted-purple hover:border-primary-purple flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border hover:cursor-pointer hover:border-[2px]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="15"
                                    viewBox="0 0 14 15"
                                    fill="none"
                                >
                                    <path
                                        d="M13 8.19727H8V13.1973C8 13.7473 7.55 14.1973 7 14.1973C6.45 14.1973 6 13.7473 6 13.1973V8.19727H1C0.45 8.19727 0 7.74727 0 7.19727C0 6.64727 0.45 6.19727 1 6.19727H6V1.19727C6 0.647266 6.45 0.197266 7 0.197266C7.55 0.197266 8 0.647266 8 1.19727V6.19727H13C13.55 6.19727 14 6.64727 14 7.19727C14 7.74727 13.55 8.19727 13 8.19727Z"
                                        fill="#FF7A4B"
                                    />
                                </svg>
                            </label>
                            <input
                                id="media"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const reader = new FileReader();
                                        const name = e.target.files[0].name;
                                        const media_type =
                                            e.target.files[0].type;
                                        const url = URL.createObjectURL(
                                            e.target.files[0],
                                        );
                                        reader.onloadend = () => {
                                            if (
                                                reader.result &&
                                                typeof reader.result ===
                                                "string"
                                            ) {
                                                dispatch({
                                                    type: "ADD_MEDIA",
                                                    payload: [
                                                        ...formData.media,
                                                        {
                                                            name,
                                                            media_type,
                                                            base64: reader.result
                                                                .replace(
                                                                    "data:",
                                                                    "",
                                                                )
                                                                .replace(
                                                                    /^.+,/,
                                                                    "",
                                                                ),
                                                            url,
                                                        },
                                                    ],
                                                });
                                            }
                                        };
                                        reader.readAsDataURL(e.target.files[0]);

                                        e.target.value = "";
                                    }
                                }}
                            />
                            {formData.media.length == 0 && (
                                <div className="flex justify-between items-center w-full">
                                    <h3 className="font-mulish text-secondary-muted-purple text-[14px]">
                                        Add media
                                    </h3>
                                    <span className="font-mulish text-secondary-muted-purple text-[14px]">
                                        (optional)
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className="flex items-center justify-center text-sm">
                            {" "}
                            Thank you for helping your local&nbsp;
                            <span className="text-primary-green">
                                Striiders!
                            </span>
                        </span>
                        <div className="flex w-full items-center justify-between gap-x-2">
                            <Button
                                type="submit"
                                onClick={() => {
                                    dispatch({
                                        type: "INDICATE_ACTION",
                                        payload: isDraft ? "discard" : "draft",
                                    });
                                }}
                                className="text-md h-[48px] w-[152px] border border-[#9E88B2] bg-[#FFF6FF] px-2 py-4 text-[#9E88B2] active:scale-95"
                                disabled={submissionLoading}
                            >
                                {isDraft ? "Discard" : "Save as draft"}
                            </Button>
                            <Button
                                type="submit"
                                onClick={() => {
                                    dispatch({
                                        type: "INDICATE_ACTION",
                                        payload: "submit",
                                    });
                                }}
                                className="text-md h-[48px] w-[152px] px-2 py-4 active:scale-95"
                                disabled={submissionLoading}
                            >
                                Submit report
                            </Button>
                        </div>
                    </form>
                </div>

                {submissionLoading && (
                    <div>
                        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm">
                            <Loader2 className="h-8 w-8 animate-spin"></Loader2>
                        </div>
                    </div>
                )}

                {openMap && (
                    <div className="fixed inset-0 z-20 flex flex-col">
                        <MapProvider>
                            <div className="absolute top-4 left-4 z-50 text-white text-2xl font-bold">
                                Striide
                            </div>
                            <div className="absolute w-[100vw] top-16 z-50 bg-[#9E88B2] py-2 text-center text-white">
                                Choose Location - Zoom in and tap to drop a pin
                            </div>
                            <Map
                                options={MapOptions}
                                queryPath={[]}
                                className="h-full w-full"
                                setUserCoords={setMapCoords}
                                chooseLocation={true}
                            />
                            <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center items-center">
                                <Button
                                    onClick={() => setOpenMap(false)}
                                    className="border border-white border-opacity-50 bg-[#6B18D8] text-white w-[98px] h-[35px] rounded-[16px] text-sm active:scale-95"                                >
                                    Cancel
                                </Button>
                                <Geolocator
                                    className="bg-white p-2 rounded-full absolute right-4"
                                    geolocatorCoords={geolocatorCoords}
                                    setGeolocatorCoords={setGeolocatorCoords}
                                    queryPath={[]}
                                />
                            </div>
                        </MapProvider>
                    </div>
                )}
            </div>
            {error.length !== 0 && time !== 0 && (
                <div
                    className={`absolute right-5 top-5 h-fit w-64 animate-bounce rounded-md bg-red-500 p-2 text-white`}
                >
                    {error}
                </div>
            )}

            {expandedImage && (
                <ImageModal
                    src={expandedImage.url}
                    alt={expandedImage.name}
                    onClose={() => setExpandedImage(null)}
                />
            )}
        </div>
    );
};

export default ReportForm;
