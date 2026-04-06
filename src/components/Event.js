// src/components/Event.js



import { useState } from "react";

const Event = ({ event }) => {
    const [showDetails, setShowDetails] = useState(false);
    const eventStart = event?.start?.dateTime || event?.start?.date;
    const eventDetails = event?.description || "No details available.";

    const toggleDetails = () => {
        setShowDetails((prevShowDetails) => !prevShowDetails);
    };

    return (
        <li className="event">
            <h2>{event && event.summary}</h2>
            <p>{event && event.location}</p>
            <p>{eventStart ? new Date(eventStart).toUTCString() : ''}</p>
            {showDetails ?
                <p className="details">{eventDetails}</p> :
                null
            }
            <button className="details-btn" onClick={toggleDetails}>{showDetails ? "hide details" : "show details"}</button>
        </li>
    )
}

export default Event;


// const Event = () => {
//     return (
//         <li></li>
//     );
// }

// export default Event;