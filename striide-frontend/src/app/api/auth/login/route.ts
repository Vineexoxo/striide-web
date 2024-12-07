import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/constants";

export const POST = async (request: NextRequest) => {
    /* TODO: Safely parse data with Zod */
    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            ip: "",
        }),
    });
    if (response.status === 200) {
        const data = await response.json();
        cookies().set("auth_cookie", data.body.refresh_token);
        return NextResponse.json({
            status: 200,
            message: data.body.message,
        });
    } else {
        return NextResponse.json({
            status: response.status,
            message: response.statusText,
        });
    }
};
