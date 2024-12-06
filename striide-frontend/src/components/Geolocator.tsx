import React, { useCallback, useEffect, useState } from "react";
import { useMap } from "@/contexts/MapProvider";
import { calculateBearing, cn, findClosestPointIndex } from "@/lib/utils";
import mapboxgl, { LngLat } from "mapbox-gl";
import { Navigation } from "lucide-react";

interface GeolocatorProps {
    className?: string;
    queryPath?: number[][];
    geolocatorCoords: number[];
    setGeolocatorCoords: React.Dispatch<React.SetStateAction<number[]>>;
}

const calc_pitch = (zoom: number) => {
    return Math.max(0, Math.min(75, (zoom - 15) * 15));
};

const create_marker = () => {
    const marker = document.createElement("div");
    marker.className =
        "h-[20px] w-[20px] bg-primary-purple border-[2px] border-secondary-white rounded-full flex items-center justify-center";
    const pulse = document.createElement("div");
    pulse.className =
        "h-[40px] w-[40px] bg-primary-purple opacity-50 rounded-full absolute animate-[ping_2s_infinite]";
    marker.appendChild(pulse);
    return new mapboxgl.Marker(marker);
};

const Geolocator = ({
    geolocatorCoords,
    queryPath,
    setGeolocatorCoords,
    className,
}: GeolocatorProps) => {
    const { map, moving, moveMap } = useMap();
    const [tracking, setTracking] = useState(true);
    const [trackingSingleton, setTrackingSingleton] = useState(false);
    const [init, setInit] = useState(false);

    const getBearing = useCallback(() => {
        let bearing = null;
        if (queryPath && queryPath.length > 0) {
            const center = new LngLat(geolocatorCoords[0], geolocatorCoords[1]);
            const closestIndex = findClosestPointIndex(center, queryPath);
            const point =
                queryPath[Math.min(closestIndex + 1, queryPath.length - 1)];

            bearing = calculateBearing(center, new LngLat(point[0], point[1]));
        }
        return bearing;
    }, [queryPath, geolocatorCoords]);

    const handleMove = useCallback(() => {
        if (init) setTracking(false);
    }, [init]);

    useEffect(() => {
        console.log(tracking);
    }, [tracking]);

    const handleGeolocate = () => {
        if (!map || !geolocatorCoords) return;
        setTracking(true);
        const bearing = getBearing();
        map.off("move", handleMove);
        moveMap({
            center: geolocatorCoords as [number, number],
            zoom: 18,
            pitch: calc_pitch(18),
            duration: 1000,
            bearing: bearing ?? map.getBearing(),
        }).then(() => {
            map.on("move", handleMove);
        });
    };

    useEffect(() => {
        if (navigator.geolocation) {
            const geolocate = navigator.geolocation.watchPosition(
                (position) => {
                    setGeolocatorCoords([
                        position.coords.longitude,
                        position.coords.latitude,
                    ]);
                },
                (e) => {
                    console.log("Error", e);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 2000,
                    timeout: 5000,
                },
            );
            return () => {
                navigator.geolocation.clearWatch(geolocate);
            };
        }
    }, [setGeolocatorCoords]);

    useEffect(() => {
        if (!map || geolocatorCoords.length == 0) return;

        map.on("load", () => {
            moveMap({
                center: geolocatorCoords as [number, number],
                zoom: 18,
                pitch: calc_pitch(18),
                duration: 1000,
            }).then(() => {
                setInit(true);
            });
        });
    }, [map, geolocatorCoords, moveMap]);

    useEffect(() => {
        if (!map || geolocatorCoords.length == 0) return;
        const geolocator = create_marker();
        geolocator.setPitchAlignment("map");
        geolocator.setLngLat(geolocatorCoords as [number, number]).addTo(map);

        return () => {
            geolocator.remove();
        };
    }, [map, geolocatorCoords]);

    useEffect(() => {
        if (!map || geolocatorCoords.length == 0 || moving || !init) return;

        if (tracking) {
            if (!trackingSingleton) {
                setTrackingSingleton(true);
                const bearing = getBearing();
                map.off("move", handleMove);
                moveMap({
                    center: geolocatorCoords as [number, number],
                    zoom: 18,
                    pitch: calc_pitch(18),
                    duration: 100,
                    bearing: bearing ?? map.getBearing(),
                }).then(() => {
                    map.on("move", handleMove);
                });

                setTimeout(() => {
                    setTrackingSingleton(false);
                }, 2500);
            }
        } else {
            const handleZoom = () => {
                const zoom = map.getZoom();
                moveMap({
                    center: map.getCenter(),
                    zoom,
                    pitch: calc_pitch(zoom),
                    duration: 300,
                });
            };
            map.on("zoomend", handleZoom);
            map.on("pitchend", handleZoom);

            return () => {
                map.off("zoomend", handleZoom);
                map.off("pitchend", handleZoom);
            };
        }
    }, [
        map,
        tracking,
        moving,
        geolocatorCoords,
        moveMap,
        init,
        trackingSingleton,
        queryPath,
        handleMove,
        getBearing,
    ]);

    return (
        <button
            className={cn(
                `h-[44px] w-[44px] rounded-full ${tracking ? "border-primary-green border-[2px]" : ""} bg-secondary-white flex items-center justify-center`,
                className,
            )}
            onClick={() => handleGeolocate()}
        >
            <Navigation
                size={24}
                className={"text-primary-purple -translate-x-[1px]"}
                fill={`${tracking ? "#6B18D8" : "#FFF6FF"}`}
            />
        </button>
    );
};

export default Geolocator;
