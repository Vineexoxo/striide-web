"use client";

import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "../Button";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthProvider";
import { BASE_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { MediaType, FeedbackFormDataType } from "@/lib/types";

const Icons = [
    {
        name: "Bug report",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M10.5 1.59863C10.5 1.39972 10.421 1.20895 10.2803 1.0683C10.1397 0.927647 9.94891 0.848629 9.75 0.848629C9.55109 0.848629 9.36032 0.927647 9.21967 1.0683C9.07902 1.20895 9 1.39972 9 1.59863V2.34863C9 2.94413 9.174 3.49913 9.4725 3.96563C8.48416 4.19742 7.60323 4.75659 6.97282 5.55229C6.34242 6.34799 5.99958 7.33347 6 8.34863H5.25C4.65326 8.34863 4.08097 8.11158 3.65901 7.68962C3.23705 7.26766 3 6.69537 3 6.09863V3.09863C3 2.89972 2.92098 2.70895 2.78033 2.5683C2.63968 2.42765 2.44891 2.34863 2.25 2.34863C2.05109 2.34863 1.86032 2.42765 1.71967 2.5683C1.57902 2.70895 1.5 2.89972 1.5 3.09863V6.09863C1.5 7.09319 1.89509 8.04702 2.59835 8.75028C3.30161 9.45354 4.25544 9.84863 5.25 9.84863H6V12.0986H0.75C0.551088 12.0986 0.360322 12.1776 0.21967 12.3183C0.0790178 12.459 0 12.6497 0 12.8486C0 13.0475 0.0790178 13.2383 0.21967 13.379C0.360322 13.5196 0.551088 13.5986 0.75 13.5986H6V15.8486H5.25C4.25544 15.8486 3.30161 16.2437 2.59835 16.947C1.89509 17.6502 1.5 18.6041 1.5 19.5986V22.5986C1.5 22.7975 1.57902 22.9883 1.71967 23.129C1.86032 23.2696 2.05109 23.3486 2.25 23.3486C2.44891 23.3486 2.63968 23.2696 2.78033 23.129C2.92098 22.9883 3 22.7975 3 22.5986V19.5986C3 19.0019 3.23705 18.4296 3.65901 18.0076C4.08097 17.5857 4.65326 17.3486 5.25 17.3486H6C6 18.9399 6.63214 20.4661 7.75736 21.5913C8.88258 22.7165 10.4087 23.3486 12 23.3486C13.5913 23.3486 15.1174 22.7165 16.2426 21.5913C17.3679 20.4661 18 18.9399 18 17.3486H18.75C19.3467 17.3486 19.919 17.5857 20.341 18.0076C20.7629 18.4296 21 19.0019 21 19.5986V22.5986C21 22.7975 21.079 22.9883 21.2197 23.129C21.3603 23.2696 21.5511 23.3486 21.75 23.3486C21.9489 23.3486 22.1397 23.2696 22.2803 23.129C22.421 22.9883 22.5 22.7975 22.5 22.5986V19.5986C22.5 18.6041 22.1049 17.6502 21.4016 16.947C20.6984 16.2437 19.7446 15.8486 18.75 15.8486H18V13.5986H23.25C23.4489 13.5986 23.6397 13.5196 23.7803 13.379C23.921 13.2383 24 13.0475 24 12.8486C24 12.6497 23.921 12.459 23.7803 12.3183C23.6397 12.1776 23.4489 12.0986 23.25 12.0986H18V9.84863H18.75C19.7446 9.84863 20.6984 9.45354 21.4016 8.75028C22.1049 8.04702 22.5 7.09319 22.5 6.09863V3.09863C22.5 2.89972 22.421 2.70895 22.2803 2.5683C22.1397 2.42765 21.9489 2.34863 21.75 2.34863C21.5511 2.34863 21.3603 2.42765 21.2197 2.5683C21.079 2.70895 21 2.89972 21 3.09863V6.09863C21 6.69537 20.7629 7.26766 20.341 7.68962C19.919 8.11158 19.3467 8.34863 18.75 8.34863H18C18.0004 7.33347 17.6576 6.34799 17.0272 5.55229C16.3968 4.75659 15.5158 4.19742 14.5275 3.96563C14.8275 3.50063 15 2.94563 15 2.34863V1.59863C15 1.39972 14.921 1.20895 14.7803 1.0683C14.6397 0.927647 14.4489 0.848629 14.25 0.848629C14.0511 0.848629 13.8603 0.927647 13.7197 1.0683C13.579 1.20895 13.5 1.39972 13.5 1.59863V2.34863C13.5 2.74645 13.342 3.12798 13.0607 3.40929C12.7794 3.69059 12.3978 3.84863 12 3.84863C11.6022 3.84863 11.2206 3.69059 10.9393 3.40929C10.658 3.12798 10.5 2.74645 10.5 2.34863V1.59863ZM16.5 8.34863V17.3486C16.5 18.5421 16.0259 19.6867 15.182 20.5306C14.3381 21.3745 13.1935 21.8486 12 21.8486C10.8065 21.8486 9.66193 21.3745 8.81802 20.5306C7.97411 19.6867 7.5 18.5421 7.5 17.3486V8.34863C7.5 7.55298 7.81607 6.78992 8.37868 6.22731C8.94129 5.6647 9.70435 5.34863 10.5 5.34863H13.5C14.2956 5.34863 15.0587 5.6647 15.6213 6.22731C16.1839 6.78992 16.5 7.55298 16.5 8.34863Z"
                    fill="#FFF6FF"
                />
            </svg>
        ),
    },
    {
        name: "Feature req",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
            >
                <path
                    d="M21.0001 3.09333C21.0003 3.5707 20.8865 4.04122 20.6682 4.46577C20.4499 4.89033 20.1335 5.25667 19.7452 5.53436C19.3569 5.81205 18.908 5.99307 18.4357 6.06238C17.9633 6.13169 17.4813 6.08728 17.0296 5.93285L15.1036 8.84737C15.9601 9.66337 16.4956 10.8139 16.5001 12.0904L18.2551 12.3934C18.5498 11.7253 19.078 11.1877 19.7407 10.8812C20.4035 10.5747 21.1552 10.5204 21.8551 10.7285C22.555 10.9367 23.1549 11.3929 23.5425 12.0117C23.9301 12.6306 24.0786 13.3695 23.9604 14.09C23.8421 14.8105 23.4651 15.4632 22.9001 15.9257C22.335 16.3881 21.6207 16.6287 20.891 16.6021C20.1614 16.5756 19.4664 16.2839 18.9364 15.7817C18.4064 15.2794 18.0778 14.6011 18.0121 13.8739L16.2571 13.5694C15.8873 14.6464 15.1229 15.5432 14.1181 16.0789L14.7841 18.1144C14.8561 18.1084 14.9281 18.1054 15.0001 18.1054C15.721 18.1057 16.4176 18.3655 16.9627 18.8373C17.5077 19.3091 17.8646 19.9614 17.9681 20.6748C18.0715 21.3882 17.9147 22.115 17.5262 22.7222C17.1377 23.3294 16.5435 23.7765 15.8524 23.9815C15.1614 24.1866 14.4195 24.1359 13.7627 23.8388C13.1059 23.5418 12.5781 23.0181 12.2757 22.3637C11.9734 21.7093 11.9168 20.9679 12.1163 20.2752C12.3157 19.5825 12.758 18.9848 13.3621 18.5914L12.6946 16.5514C11.8829 16.678 11.052 16.5799 10.2921 16.2679C9.53215 15.9559 8.87212 15.4418 8.38355 14.7814L5.93104 15.9634C5.97704 16.1704 6.00004 16.3844 6.00004 16.6054C6.00025 17.3078 5.75401 17.988 5.30423 18.5274C4.85445 19.0669 4.22964 19.4315 3.53868 19.5576C2.84772 19.6837 2.13441 19.5634 1.52305 19.2176C0.911696 18.8718 0.441046 18.3225 0.193117 17.6653C-0.0548129 17.0081 -0.0643035 16.2848 0.166299 15.6214C0.396901 14.9579 0.852975 14.3964 1.45505 14.0347C2.05713 13.673 2.76703 13.534 3.46106 13.6419C4.15509 13.7499 4.78925 14.0979 5.25303 14.6254L7.70255 13.4449C7.47015 12.6988 7.43604 11.9051 7.60358 11.1418C7.77112 10.3785 8.13454 9.67203 8.65805 9.09187L7.25554 7.33086C6.59227 7.63619 5.8404 7.68915 5.14087 7.47979C4.44135 7.27043 3.84219 6.81313 3.45571 6.19362C3.06923 5.5741 2.92196 4.8349 3.0415 4.11457C3.16105 3.39424 3.5392 2.74223 4.10508 2.28077C4.67095 1.81931 5.38571 1.58006 6.11536 1.60789C6.84501 1.63571 7.53947 1.92869 8.06856 2.43191C8.59765 2.93513 8.92505 3.61404 8.98939 4.34138C9.05373 5.06873 8.85059 5.79457 8.41805 6.38285L9.83406 8.16036C10.4761 7.80786 11.2141 7.60536 12.0001 7.60536C12.6631 7.60536 13.2931 7.74786 13.8601 8.00586L15.7771 5.10634C15.45 4.74534 15.2156 4.3101 15.0944 3.83823C14.9732 3.36637 14.9687 2.87209 15.0814 2.39811C15.1941 1.92413 15.4204 1.48472 15.741 1.11785C16.0616 0.750989 16.4666 0.467712 16.9212 0.292508C17.3758 0.117305 17.8662 0.0554474 18.3501 0.112282C18.8339 0.169116 19.2967 0.342932 19.6983 0.618707C20.0999 0.894481 20.4283 1.26391 20.6551 1.69507C20.882 2.12623 21.0004 2.60615 21.0001 3.09333ZM19.5001 3.09333C19.5001 2.6955 19.3421 2.31397 19.0608 2.03266C18.7795 1.75136 18.3979 1.59332 18.0001 1.59332C17.6023 1.59332 17.2208 1.75136 16.9394 2.03266C16.6581 2.31397 16.5001 2.6955 16.5001 3.09333C16.5001 3.49116 16.6581 3.87269 16.9394 4.154C17.2208 4.4353 17.6023 4.59334 18.0001 4.59334C18.3979 4.59334 18.7795 4.4353 19.0608 4.154C19.3421 3.87269 19.5001 3.49116 19.5001 3.09333ZM6.00004 6.10685C6.39786 6.10685 6.7794 5.94881 7.0607 5.66751C7.34201 5.3862 7.50005 5.00467 7.50005 4.60684C7.50005 4.20901 7.34201 3.82748 7.0607 3.54617C6.7794 3.26487 6.39786 3.10683 6.00004 3.10683C5.60221 3.10683 5.22068 3.26487 4.93937 3.54617C4.65806 3.82748 4.50003 4.20901 4.50003 4.60684C4.50003 5.00467 4.65806 5.3862 4.93937 5.66751C5.22068 5.94881 5.60221 6.10685 6.00004 6.10685ZM12.0001 15.1069C12.7957 15.1069 13.5588 14.7908 14.1214 14.2282C14.684 13.6656 15.0001 12.9025 15.0001 12.1069C15.0001 11.3112 14.684 10.5482 14.1214 9.98555C13.5588 9.42294 12.7957 9.10687 12.0001 9.10687C11.2044 9.10687 10.4414 9.42294 9.87874 9.98555C9.31613 10.5482 9.00006 11.3112 9.00006 12.1069C9.00006 12.9025 9.31613 13.6656 9.87874 14.2282C10.4414 14.7908 11.2044 15.1069 12.0001 15.1069ZM4.50003 16.6069C4.50003 16.2091 4.34199 15.8276 4.06068 15.5462C3.77938 15.2649 3.39785 15.1069 3.00002 15.1069C2.60219 15.1069 2.22066 15.2649 1.93935 15.5462C1.65805 15.8276 1.50001 16.2091 1.50001 16.6069C1.50001 17.0047 1.65805 17.3863 1.93935 17.6676C2.22066 17.9489 2.60219 18.1069 3.00002 18.1069C3.39785 18.1069 3.77938 17.9489 4.06068 17.6676C4.34199 17.3863 4.50003 17.0047 4.50003 16.6069ZM16.5001 21.1069C16.5001 20.7091 16.3421 20.3276 16.0608 20.0463C15.7795 19.765 15.3979 19.6069 15.0001 19.6069C14.6023 19.6069 14.2207 19.765 13.9394 20.0463C13.6581 20.3276 13.5001 20.7091 13.5001 21.1069C13.5001 21.5048 13.6581 21.8863 13.9394 22.1676C14.2207 22.4489 14.6023 22.6069 15.0001 22.6069C15.3979 22.6069 15.7795 22.4489 16.0608 22.1676C16.3421 21.8863 16.5001 21.5048 16.5001 21.1069ZM21.0001 15.1069C21.398 15.1069 21.7795 14.9489 22.0608 14.6676C22.3421 14.3863 22.5001 14.0047 22.5001 13.6069C22.5001 13.2091 22.3421 12.8275 22.0608 12.5462C21.7795 12.2649 21.398 12.1069 21.0001 12.1069C20.6023 12.1069 20.2208 12.2649 19.9395 12.5462C19.6582 12.8275 19.5001 13.2091 19.5001 13.6069C19.5001 14.0047 19.6582 14.3863 19.9395 14.6676C20.2208 14.9489 20.6023 15.1069 21.0001 15.1069Z"
                    fill="#FFF6FF"
                />
            </svg>
        ),
    },
    {
        name: "Experience",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="15"
                viewBox="0 0 24 15"
                fill="none"
            >
                <path
                    d="M12.0011 4.3252C13.3102 4.3252 14.5657 4.84524 15.4914 5.77093C16.4171 6.69661 16.9371 7.95211 16.9371 9.26123C16.9371 10.5703 16.4171 11.8258 15.4914 12.7515C14.5657 13.6772 13.3102 14.1973 12.0011 14.1973C10.692 14.1973 9.43646 13.6772 8.51077 12.7515C7.58509 11.8258 7.06504 10.5703 7.06504 9.26123C7.06504 7.95211 7.58509 6.69661 8.51077 5.77093C9.43646 4.84524 10.692 4.3252 12.0011 4.3252ZM12.0011 6.17621C11.1829 6.17621 10.3982 6.50124 9.81964 7.07979C9.24108 7.65834 8.91605 8.44303 8.91605 9.26123C8.91605 10.0794 9.24108 10.8641 9.81964 11.4427C10.3982 12.0212 11.1829 12.3462 12.0011 12.3462C12.8193 12.3462 13.604 12.0212 14.1825 11.4427C14.7611 10.8641 15.0861 10.0794 15.0861 9.26123C15.0861 8.44303 14.7611 7.65834 14.1825 7.07979C13.604 6.50124 12.8193 6.17621 12.0011 6.17621ZM12.0011 4.62557e-07C17.6935 4.62557e-07 22.6086 3.88712 23.9722 9.33403C24.0319 9.57213 23.9946 9.8242 23.8685 10.0348C23.7424 10.2454 23.5377 10.3973 23.2996 10.457C23.0616 10.5167 22.8095 10.4794 22.5989 10.3533C22.3883 10.2272 22.2364 10.0225 22.1767 9.78445C21.6054 7.51815 20.2938 5.50745 18.45 4.07115C16.6062 2.63486 14.3357 1.85518 11.9985 1.85575C9.66133 1.85631 7.39121 2.63709 5.54811 4.07428C3.70502 5.51147 2.39445 7.52281 1.82421 9.78938C1.7948 9.90736 1.74244 10.0184 1.67012 10.1161C1.5978 10.2139 1.50694 10.2964 1.40272 10.359C1.2985 10.4216 1.18297 10.4631 1.06272 10.4811C0.94247 10.4991 0.819858 10.4932 0.701884 10.4638C0.58391 10.4344 0.472884 10.382 0.375146 10.3097C0.277408 10.2374 0.194872 10.1465 0.132249 10.0423C0.0696268 9.93805 0.0281448 9.82252 0.0101717 9.70227C-0.00780139 9.58202 -0.00191382 9.45941 0.0274987 9.34144C0.696135 6.67232 2.23767 4.30325 4.40712 2.6107C6.57658 0.918159 9.24948 -0.000752654 12.0011 4.62557e-07Z"
                    fill="#FFF6FF"
                />
            </svg>
        ),
    },
    {
        name: "Other",
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
            >
                <path
                    d="M6.5 10.5986C6.89782 10.5986 7.27936 10.7567 7.56066 11.038C7.84196 11.3193 8 11.7008 8 12.0986C8 12.4965 7.84196 12.878 7.56066 13.1593C7.27936 13.4406 6.89782 13.5986 6.5 13.5986C6.10218 13.5986 5.72064 13.4406 5.43934 13.1593C5.15804 12.878 5 12.4965 5 12.0986C5 11.7008 5.15804 11.3193 5.43934 11.038C5.72064 10.7567 6.10218 10.5986 6.5 10.5986ZM12.5 10.5986C12.8978 10.5986 13.2794 10.7567 13.5607 11.038C13.842 11.3193 14 11.7008 14 12.0986C14 12.4965 13.842 12.878 13.5607 13.1593C13.2794 13.4406 12.8978 13.5986 12.5 13.5986C12.1022 13.5986 11.7206 13.4406 11.4393 13.1593C11.158 12.878 11 12.4965 11 12.0986C11 11.7008 11.158 11.3193 11.4393 11.038C11.7206 10.7567 12.1022 10.5986 12.5 10.5986ZM18.5 10.5986C18.8978 10.5986 19.2794 10.7567 19.5607 11.038C19.842 11.3193 20 11.7008 20 12.0986C20 12.4965 19.842 12.878 19.5607 13.1593C19.2794 13.4406 18.8978 13.5986 18.5 13.5986C18.1022 13.5986 17.7206 13.4406 17.4393 13.1593C17.158 12.878 17 12.4965 17 12.0986C17 11.7008 17.158 11.3193 17.4393 11.038C17.7206 10.7567 18.1022 10.5986 18.5 10.5986Z"
                    fill="#FFF6FF"
                />
            </svg>
        ),
    },
];

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

