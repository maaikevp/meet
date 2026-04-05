// import mockData from './mock-data';
import NProgress from 'nprogress';



const API_BASE = "https://klo6z6tipjjvupwqa324sndpny0ojpkb.lambda-url.eu-central-1.on.aws";

// helper endpoints
const AUTH_URL = API_BASE ? `${API_BASE}/get-auth-url` : null;
const TOKEN_BASE = API_BASE ? `${API_BASE}/token` : null;
const EVENTS_BASE = API_BASE ? `${API_BASE}/get-events` : null;
/**
 * 
 * 
 * 
 *  * @param {*} events:
 * The following function should be in the “api.js” file.
 * This function takes an events array, then uses map to create a new array with only locations.
 * It will also remove all duplicates by creating another new array using the spread operator and spreading a Set.
 * The Set will remove all duplicates from the array.
 */
export const extractLocations = (events) => {
    const extractedLocations = events.map((event) => event.location);
    const locations = [...new Set(extractedLocations)];
    return locations;
};

/**
 *
 * This function will fetch the list of all events
 */


// export const getEvents = async () => {
//     return mockData;


// // CHECK ACCESS TOKEN

export const getAccessToken = async () => {

    const accessToken = localStorage.getItem('access_token');

    const tokenCheck = accessToken && (await checkToken(accessToken));

    if (!accessToken || tokenCheck.error) {
        await localStorage.removeItem("access_token");
        const searchParams = new URLSearchParams(window.location.search);
        const code = await searchParams.get("code");
        if (!code) {
            if (!AUTH_URL) {
                throw new Error("API_BASE not configured for auth-server.");
            }
            const response = await fetch(AUTH_URL);
            const result = await response.json();
            const { authUrl } = result;
            return (window.location.href = authUrl);
        }
        return code && getToken(code);
    }
    return accessToken;
};



const checkToken = async (accessToken) => {
    const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );
    const result = await response.json();
    return result;
};



export const getEvents = async () => {
    if (window.location.href.startsWith("http://localhost")) {
        return mockData;
    }


    if (!navigator.onLine) {
        const data = localStorage.getItem("lastEvents");
        NProgress.done();
        return data ? JSON.parse(data).events : [];
    }

    const token = await getAccessToken();

    if (token) {
        removeQuery();
        if (!EVENTS_BASE) throw new Error("API_BASE not configured for get-events.");
        const url = `${EVENTS_BASE}/${token}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result) {
            NProgress.done();
            localStorage.setItem("lastEvents", JSON.stringify(result.events));
            return result.events;
        } else return null;
    }
};

const removeQuery = () => {
    let newurl;
    if (window.history.pushState && window.location.pathname) {
        newurl =
            window.location.protocol +
            "//" +
            window.location.host +
            window.location.pathname;
        window.history.pushState("", "", newurl);
    } else {
        newurl = window.location.protocol + "//" + window.location.host;
        window.history.pushState("", "", newurl);
    }
};

const getToken = async (code) => {
    const encodeCode = encodeURIComponent(code);
    if (!TOKEN_BASE) throw new Error("API_BASE not configured for token exchange.");
    const response = await fetch(`${TOKEN_BASE}/${encodeCode}`);
    const { access_token } = await response.json();
    access_token && localStorage.setItem("access_token", access_token);
    return access_token;
};