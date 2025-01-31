"use client";

import React, { useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import log from "@/logger";

mapboxgl.accessToken = `${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

interface MapContextProps {
    map: mapboxgl.Map | null;
    setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | null>>;

    moving: boolean;
    moveMap: (options: mapboxgl.EaseToOptions) => Promise<void>;

    enableInteraction: () => void;
    disableInteraction: () => void;
}

const INITIAL_MAP_STATE = {
    map: null,
    setMap: () => {},

    moving: false,
    moveMap: async () => {},

    enableInteraction: () => {},
    disableInteraction: () => {},
};

const MapContext = React.createContext<MapContextProps>(INITIAL_MAP_STATE);

const useMap = () => {
    const mapContext = React.useContext(MapContext);
    if (mapContext === undefined) {
        throw new Error("useMap must be inside a MapProvider");
    }
    return mapContext;
};

interface MapProviderProps {
    children?: React.ReactNode;
}

const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [moving, setMoving] = useState<boolean>(false);

    const disableInteraction = useCallback(() => {
        if (!map) return;
        map.boxZoom.disable();
        map.dragPan.disable();
        map.doubleClickZoom.disable();
        map.dragRotate.disable();
        map.keyboard.disable();
        map.scrollZoom.disable();
        map.touchPitch.disable();
        map.touchZoomRotate.disable();
    }, [map]);

    const enableInteraction = useCallback(() => {
        if (!map) return;
        map.boxZoom.enable();
        map.dragPan.enable();
        map.doubleClickZoom.enable();
        map.dragRotate.enable();
        map.keyboard.enable();
        map.scrollZoom.enable();
        map.touchPitch.enable();
        map.touchZoomRotate.enable();
    }, [map]);

    const moveMap = useCallback(
        async (options: mapboxgl.EaseToOptions) => {
            if (!map) {
              // log.warn("Map is not initialized, cannot move map.");
                return;
            }
          // log.info("Moving map with options:", options);

            setMoving(true);

          // log.debug("Set moving state to true.");


            try {
                map.easeTo(options);
              // log.debug("Map easeTo called with options:", options);
    
                await new Promise((resolve) =>
                    setTimeout(resolve, options.duration! + 100),
                );
    
              // log.debug("Map move completed after", options.duration! + 100, "ms");
            } catch (error) {
              // log.error("Error while moving map:", error);
            }
    

            setMoving(false);
        },
        [map],
    );

    return (
        <MapContext.Provider
            value={{
                map,
                setMap,
                moving,
                moveMap,
                enableInteraction,
                disableInteraction,
            }}
        >
            {children}
        </MapContext.Provider>
    );
};

export { useMap };
export default MapProvider;