const report_type = ["Bug", "Feature request", "Experience", "Other"];
const severity = ["Minor", "Moderate", "Severe"];

const Feedback = () => {
    const { request } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<FeedbackFormDataType>({
        type: null,
        feedback: "",
        severity: null,
        stars: 0,
        contact: true,
        media: [],
    });

    const [expandedImage, setExpandedImage] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const formValid = () => {
        return (
            formData.type !== null &&
            formData.severity !== null &&
            formData.stars !== 0
        );
    };

    const handleSubmit = async () => {
        setError(null);
        if (!formValid()) {
            setError("Missing required fields");
            console.log("Missing required fields");
            return;
        }
        const res = await request(`http://localhost:3001/api/feedback`, {
            method: "POST",
            body: JSON.stringify({
                report_type: report_type[formData.type!],
                comments: formData.feedback,
                severity: severity[formData.severity!],
                stars: formData.stars,
                contact: formData.contact,
                // media: formData.media.map((m) => ({
                //     name: m.name,
                //     media_type: m.media_type,
                //     base64: m.base64,
                // })),
            }),
        });
        // console.log(await res.text());
        if (res.status === 200) {
            router.push('/map?feedback=success');
        }
    };

    return (
        <div className="bg-secondary-white flex h-fit w-full justify-center">
            <div className="mb-[40px] mt-[40px] flex w-[80%] max-w-[400px] flex-col items-center">
                <div className="text-primary-purple relative flex w-full flex-col items-center justify-center gap-[18px]">
                    <ChevronLeft
                        size={22}
                        className="absolute left-0 top-1 hover:cursor-pointer"
                        onClick={() => {
                            router.push("/map");
                        }}
                    />
                    <h1 className="font-montserrat text-[20px] font-bold">
                        Feedback
                    </h1>
                    <div className="w-[100vw] bg-[#9E88B2] py-2 font-nunito text-secondary-white flex flex-col gap-[4px]">
                        <h2 className="text-center text-[14px] font-bold">
                            How is your experience with Striide?
                        </h2>
                        <h3 className="text-center text-[14px] font-normal">
                            Your feedback makes us better!
                        </h3>
                    </div>
                </div>
                <div className="mt-[28px] flex w-full justify-between">
                    {Icons.map((icon, index) => (
                        <div
                            key={index}
                            className="flex w-full flex-col items-center gap-[10px]"
                        >
                            <button
                                onClick={() => {
                                    formData.type == index
                                        ? setFormData({
                                            ...formData,
                                            type: null,
                                        })
                                        : setFormData({
                                            ...formData,
                                            type: index,
                                        });
                                }}
                                className={`border-secondary-muted-purple flex h-[56px] w-[56px] items-center justify-center rounded-[16px] border`}
                            >
                                <div
                                    className={`${formData.type === index ? "bg-primary-purple" : "bg-secondary-muted-purple"} rounded-[8px] p-[8px]`}
                                >
                                    {icon.icon}
                                </div>
                            </button>
                            <h1 className="font-nunito text-secondary-black w-full whitespace-nowrap text-center text-[12px] font-normal">
                                {icon.name}
                            </h1>
                        </div>
                    ))}
                </div>
                <div className="mt-[20px] flex w-full flex-col gap-[26px] p-[16px]">
                    <textarea
                        className="border-[rgba(158, 136, 178, 0.30)] bg-secondary-white font-mulish focus:outline-primary-purple min-h-[168px] resize-none rounded-[8px] border p-[16px] text-[14px] font-normal placeholder:text-[#9E88B2]"
                        placeholder="Your comments can keep the community safe. Tell us more."
                        value={formData.feedback}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                feedback: e.target.value,
                            })
                        }
                    />
                    <div className="flex items-center gap-[20px]">
                        {formData.media.map((media, index) => (
                            <div
                                key={index}
                                className="relative flex items-center justify-center"
                            >
                                <Image
                                    src={media.url}
                                    alt={media.name}
                                    width={69}
                                    height={69}
                                    className="border-primary-green rounded-[8px] border-[2px] cursor-pointer"
                                    onClick={() => setExpandedImage(media)}
                                />
                                <button
                                    className="absolute -right-[10px] -top-[10px] flex h-[24px] w-[24px] items-center justify-center stroke-[#9E88B2] hover:stroke-[#C30000]"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            media: formData.media.filter((m) => m != media),
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
                        ))}
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
                                    const media_type = e.target.files[0].type;
                                    const url = URL.createObjectURL(
                                        e.target.files[0],
                                    );
                                    reader.onloadend = () => {
                                        if (
                                            reader.result &&
                                            typeof reader.result === "string"
                                        ) {
                                            setFormData({
                                                ...formData,
                                                media: [
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
                            <h3 className="font-mulish text-secondary-muted-purple text-[14px]">
                                Add media
                            </h3>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-[24px]">
                        <h3 className="font-nunito text-secondary-black w-full text-center text-[16px] font-semibold">
                            How concerning is this report?
                        </h3>
                        <div className="flex h-[38px] w-full items-center gap-[10px]">
                            {["Minor", "Moderate", "Severe"].map(
                                (name, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            formData.severity == index
                                                ? setFormData({
                                                    ...formData,
                                                    severity: null,
                                                })
                                                : setFormData({
                                                    ...formData,
                                                    severity: index,
                                                });
                                        }}
                                        className={`text-primary-purple flex items-center justify-center rounded-[20px] px-[20px] py-[4px] ${formData.severity == index
                                            ? "bg-primary-purple text-secondary-white"
                                            : "border-[rgba(158, 136, 178, 0.30)] border"
                                            }`}
                                    >
                                        <h3 className="font-inter text-[16px] font-light">
                                            {name}
                                        </h3>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-[32px] flex w-full flex-col items-center gap-[20px]">
                    <h3 className="font-nunito text-secondary-black w-full text-center text-[16px] font-semibold">
                        How are you liking Striide?
                    </h3>
                    <div className="flex h-fit w-[328px] items-center justify-center rounded-[12px] bg-[#9e88b233] px-[32px] py-[16px]">
                        {[1, 2, 3, 4, 5].map((star, index) => (
                            <button
                                key={index}
                                onClick={() =>
                                    setFormData({ ...formData, stars: star })
                                }
                                className={`flex items-center justify-center p-[8px]`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="26"
                                    height="25"
                                    viewBox="0 0 26 25"
                                    fill="none"
                                >
                                    <path
                                        d="M10.4185 5.2901C11.5119 2.56201 12.0601 1.19727 13.0005 1.19727C13.9409 1.19727 14.489 2.56062 15.5825 5.2901L15.634 5.41531C16.2517 6.95812 16.5605 7.72883 17.1921 8.19766C17.8209 8.66509 18.6487 8.74022 20.3028 8.88768L20.6005 8.91411C23.3077 9.15618 24.6627 9.27721 24.9507 10.1383C25.2414 11.0009 24.2356 11.9149 22.224 13.7429L21.5548 14.355C20.5365 15.2801 20.0273 15.7434 19.7908 16.3499C19.7461 16.4633 19.709 16.5795 19.6795 16.6977C19.5251 17.3293 19.674 18.0013 19.9717 19.3438L20.0649 19.7611C20.6116 22.2304 20.8857 23.4644 20.4085 23.9972C20.2296 24.1959 19.9973 24.3389 19.7393 24.409C19.0493 24.5982 18.0699 23.7997 16.1084 22.2026C14.8215 21.1537 14.1774 20.6292 13.4387 20.511C13.1484 20.4646 12.8526 20.4646 12.5623 20.511C11.8222 20.6292 11.1794 21.1537 9.89121 22.2026C7.93243 23.7997 6.95166 24.5982 6.26163 24.409C6.00415 24.3387 5.77234 24.1957 5.59387 23.9972C5.1153 23.4644 5.38937 22.2304 5.9361 19.7625L6.02931 19.3438C6.32702 17.9999 6.47587 17.3293 6.32145 16.6963C6.29201 16.5781 6.25483 16.4619 6.21016 16.3486C5.97366 15.7434 5.46449 15.2801 4.44615 14.3536L3.7756 13.7429C1.76535 11.9149 0.759535 10.9995 1.0489 10.1397C1.33966 9.27721 2.69327 9.15618 5.4005 8.91411L5.69821 8.88629C7.35371 8.73883 8.18006 8.66509 8.81027 8.19627C9.44047 7.72744 9.74931 6.95812 10.3684 5.4167L10.4185 5.2901Z"
                                        fill={
                                            star <= formData.stars
                                                ? "#FF0E72"
                                                : ""
                                        }
                                        stroke="#FF7A4B"
                                    />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-[32px] flex w-full flex-col gap-[20px]">
                    <h3 className="font-nunito text-secondary-black w-full text-center text-[14px]">
                        Can we contact you?
                    </h3>
                    <div className="flex w-full justify-center gap-8">
                        <button
                            onClick={() =>
                                setFormData({ ...formData, contact: false })
                            }
                            className={`font-montserrat flex h-[48px] w-[152px] items-center justify-center rounded-[30px] border border-[#9E88B2] text-[16px] font-normal px-2 ${formData.contact
                                ? "text-secondary-muted-purple"
                                : "text-secondary-white bg-[#C30000]"
                                }`}
                        >
                            No
                        </button>
                        <button
                            onClick={() =>
                                setFormData({ ...formData, contact: true })
                            }
                            className={`font-montserrat flex h-[48px] w-[152px] items-center justify-center rounded-[30px] border border-[#9E88B2] text-[16px] font-normal px-2 ${formData.contact
                                ? "text-secondary-white bg-[#0085FF]"
                                : "text-secondary-muted-purple"
                                }`}
                        >
                            Yes
                        </button>
                    </div>
                </div>
                {formValid() ? (
                    <Button
                        className="w-[323px] mb-[40px] mt-[50px] font-light"
                        onClick={handleSubmit}
                    >
                        Submit feedback
                    </Button>
                ) : (
                    <Button
                        className="w-[323px] border-primary-purple text-primary-purple mb-[40px] mt-[50px] border bg-transparent font-light"
                        onClick={handleSubmit}
                    >
                        Submit feedback
                    </Button>
                )}
                {!formValid() && error && (
                    <div className="flex w-full items-center justify-center">
                        <h3 className="font-nunito text-[14px] text-red-500">
                            {error}
                        </h3>
                    </div>
                )}
            </div>

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

export default Feedback;
