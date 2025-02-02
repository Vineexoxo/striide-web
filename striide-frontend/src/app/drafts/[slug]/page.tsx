"use client"
import { useEffect, useReducer } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { BASE_URL } from '@/lib/constants'
import { MediaType } from '@/lib/types'
import ReportForm from '@/components/reports/ReportsForm'
import { checkAuthCookie } from '@/lib/check-auth'
import { useRouter } from 'next/navigation'

type ReportDraft = {
    coordinates: number[],
    address: string,
    duration: string,
    description: string,
    media: MediaType[]
}

const reducer = (state: ReportDraft, action: any) => {
    switch (action.type) {
        case "SET_COORDINATES":
            return { ...state, coordinates: action.payload };
        case "SET_DURATION":
            return { ...state, duration: action.payload };
        case "SET_DESCRIPTION":
            return { ...state, description: action.payload };
        case "SET_MEDIA":
            return { ...state, media: action.payload };
        case "SET_ADDRESS":
            return { ...state, address: action.payload };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

const DynamicDraft = ({ params }: { params: { slug: string } }) => {
    const { slug } = params
    const router = useRouter();
    const { request } = useAuth();

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

    const initialFormState = {
        address: "",
        duration: "",
        coordinates: [],
        media: [],
        description: ""
    }

    const [formData, dispatch] = useReducer(reducer, initialFormState);

    useEffect(() => {
        const fetch_draft = async () => {
            const response = await request(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fetch_report_draft`, {
                method: 'POST',
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reportID: slug
                })
            })

            return response.json();
        }

        fetch_draft()
            .then((data) => {
                dispatch({ type: "SET_ADDRESS", payload: data.body.address })
                dispatch({ type: "SET_DESCRIPTION", payload: data.body.description })
                dispatch({ type: "SET_DURATION", payload: data.body.duration })
                dispatch({ type: "SET_MEDIA", payload: data.body.media })
                dispatch({ type: "SET_COORDINATES", payload: [data.body.lng, data.body.lat] })
            })
            .catch((err) => console.log(err));
    }, [request, slug]) // Added request and slug as dependencies

    return <ReportForm 
        address={formData.address} 
        coordinates={formData.coordinates} 
        description={formData.description} 
        duration={formData.duration} 
        media={formData.media}
        isDraft={true}
        reportID={slug}
    />
}

export default DynamicDraft