**Meet is an app to locate great events** 

This app uses both serverless architecture and Open authorization (with Google).

Sytems and programs used:
* Google API and Google OAuth
* AWS Lambda 
* React and TDD techniques

A serverless, progressive web application (PWA) is built with React using a test-driven development (TDD) technique.
The application uses the Google Calendar API to fetch upcoming events, and Google OAuth is used for verification.
The serverless function is implemented using AWS Lambda.

Going serverless for this project helps it be set up faster, as well as enabling it to easily scale in the future, if necessary.

OAuth with Google enables sign-in with safe provider to access protected content, making use of their existing infrastructure. 


Link to deployed page: https://maaikevp.github.io/meet/

![Meet-app-screenshot](/Meet-app-screenshot.JPG)

User stories and scenarios for several features of the app:

* Feature: Filter Events By City
   - User story: As an event attendee, I should be able to filter events based on the city or location, so that I can easily find events happening in my preferred area.

   - Scenario: User filters events by city
    **Given** the user is on the event listing page
    **When** the user selects the city "Berlin"
    **Then** the displayed events should be filtered to show only events in Berlin


* Feature: Show/Hide Event Details
   - User story: As a user browsing event listings, I should be able to toggle the visibility of event details (such as date, time, venue, and description), so that I can quickly             scan through events without overwhelming event information.

   - Scenario: User toggles event details visibility
          **Given** the user is viewing an event listing
          **When** the user clicks the "Show Details" button
          **Then** the event details (date, time, venue, description) should be visible
          And **When** the user clicks the "Hide Details" button
          **Then** the event details should be hidden


* Feature:  Specify Number of Events:
   - User story: As an user browsing event listings, I should be able to specify the maximum number of events displayed on a single page, so that I have a manageable list to browse             or don't have to click 'next page' too often.

   - Scenario: User specifies maximum events per page
          **Given** the User is configuring the app settings
          **When** the User sets the maximum events per page to 10
          **Then** the event listing page should display a maximum of 10 events


* Feature: Use the App When Offline
   - User story: As a frequent traveler or someone with intermittent internet access, I should be able to use the app even when offline, so that I can access event information                without relying on an active internet connection.

   - Scenario: User accesses event information offline
          **Given** the user has previously loaded event data
          **When** the user opens the app without an internet connection
          **Then** the app should display cached event information


* Feature: Add an App Shortcut to the Home Screen
   - User story: As a mobile user, I should be able to add a shortcut to the app on my home screen, so that I can quickly launch it without navigating through other apps or menus.

   - Scenario: User adds app shortcut
          **Given** the user is using a mobile device
          **When** the user adds the app to their home screen
          **Then** a shortcut icon should appear for quick access


* Feature: Display Charts Visualizing Event Details
   - User story: As a clued up user, I should be able to view visual charts or graphs that summarize event data (such as attendance, ticket sales, or popularity), so that I can make          informed decisions related to planning of visits, especially to areas with higher event counts.

   - Scenario: Event analytics user views event summary charts
          **Given** the user is interested in area-specific events or specific kind of events
          **When** the user navigates to the analytics section
          **Then** visual charts summarizing event data should be displayed



