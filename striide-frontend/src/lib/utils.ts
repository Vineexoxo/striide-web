import { ClassValue, clsx } from "clsx";
import { LngLat } from "mapbox-gl";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculateBearing(center: LngLat, point: LngLat) {
    // const y = Math.sin(point.lng - center.lng) * Math.cos(point.lat);
    // const x =
    //     Math.cos(center.lat) * Math.sin(point.lat) -
    //     Math.sin(center.lat) *
    //         Math.cos(point.lat) *
    //         Math.cos(point.lng - center.lng);
    // const angle = Math.atan2(y, x);
    // return ((angle * 180) / Math.PI + 360) % 360;

    const angle = Math.atan(
        (point.lng - center.lng) / (point.lat - center.lat),
    );
    if (point.lat > center.lat) {
        return (angle * 180) / Math.PI;
    }
    return (angle * 180) / Math.PI + 180;
}

export function findClosestPointIndex(
    center: LngLat,
    points: number[][],
): number {
    let minDistance = Infinity;
    let minIndex = -1;
    for (let i = 0; i < points.length; i++) {
        const point = new LngLat(points[i][0], points[i][1]);
        const distance = center.distanceTo(point);
        if (distance < minDistance) {
            minDistance = distance;
            minIndex = i;
        }
    }
    return minIndex;
}
