import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/constants";

export const POST = async (request: NextRequest) => {
    /* TODO: Safely parse data with Zod */
    const body = await request.json();
    const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            ip: body.ip,
        }),
    });
    if (response.status === 200) {
        const data = await response.json(); // assuming the data above is the response from the authentication service
              // Set the session token in cookies
        cookies().set({
            name: "auth_cookie", // Cookie name
            value: data.session.refresh_token, // Value from the response
            httpOnly: true, // Secure cookie, inaccessible via JavaScript
            secure: true, // Send only over HTTPS
            path: "/", // Accessible on all routes
            sameSite: "strict", // Prevent CSRF attacks
            maxAge: 60 * 60 * 24 * 7, // Optional: Set expiry (e.g., 7 days)
        });
        return NextResponse.json({
            status: 200,
            message: data.message,
            user: data.user, // Send user details
            session: data.session, // Send session details
            onboard: data.onboard,
        });
    } else {
        const errorData = await response.json();
        return NextResponse.json({
            status: response.status,
            message: errorData.message || "Login failed", // send error message
            error: errorData.error || "An error occurred during login", // detailed error message
        });
    }
};
