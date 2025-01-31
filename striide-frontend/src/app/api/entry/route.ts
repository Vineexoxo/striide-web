import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BASE_URL } from "@/lib/constants";

export const POST = async (request: NextRequest) => {

    const body = await request.json();
    const response = await fetch("http://localhost:3001/api/entry", {
        method: "POST",
        body: JSON.stringify(body), // Ensure the body is stringified here

    });
    console.log("asjdhajshdjahsdjahjsadhasj");

    if (response.status === 200) {
        const data = await response.json(); // assuming the data above is the response from the authentication service        // cookies().set("auth_cookie", data.session.refresh_token); // Store refresh token in cookies
        return NextResponse.json({
            status: 200,
            message: data.message,
            user: data.user, // Send user details
            session: data.session, // Send session details
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
