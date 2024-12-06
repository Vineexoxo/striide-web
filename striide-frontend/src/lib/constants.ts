export const BASE_URL =
    process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:8000";

export const REFRESH_BUSINESS_INTERVAL = 60000; // 1 minutes
