import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/constants";

export const POST = async () => {
    const refresh_token = cookies().get("auth_cookie")?.value;
    if (!refresh_token) {
        return NextResponse.json({
            status: 401,
            message: "No refresh token found",
        });
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/refresh_access`, {
        method: "POST",
        headers: {
            Cookie: `auth_cookie=${refresh_token}`,
        },
    });
    const body = await response.json();
    return NextResponse.json(body);
};
