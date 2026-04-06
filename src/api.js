import mockData from './mock-data';

const API_BASE = "https://0sntrgtwpa.execute-api.eu-central-1.amazonaws.com/dev";

// helper endpoints
const AUTH_URL = `${API_BASE}/api/get-auth-url`;
const TOKEN_BASE = `${API_BASE}/api/token`;
const EVENTS_BASE = `${API_BASE}/api/get-events`;
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
        const code = searchParams.get("code");
        if (!code) {
            const response = await fetch(AUTH_URL);
            const result = await response.json();
            const { authUrl } = result;
            window.location.href = authUrl;
            return null;
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

    const token = await getAccessToken();

    if (token && !token.startsWith("http")) {
        removeQuery();
        const encodedToken = encodeURIComponent(token);
        const url = `${EVENTS_BASE}/${encodedToken}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result) {
            localStorage.setItem("lastEvents", JSON.stringify(result.events));
            return result.events;
        } else return null;
    }

    return [];
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
    const response = await fetch(`${TOKEN_BASE}/${encodeCode}`);
    const { access_token } = await response.json();
    access_token && localStorage.setItem("access_token", access_token);
    return access_token;
};