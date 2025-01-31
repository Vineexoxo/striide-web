import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/constants";

export const POST = async (request: NextRequest) => {
    /* TODO: Safely parse data with Zod */
    const body = await request.json();
    const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            name: body.name,
            ip: body.ip,
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
        const errorData = await response.json();
        return NextResponse.json({
            status: response.status,
            message: errorData.message || "Signup failed", // send error message
            error: errorData.error || "An error occurred during Signup", // detailed error message
        });
    }
};
