"use client";

import { useMap } from "@/contexts/MapProvider";
import mapboxgl from "mapbox-gl";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { BASE_URL } from "@/lib/constants";

interface Media {
    base64Content: string;
    mediaType: string;
    mediaUrl: string;
}
interface Report {
    id: string;
    latitude: number;
    longitude: number;
    media: Media[];
    description: string;
    duration: string;
    created_date: string;
    created_time: string;
    likes: number;
    dislikes: number;
    userLiked: boolean | null;
}

interface ReportId {
    id: string;
    lat: number;
    lng: number;
}

interface ReportsProps {
    reports: ReportId[];
}

const create_marker = (
    report: ReportId,
    setReport: React.Dispatch<React.SetStateAction<Report | null>>,
    setReportLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setUserLike: React.Dispatch<React.SetStateAction<boolean | null>>,
) => {
    const pin = document.createElement("img");
    pin.src = "/pin.png";
    pin.alt = "pin";
    pin.width = 33;
    pin.height = 44;

    pin.onclick = async () => {
        setReportLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${report.id}`, {
            method: "POST",
        });
        const data = await response.json();

        setReportLoading(false);
        setUserLike(data.report.userLiked);
        setReport({
            id: report.id,
            latitude: report.lat,
            longitude: report.lng,
            media: data.report.media,
            description: data.report.description,
            duration: data.report.duration,
            created_date: data.report.created_date,
            created_time: data.report.created_time,
            likes: data.report.likes,
            dislikes: data.report.dislikes,
            userLiked: data.report.userLiked,
        });
    };

    return new mapboxgl.Marker(pin).setLngLat([report.lng, report.lat]);
};

// TODO: likes/dislikes

const Reports = ({ reports }: ReportsProps) => {
    const { map, moveMap, disableInteraction, enableInteraction } = useMap();
    const { request } = useAuth();
    const [report, setReport] = useState<Report | null>(null);
    const [selectedImage, setSelectedImage] = useState<Media | null>(null);
    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

    const [reportLoading, setReportLoading] = useState(false);
    const [userLike, setUserLike] = useState<boolean | null>(null);

    useEffect(() => {
        reports.forEach((report) => {
            setMarkers((prev) => [
                ...prev,
                create_marker(report, setReport, setReportLoading, setUserLike),
            ]);
        });

        return () => {
            setMarkers([]);
        };
    }, [reports]);

    useEffect(() => {
        if (!map) return;

        markers.forEach((marker) => {
            marker.addTo(map);
        });

        return () => {
            markers.forEach((marker) => {
                marker.remove();
            });
        };
    }, [map, markers]);

    // useEffect(() => {
    //     if (!map) return;
    //     if (!report) enableInteraction();
    //     else {
    //         disableInteraction();
    //         moveMap({
    //             center: [report.longitude, report.latitude],
    //             zoom: 15,
    //             pitch: 0,
    //             duration: 1000,
    //         });
    //     }
    // }, [map, report, moveMap, enableInteraction, disableInteraction]);

    if (reportLoading) {
        return (
            <div className="bg-secondary-black text-primary-purple fixed top-0 z-20 flex h-full w-full items-center justify-center bg-opacity-40">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return report ? (
        <div
            className="fixed top-0 z-20 flex h-full w-full flex-col opacity-[0.98]"
            onClick={() => selectedImage && setSelectedImage(null)}
        >
            <div className="w-full flex-grow" onClick={() => setReport(null)} />
            <div className={`bottom-0 max-h-[90%] w-full overflow-scroll`}>
                <div
                    className={`flex w-full items-center justify-center bg-[#1f1926] bg-opacity-80 backdrop-blur-[35px] ${selectedImage ? "opacity-40" : ""}`}
                >
                    <div className="font-nunito text-secondary-white mx-[24px] mb-[40px] mt-[24px] flex w-[350px] flex-col items-center gap-[36px] rounded-[12px] bg-[#1f1926] p-[24px] font-light">
                        <div className="flex w-full justify-between">
                            <h1 className="font-nunito text-[20px] font-bold text-[#FF7A4B]">
                                Report information
                            </h1>
                            <Image
                                src="/pin.png"
                                alt="pin"
                                width={33}
                                height={44}
                                className="h-[44px] w-[33px]"
                            />
                        </div>
                        <div className="flex w-full flex-col items-start gap-[8px] text-[16px]">
                            <h2 className="w-full font-bold">Created on</h2>
                            <div className="flex gap-[8px]">
                                <h3 className="flex-grow">
                                    {"August 28, 2024"}
                                </h3>
                                <h3 className="flex-grow">{"13:32"}</h3>
                            </div>
                        </div>
                        <div className="flex w-full flex-col items-start gap-[8px] text-[16px]">
                            <div className="flex w-full justify-between">
                                <h2 className="font-bold">Report Duration</h2>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="21"
                                    height="21"
                                    viewBox="0 0 21 21"
                                    fill="none"
                                >
                                    <path
                                        d="M11.0833 10.9515L14.336 14.2042C14.4449 14.3099 14.4993 14.4418 14.4993 14.5997C14.4993 14.7576 14.4449 14.8937 14.336 15.008C14.2224 15.1363 14.084 15.1966 13.9207 15.1888C13.7573 15.1811 13.6185 15.1208 13.5042 15.008L10.199 11.7028C10.0979 11.6009 10.0256 11.4944 9.982 11.3832C9.93844 11.2719 9.91667 11.1564 9.91667 11.0367V6.32683C9.91667 6.16117 9.97267 6.02272 10.0847 5.9115C10.1967 5.80028 10.3355 5.74428 10.5012 5.7435C10.6668 5.74272 10.8053 5.79872 10.9165 5.9115C11.0277 6.02428 11.0833 6.16272 11.0833 6.32683V10.9515ZM10.5 3.5C10.3343 3.5 10.1955 3.444 10.0835 3.332C9.9715 3.22 9.91589 3.08156 9.91667 2.91667V1.16667H11.0833V2.91667C11.0833 3.08233 11.0273 3.22078 10.9153 3.332C10.8033 3.44322 10.6645 3.49922 10.4988 3.5M17.5 10.5C17.5 10.3343 17.556 10.1955 17.668 10.0835C17.78 9.9715 17.9184 9.91589 18.0833 9.91667H19.8333V11.0833H18.0833C17.9177 11.0833 17.7792 11.0273 17.668 10.9153C17.5568 10.8033 17.5008 10.6645 17.5 10.4988M10.5 17.5C10.6664 17.5 10.8053 17.556 10.9165 17.668C11.0277 17.78 11.0833 17.9184 11.0833 18.0833V19.8333H9.91667V18.0833C9.91667 17.9177 9.97267 17.7792 10.0847 17.668C10.1967 17.5568 10.3355 17.5008 10.5012 17.5M3.5 10.5C3.5 10.6664 3.444 10.8053 3.332 10.9165C3.22 11.0277 3.08156 11.0833 2.91667 11.0833H1.16667V9.91667H2.91667C3.08233 9.91667 3.22078 9.97267 3.332 10.0847C3.44322 10.1967 3.49922 10.3355 3.5 10.5012M10.5035 21C9.05217 21 7.68717 20.7247 6.4085 20.174C5.13061 19.6226 4.01878 18.8743 3.073 17.9293C2.12722 16.9843 1.37861 15.8737 0.827167 14.5973C0.275722 13.321 0 11.9564 0 10.5035C0 9.05061 0.275722 7.68561 0.827167 6.4085C1.37783 5.13061 2.12489 4.01878 3.06833 3.073C4.01178 2.12722 5.12283 1.37861 6.4015 0.827167C7.68017 0.275722 9.04517 0 10.4965 0C11.9478 0 13.3128 0.275722 14.5915 0.827167C15.8694 1.37783 16.9812 2.12528 17.927 3.0695C18.8728 4.01372 19.6214 5.12478 20.1728 6.40267C20.7243 7.68055 21 9.04517 21 10.4965C21 11.9478 20.7247 13.3128 20.174 14.5915C19.6233 15.8702 18.8751 16.982 17.9293 17.927C16.9836 18.872 15.8729 19.6206 14.5973 20.1728C13.3218 20.7251 11.9572 21.0008 10.5035 21ZM19.8333 10.5C19.8333 7.89444 18.9292 5.6875 17.1208 3.87917C15.3125 2.07083 13.1056 1.16667 10.5 1.16667C7.89444 1.16667 5.6875 2.07083 3.87917 3.87917C2.07083 5.6875 1.16667 7.89444 1.16667 10.5C1.16667 13.1056 2.07083 15.3125 3.87917 17.1208C5.6875 18.9292 7.89444 19.8333 10.5 19.8333C13.1056 19.8333 15.3125 18.9292 17.1208 17.1208C18.9292 15.3125 19.8333 13.1056 19.8333 10.5Z"
                                        fill="#9E88B2"
                                    />
                                </svg>
                            </div>
                            <h3>{report.duration}</h3>
                        </div>
                        <div className="flex w-full flex-col items-start gap-[8px] text-[16px]">
                            {report.description && (
                                <>
                                    <h2 className="font-bold">Description</h2>
                                    <h3 className="font-light">
                                        {report.description}
                                    </h3>
                                </>
                            )}
                        </div>
                        <div className="flex w-full flex-wrap justify-start gap-[20px]">
                            {report.media.map((media, index) => (
                                <div
                                    key={index}
                                    className="border-primary-green relative h-[69px] w-[69px] cursor-pointer overflow-hidden rounded-[8px] border"
                                    onClick={() => setSelectedImage(media)}
                                >
                                    <Image
                                        src={`data:${media.mediaType};base64,${media.base64Content}`}
                                        alt="media"
                                        fill
                                        style={{ objectFit: "cover" }}
                                        sizes="69px 69px"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex w-full flex-col justify-center gap-[16px]">
                            <h2 className="w-full text-center font-bold">
                                Is it still true?
                            </h2>
                            <div className="flex w-full justify-evenly px-[16px] py-[8px]">
                                <button
                                    className={`${userLike === false ? "border-primary-green" : "border-secondary-muted-purple"} flex items-center gap-[16px] rounded-[8px] border px-[8px] py-[4px]`}
                                    onClick={() => {
                                        if (userLike === false) {
                                            setUserLike(null);
                                            request(
                                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like_report`,
                                                {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        id: report.id,
                                                        liked: null,
                                                    }),
                                                },
                                            );
                                        } else {
                                            setUserLike(false);
                                            request(
                                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like_report`,
                                                {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        id: report.id,
                                                        liked: false,
                                                    }),
                                                },
                                            );
                                        }
                                    }}
                                >
                                    <p className="font-bold">
                                        {report.dislikes -
                                            (report.userLiked === false
                                                ? 1
                                                : 0) +
                                            (userLike === false ? 1 : 0)}
                                    </p>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="33"
                                        height="32"
                                        viewBox="0 0 33 32"
                                        fill="none"
                                    >
                                        <path
                                            d="M2.99625 11.125L12.0063 11.5075C12.2944 11.53 13.5 11.5837 13.5 13.125C13.5 14.6125 12.3025 14.7081 11.9913 14.7425L2.99625 15.125C2.20437 15.1169 1.5 14.2225 1.5 13.125C1.5 12.0275 2.20437 11.1331 2.99625 11.125ZM11.8369 19.3538L5.16563 19.875C4.375 19.875 3.5 18.8319 3.5 17.7575V17.7369C3.5 16.7163 4.19625 15.885 5.055 15.875L11.8331 15.9825C13.5 16.1875 13.5 17.1975 13.5 17.6325C13.5 19.0625 12.1375 19.3288 11.8369 19.3538ZM6.13438 2L11.72 2.55813C13.25 2.61625 13.5 3.63625 13.5 4.275C13.5 5.42438 12.6619 5.8125 11.8331 5.8125L6.14563 6C5.23625 5.98625 4.5 5.09438 4.5 4C4.5 2.90562 5.23 2.02125 6.13438 2ZM3.98688 6.46875L11.8869 6.8575C12.4738 6.89687 13.5 7.045 13.5 8.505C13.5 9.255 13.2281 10.1062 11.9375 10.2256L3.98688 10.4688C3.16563 10.4594 2.5 9.625 2.5 8.505C2.5 7.385 3.16563 6.47813 3.98688 6.46875Z"
                                            fill="#FFF6FF"
                                        />
                                        <path
                                            d="M23.791 17.4475L23.7285 17.5725C23.819 17.381 23.9669 17.2224 24.1516 17.1188C24.0069 17.1979 23.8832 17.3107 23.791 17.4475Z"
                                            fill="#FFF6FF"
                                        />
                                        <path
                                            d="M12.7458 28.7113C13.3352 29.5419 14.3121 30 15.4996 30C15.6853 30 15.8674 29.9482 16.0253 29.8505C16.1833 29.7528 16.3109 29.613 16.3939 29.4469C16.5814 29.0681 17.3471 27.9469 18.1558 26.7656C19.2808 25.12 20.6777 23.0731 21.6077 21.465L21.6158 21.4513C22.8958 19.2331 23.5127 18.0175 23.7296 17.5763L23.7921 17.4513C23.8848 17.3149 24.0089 17.2028 24.1539 17.1244C24.2981 17.0445 24.4598 17.0018 24.6246 17H26.2071C27.6108 16.9997 28.957 16.4418 29.9495 15.4491C30.942 14.4563 31.4996 13.11 31.4996 11.7063V9.29375C31.4996 7.88987 30.9419 6.54348 29.9493 5.55072C28.9566 4.55797 27.6103 4.00017 26.2064 4H23.1571C22.9441 3.9995 22.736 3.93671 22.5583 3.81938C21.1246 2.88313 18.4158 2 15.4996 2C15.0339 2 14.6127 2.00875 14.2327 2.02375C14.1422 2.02697 14.0542 2.05473 13.9782 2.10406C13.9022 2.15338 13.8411 2.22242 13.8013 2.3038C13.7615 2.38518 13.7446 2.47585 13.7523 2.5661C13.76 2.65636 13.7921 2.74282 13.8452 2.81625L13.8514 2.825C14.3871 3.59938 14.4996 4.4375 14.4996 5C14.5005 5.53301 14.39 6.06032 14.1752 6.54812C14.114 6.68652 14.0824 6.83617 14.0824 6.9875C14.0824 7.13883 14.114 7.28848 14.1752 7.42688C14.389 7.92432 14.4993 8.46011 14.4993 9.00156C14.4993 9.54302 14.389 10.0788 14.1752 10.5763C14.1143 10.7141 14.0828 10.8631 14.0828 11.0138C14.0828 11.1644 14.1143 11.3134 14.1752 11.4513C14.3879 11.9401 14.4977 12.4675 14.4977 13.0006C14.4977 13.5337 14.3879 14.0612 14.1752 14.55C14.1112 14.6945 14.0782 14.8507 14.0782 15.0087C14.0782 15.1668 14.1112 15.323 14.1752 15.4675C14.398 15.9693 14.5087 16.5136 14.4996 17.0625C14.4996 17.575 14.3746 18.3937 13.9996 19.0112C13.9238 19.1388 13.8781 19.2818 13.8657 19.4296C13.8534 19.5774 13.8748 19.7261 13.9283 19.8644C13.9521 19.9269 13.9758 19.9931 13.9989 20.0625C14.0738 20.2959 14.0922 20.5437 14.0527 20.7856C13.8652 21.995 13.4483 23.0544 13.0064 24.1706C12.8139 24.6569 12.6146 25.1594 12.4302 25.6875C12.0464 26.785 12.1614 27.8875 12.7458 28.7113Z"
                                            fill="#FFF6FF"
                                        />
                                    </svg>
                                </button>
                                <button
                                    className={`flex items-center gap-[16px] rounded-[8px] border px-[8px] py-[4px] ${userLike === true ? "border-primary-green" : "border-secondary-muted-purple"}`}
                                    onClick={() => {
                                        if (userLike === true) {
                                            setUserLike(null);
                                            request(
                                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like_report`,
                                                {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        id: report.id,
                                                        liked: null,
                                                    }),
                                                },
                                            );
                                        } else {
                                            setUserLike(true);
                                            request(
                                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/like_report`,
                                                {
                                                    method: "POST",
                                                    body: JSON.stringify({
                                                        id: report.id,
                                                        liked: true,
                                                    }),
                                                },
                                            );
                                        }
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="33"
                                        height="32"
                                        viewBox="0 0 33 32"
                                        fill="none"
                                    >
                                        <path
                                            d="M30.0038 20.875L20.9938 20.4925C20.7056 20.47 19.5 20.4162 19.5 18.875C19.5 17.3875 20.6975 17.2919 21.0088 17.2575L30.0038 16.875C30.7956 16.8831 31.5 17.7775 31.5 18.875C31.5 19.9725 30.7956 20.8669 30.0038 20.875ZM21.1631 12.6462L27.8344 12.125C28.625 12.125 29.5 13.1681 29.5 14.2425L29.5 14.2631C29.5 15.2837 28.8038 16.115 27.945 16.125L21.1669 16.0175C19.5 15.8125 19.5 14.8025 19.5 14.3675C19.5 12.9375 20.8625 12.6712 21.1631 12.6462ZM26.8656 30L21.28 29.4419C19.75 29.3837 19.5 28.3637 19.5 27.725C19.5 26.5756 20.3381 26.1875 21.1669 26.1875L26.8544 26C27.7638 26.0137 28.5 26.9056 28.5 28C28.5 29.0944 27.77 29.9787 26.8656 30ZM29.0131 25.5312L21.1131 25.1425C20.5263 25.1031 19.5 24.955 19.5 23.495C19.5 22.745 19.7719 21.8937 21.0625 21.7744L29.0131 21.5312C29.8344 21.5406 30.5 22.375 30.5 23.495C30.5 24.615 29.8344 25.5219 29.0131 25.5312Z"
                                            fill="#FFF6FF"
                                        />
                                        <path
                                            d="M9.20898 14.5525L9.27148 14.4275C9.18105 14.619 9.03315 14.7776 8.84836 14.8812C8.99314 14.8021 9.11681 14.6893 9.20898 14.5525Z"
                                            fill="#FFF6FF"
                                        />
                                        <path
                                            d="M20.2542 3.28875C19.6648 2.45812 18.6879 2 17.5004 2C17.3147 2.00004 17.1326 2.05181 16.9747 2.14951C16.8167 2.2472 16.6891 2.38696 16.6061 2.55313C16.4186 2.93187 15.6529 4.05312 14.8442 5.23437C13.7192 6.88 12.3223 8.92687 11.3923 10.535L11.3842 10.5487C10.1042 12.7669 9.48732 13.9825 9.27044 14.4237L9.20794 14.5487C9.11519 14.6851 8.99109 14.7972 8.84607 14.8756C8.70193 14.9555 8.5402 14.9982 8.37544 15L6.79294 15C5.38917 15.0003 4.04301 15.5582 3.05051 16.5509C2.05801 17.5437 1.50044 18.89 1.50044 20.2937L1.50044 22.7062C1.50044 24.1101 2.05809 25.4565 3.05073 26.4493C4.04336 27.442 5.38969 27.9998 6.79357 28L9.84294 28C10.0559 28.0005 10.264 28.0633 10.4417 28.1806C11.8754 29.1169 14.5842 30 17.5004 30C17.9661 30 18.3873 29.9912 18.7673 29.9762C18.8578 29.973 18.9458 29.9453 19.0218 29.8959C19.0978 29.8466 19.1589 29.7776 19.1987 29.6962C19.2385 29.6148 19.2554 29.5242 19.2477 29.4339C19.24 29.3436 19.2079 29.2572 19.1548 29.1837L19.1486 29.175C18.6129 28.4006 18.5004 27.5625 18.5004 27C18.4995 26.467 18.61 25.9397 18.8248 25.4519C18.886 25.3135 18.9176 25.1638 18.9176 25.0125C18.9176 24.8612 18.886 24.7115 18.8248 24.5731C18.611 24.0757 18.5007 23.5399 18.5007 22.9984C18.5007 22.457 18.611 21.9212 18.8248 21.4237C18.8857 21.2859 18.9172 21.1369 18.9172 20.9862C18.9172 20.8356 18.8857 20.6866 18.8248 20.5487C18.6121 20.0599 18.5023 19.5325 18.5023 18.9994C18.5023 18.4663 18.6121 17.9388 18.8248 17.45C18.8888 17.3055 18.9218 17.1493 18.9218 16.9912C18.9218 16.8332 18.8888 16.677 18.8248 16.5325C18.602 16.0307 18.4913 15.4864 18.5004 14.9375C18.5004 14.425 18.6254 13.6063 19.0004 12.9888C19.0762 12.8612 19.1219 12.7182 19.1343 12.5704C19.1466 12.4226 19.1252 12.2739 19.0717 12.1356C19.0479 12.0731 19.0242 12.0069 19.0011 11.9375C18.9262 11.7041 18.9078 11.4563 18.9473 11.2144C19.1348 10.005 19.5517 8.94563 19.9936 7.82937C20.1861 7.34312 20.3854 6.84063 20.5698 6.3125C20.9536 5.215 20.8386 4.1125 20.2542 3.28875Z"
                                            fill="#FFF6FF"
                                        />
                                    </svg>
                                    <p className="font-bold">
                                        {report.likes -
                                            (report.userLiked === true
                                                ? 1
                                                : 0) +
                                            (userLike === true ? 1 : 0)}
                                    </p>
                                </button>
                            </div>
                        </div>
                        <button
                            className={`border-secondary-white flex gap-[8px] rounded-[16px] border px-[8px]`}
                            onClick={() => {
                                setReport(null);
                            }}
                        >
                            <p className="text-[14px] font-extralight">Close</p>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="24"
                                viewBox="0 0 25 24"
                                fill="none"
                            >
                                <path
                                    d="M7.5 7L17.5 17M7.5 17L17.5 7"
                                    stroke="#FFF6FF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                {selectedImage && (
                    <div
                        className={`absolute left-0 top-0 flex h-full w-full items-center justify-center`}
                    >
                        <div className="relative h-[90%] w-[90%]">
                            <Image
                                src={`data:${selectedImage.mediaType};base64,${selectedImage.base64Content}`}
                                alt="media"
                                fill
                                style={{
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    ) : null;
};

export default Reports;
