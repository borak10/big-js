/* ============================================================================
 * services/geolocation.js  —  Geolocation API
 * MËSIMI: Java 10 (Web APIs) + Java 5 (promisifikim i një API me callback)
 *
 * `navigator.geolocation.getCurrentPosition(success, error, options)` është
 * një API i VJETËR, me callback. Ne e mbështjellim në Promise, kështu që
 * pjesa tjetër e aplikacionit përdor `await` si për çdo gjë tjetër.
 * ==========================================================================*/

import { CAMPUS } from "../config.js";
import { AppError } from "../core/errors.js";
import { round } from "../core/utils.js";

export const isSupported = () => "geolocation" in navigator;

/** Përkthen kodet e gabimit të shfletuesit në shqip. */
const GEO_MESSAGES = {
    1: "Ju e refuzuat lejen për lokacion.", // PERMISSION_DENIED
    2: "Lokacioni nuk është i disponueshëm për momentin.", // POSITION_UNAVAILABLE
    3: "Kërkesa për lokacion skadoi.", // TIMEOUT
};

/**
 * @returns {Promise<{lat:number, lng:number, accuracy:number, at:Date}>}
 */
export function getCurrentPosition({ timeout = 10000, highAccuracy = true } = {}) {
    return new Promise((resolve, reject) => {
        if (!isSupported()) {
            reject(new AppError("Shfletuesi i juaj nuk mbështet Geolocation."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            // 1) callback-u i suksesit
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                resolve({
                    lat: latitude,
                    lng: longitude,
                    accuracy: Math.round(accuracy),
                    at: new Date(position.timestamp),
                });
            },
            // 2) callback-u i gabimit
            (error) => {
                reject(new AppError(GEO_MESSAGES[error.code] ?? "Gabim i panjohur me lokacionin."));
            },
            // 3) opsionet
            { timeout, enableHighAccuracy: highAccuracy, maximumAge: 0 }
        );
    });
}

/**
 * Formula Haversine — distanca mbi sferën e Tokës.
 * Bonus matematikë: Math.sin/cos/atan2 dhe konvertimi gradë → radianë.
 */
export function distanceKm(from, to) {
    const EARTH_RADIUS_KM = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;

    return round(2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)), 2);
}

/** Sa larg jeni nga kampusi i 7Scantech? */
export async function distanceFromCampus() {
    const position = await getCurrentPosition();
    return {
        position,
        campus: CAMPUS,
        km: distanceKm(position, CAMPUS),
    };
}

/** Lidhje me OpenStreetMap — pa bibliotekë, pa çelës API. */
export const mapLink = ({ lat, lng }) =>
    `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
