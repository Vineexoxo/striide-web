"use client";

import {
    Dispatch,
    FC,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";
import { useMap } from "@/contexts/MapProvider";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import log from "@/logger";

// import { sendGAEvent } from "@next/third-parties/google";
import { BASE_URL, REFRESH_BUSINESS_INTERVAL } from "@/lib/constants";

interface MapOptions {
    latitude: number;
    longitude: number;
    zoom: number;
}

interface MapProps {
    className?: string;
    options: MapOptions;
    mapboxPath?: number[][];
    queryPath: number[][];
    setUserCoords?: Dispatch<SetStateAction<number[]>>;
    setCustomCoords?: Dispatch<SetStateAction<number[][]>>;
    viewOnly?: boolean;
    markerCoords?: number[];
    chooseLocation?: boolean;
}

const Map: FC<MapProps> = ({
    className,
    options,
    mapboxPath,
    queryPath,
    setCustomCoords,
    setUserCoords,
    viewOnly,
    markerCoords,
    chooseLocation,
}) => {
    const { map, setMap } = useMap();
    const mapContainer = useRef(null);

    const [openBuildings, setOpenBuildings] = useState([]);

    useEffect(() => {
        if (!map || !map!.isStyleLoaded()) {
            // log.warn("Map is not initialized.");
            return;
        }
        if (!markerCoords || markerCoords.length !== 2) {
            // log.warn("Invalid marker coordinates:", markerCoords);

            return;
        }
        // log.info("Adding marker to map at coordinates:", markerCoords);

        try {
            new mapboxgl.Marker()
                .setLngLat([markerCoords[0], markerCoords[1]])
                .addTo(map);
            // log.info("Marker added successfully at:", markerCoords);
        } catch (error) {
          // log.error("Error adding marker to map:", error);
        }
    }, [markerCoords, map]);

    useEffect(() => {
        if (!map) {
            // log.warn("Map is not initialized.");
            return;
        }

        map.on("click", (event) => {
            const { lng, lat } = event.lngLat;
            if (setUserCoords) {
                // log.info("Setting user coordinates:", [lng, lat]);
                setUserCoords([lng, lat]);
            }
            if (chooseLocation) {
                // log.info("Creating marker at coordinates:", [lng, lat]);
                const marker = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(map);
    
                setTimeout(() => {
                    // log.info("Removing marker from map after 2 seconds.");
                    marker.remove();
                }, 2000);
            }
        });

        return () => {
            map.off("click", () => {});
            // log.info("Map click event listener removed.");

        };
    }, [map, chooseLocation, setUserCoords]);

    useEffect(() => {
        if (map) return;
        setMap(
            new mapboxgl.Map({
                // @ts-expect-error
                container: mapContainer.current,
                style: process.env.NEXT_PUBLIC_MAPBOX_MAP_STYLE!,
                center: [options.longitude, options.latitude],
                zoom: options.zoom,
                pitch: 0,
                attributionControl: false,
                interactive: viewOnly ?? true,
                // touchPitch: false,
                // pitchWithRotate: false,
            }),
        );
    });

    useEffect(() => {
        if (!map || !map.isStyleLoaded()) {
            return;
        }

        if (queryPath?.length === 0) {
            return;
        }

        const sourceID = "queryPath";
        const layerID = `${sourceID}-layer`;

        if (map.getLayer(layerID)) {
            map.removeLayer(layerID);
        }

        if (map.getSource(sourceID)) {
            map.removeSource(sourceID);
        }

        map?.addSource(sourceID, {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: queryPath!,
                },
                properties: {},
            },
        });

        if (!map?.getLayer(`${sourceID}-layer`)) {
            map?.addLayer({
                id: `${sourceID}-layer`,
                type: "line",
                source: sourceID,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#6B18D8",
                    "line-width": 4,
                },
            });
        }
    }, [map, queryPath]);

    useEffect(() => {
        if (!map || !map.isStyleLoaded()) {
            return;
        }

        if (mapboxPath?.length === 0 || !map) {
            return;
        }

        const sourceID = "mapboxPath";
        const layerID = `${sourceID}-layer`;

        if (map.getLayer(layerID)) {
            map.removeLayer(layerID);
        }

        if (map.getSource(sourceID)) {
            map.removeSource(sourceID);
        }

        map?.addSource(sourceID, {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: mapboxPath!,
                },
                properties: {},
            },
        });

        if (!map?.getLayer(`${sourceID}-layer`)) {
            map?.addLayer({
                id: `${sourceID}-layer`,
                type: "line",
                source: sourceID,
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#ADD8E6",
                    "line-width": 4,
                },
            });
        }
    }, [map, mapboxPath]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/open_businesses`).then((res) => {
            res.json().then((data) => {
                setOpenBuildings(data.body.ids);
            });
        });
        const interval = setInterval(() => {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/open_businesses`).then((res) => {
                res.json().then((data) => {
                    setOpenBuildings(data.body.ids);
                });
            });
        }, REFRESH_BUSINESS_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!map) return;
        map.setPaintProperty("building-extrusion", "fill-extrusion-color", [
            "case",
            ["in", ["id"], ["literal", openBuildings]],
            "#406342",
            "#323842",
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openBuildings]);

    /**
     * mapbox interactivity is negatively impacted by children of
     * container element; necessary variables can be passed through the
     * MapProvider context
     */
    return (
        <div
            ref={mapContainer}
            className={className ?? "fixed right-0 top-0 flex h-full w-full"}
        />
    );
};

export default Map;
