import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { BASE_URL } from "./lib/constants";
import { cache } from "react";
import { POST } from "./app/api/auth/refresh/route";

interface UserInfo {
    email: string;
    role: string;
    name: string;
    onboard: boolean;
}
//`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entry`

const userInfo = async (access_token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify_session`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    if (response.status === 200) {
        const data = await response.json();
        return {
            email: data.body.email,
            role: data.body.role,
            name: data.body.name,
            onboard: data.body.onboard,
        } as UserInfo;
    }
    return null;
};

export const auth = cache(async () => {
    try {
        const response = await POST();
        const data = await response.json();
        if (data.status === 200) {
            return await userInfo(data.body.token);
        }
        return null;
    } catch {
        return null;
    }
});
