type Feature = {
    geometry: {
        coordinates: number[] | number[][];
    };
    properties: {
        full_address?: string;
        kind?: string;
    };
};

type FeatureCollection = {
    features: Feature[];
};

type PathQuery = {
    status: number;
    geo_json: string;
    message: string;
};

type UserQueriedPath = {
    status: number,
    body: {
        path: number[][],
    }
}

type GeoJson = {
    type: string;
    features: Feature[];
    properties?: object;
};

type Suggestion = {
    mapbox_id: string,
    name: string,
    full_address: string
}

type MediaType = {
    name: string;
    media_type: string;
    base64: string;
    url: string;
};

type FeedbackFormDataType = {
    type: number | null;
    feedback: string;
    severity: number | null;
    stars: number;
    contact: boolean;
    media: MediaType[];
};

type ReportFormDataType = {
    address: string, 
    coordinates: number[], 
    duration: string, 
    description: string, 
    media: MediaType[], 
    buttonType: string, 
}

export type { Feature, FeatureCollection, PathQuery, GeoJson, UserQueriedPath, Suggestion, FeedbackFormDataType, MediaType, ReportFormDataType };
