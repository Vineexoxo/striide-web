"use client"

import { ChevronLeft, Clock3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { BASE_URL } from '@/lib/constants'
import MapProvider from '@/contexts/MapProvider'
import Map from "@/components/Map";
import { useRouter } from 'next/navigation'
import NotFoundIcon from "@/components/NotFoundIcon";
import { checkAuthCookie } from '@/lib/check-auth'

type ReportDraft = {
    reportID: string,
    createdAt: string,
    address: string,
    coordinates: number[],
    is_published: boolean,
    duration: string,
    description: string, 
}

const SavedDrafts: FC = ({ }) => {

    const { request } = useAuth();
    const router = useRouter();
    const [drafts, setDrafts] = useState<ReportDraft[]>([]);

    const [error, setError] = useState("");
    const [time, setTime] = useState(4);

    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const checkUserAuthentication = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/get-user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (!data.user || data.user.role !== 'authenticated') {
                    router.push('/user/login');
                }
            } catch (error) {
                console.error('Error checking user authentication:', error);
            }
        };

        checkUserAuthentication();
    }, [router]);

    useEffect(() => {
        if (!time) { return; }

        const intervalId = setInterval(() => {
            setTime(time - 1);
        }, 5000);

        return () => {
            clearInterval(intervalId)
            setError("")
        };
    }, [time])

    useEffect(() => {
        const fetch_reports = async () => {
            const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fetch_reports`, {
                method: "GET",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
            });

            return (await response).json()
        }

        fetch_reports()
            .then((data) => {
                setDrafts([...data.body.reports.map((report: any) => {
                    let reportBody: ReportDraft = {
                        reportID: report.reportID,
                        address: report.address,
                        coordinates: [report.lng, report.lat],
                        duration: report.duration,
                        description: report.description,
                        is_published: report.is_published, 
                        createdAt: report.created_at, 
                    }
                    return reportBody
                })])
                setIsFetching(false)
            })
            // .catch((err) => {
            //     console.log(err);
            //     setError("Something wrong wrong getting your draft reports")
            //     // setIsFetching(false)
            // });

    }, [request]) // Added request as a dependency

    return (
        <div className='bg-[#FFF6FF] min-h-screen flex items-start justify-center relative'>
            <div className="relative h-full z-0">
                <div className="w-[393px] h-full flex flex-col items-center justify-start relative pt-5 pb-20">
                    <div className="text-primary-purple relative flex w-full flex-col items-center justify-center gap-[18px]">
                        <Link href="/user" className='absolute left-2 top-1 hover:cursor-pointer'>
                            <ChevronLeft size={22} />
                        </Link>
                        <h1 className="font-montserrat text-[20px] font-bold">
                            Saved Drafts
                        </h1>
                        <div className="w-[100vw] bg-[#9E88B2] py-2 font-nunito text-secondary-white flex flex-col gap-[4px]">
                            <h2 className="text-center text-[14px] font-bold">
                                {drafts.length} drafts
                            </h2>
                        </div>
                    </div>

                    {drafts.length === 0 ? (
                        <div className="bg-[#D7C6E7] rounded-md p-4 h-[200px] w-[370px] flex flex-col items-center justify-between gap-y-2 text-center overflow-y-scroll">
                            <NotFoundIcon className="w-full h-full " />
                            <div className="">
                                No drafts saved, keep striding!
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col gap-y-3">
                            {drafts.map((report, index) => {

                                const mapOptions = {
                                    longitude: report.coordinates[0],
                                    latitude: report.coordinates[1],
                                    zoom: 15,
                                };

                                const timeString = (new Date(report.createdAt)).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,  // Set to false for 24-hour format
                                });

                                return (
                                    <div
                                        className="bg-[#D7C6E7] rounded-md p-4 h-[200px] w-[370px] flex flex-col items-center justify-between cursor-pointer"
                                        key={index}
                                        onClick={() => {
                                            router.push(`/drafts/${report.reportID}`)
                                        }}
                                    >
                                        {/* Map Container */}
                                        <MapProvider>
                                            <div className="w-full h-[120px] mb-2 relative overflow-hidden rounded-md">
                                                <Map
                                                    options={mapOptions}
                                                    markerCoords={report.coordinates}
                                                    queryPath={[]}
                                                    viewOnly
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        </MapProvider>

                                        <span className="text-[#1F1926] font-semibold w-full flex justify-start items-center">
                                            {report.address}
                                        </span>

                                        <div className="flex items-center justify-between w-full">
                                            <span className="text-[#1F1926]">Created at {timeString}</span>
                                            <span className="text-[#1F1926] flex items-center justify-center gap-x-2">
                                                <Clock3 className="w-3 h-3" />
                                                expires in 28 mins
                                            </span>
                                        </div>
                                    </div>
                                );

                            })}

                        </div>
                    )}

                </div>
                {isFetching && <div>
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </div>}
            </div>
            {
                error.length !== 0 && time !== 0 &&
                <div className={`bg-red-500 text-white h-fit w-64 absolute top-5 right-5 p-2 rounded-md animate-bounce`}>
                    {error}
                </div>
            }
        </div >
    )
}

export default SavedDrafts