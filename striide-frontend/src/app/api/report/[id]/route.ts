import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/constants";
import { POST as A } from "@/app/api/auth/refresh/route";

export const POST = async (
    _: NextRequest,
    { params }: { params: { id: string } },
) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get_report`, {
        method: "POST",
        body: JSON.stringify({
            id: params.id,
        }),
    });
    if (response.status === 200) {
        const data = await response.json();
        // console.log(data.body.json);
        const res = await JSON.parse(data.body.json);
        const report = res.records[0];
        const date = new Date(report.xata.createdAt);
        const created_date = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const created_time = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // 24-hour format
        });

        const tokenResponse = await A();
        const tokenData = await tokenResponse.json();
        if (!(tokenData.status === 200)) {
            return NextResponse.json({
                status: tokenData.status,
                message: tokenData.statusText,
            });
        }

        const access_token = tokenData.body.token;

        const likes_response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report_likes`, {
            method: "POST",
            body: JSON.stringify({
                id: params.id,
            }),
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!(likes_response.status === 200)) {
            return NextResponse.json({
                status: likes_response.status,
                message: likes_response.statusText,
            });
        }

        const likes_data = await likes_response.json();
        const likes = likes_data.body.likes;
        const dislikes = likes_data.body.dislikes;
        const userLiked = likes_data.body.user_liked;

        const reportData = {
            media: report.media,
            description: report.description,
            duration: report.duration,
            created_date: created_date,
            created_time: created_time,
            likes: likes,
            dislikes: dislikes,
            userLiked: userLiked,
        };

        return NextResponse.json({
            status: 200,
            report: reportData,
        });
    } else {
        return NextResponse.json({
            status: response.status,
            message: response.statusText,
        });
    }
};
