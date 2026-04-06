// src/components/EventList.js

import Event from "./Event";

const EventList = ({ events }) => {
    return (
        <ul id="event-list">
            {events ?
                events.map((event, index) => {
                    const key = `${event.id || event.iCalUID || 'event'}-${event.start?.dateTime || event.start?.date || index}`;
                    return <Event key={key} event={event} />;
                }) :
                null}
        </ul>
    );
}

export default EventList;