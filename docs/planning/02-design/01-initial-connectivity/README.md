# 2.1 Initial Connectivity Design

## Goal

Design the first connection experience for Tune Traveller so a user can connect a music library, import their favourites playlist, and confirm the imported songs in the app.

## Primary user outcome

A user should understand why Tune Traveller needs music-library access, complete the connection flow, and see their favourite songs listed in a clear, trustworthy way.

## Basic execution plan

1. Sketch a connection screen that explains why YouTube Music access is needed.
2. Define the success state after login, including the connected account label.
3. Design a simple favourites playlist view that lists returned songs clearly.
4. Include empty, loading, and connection-error states for the first version.

## User flow

1. User lands on the initial connectivity screen.
2. User reads a short explanation of what will be connected and what data will be used.
3. User starts the YouTube Music connection flow.
4. App shows a loading state while the connection is verified and favourites are fetched.
5. App shows the connected account and the imported favourites playlist songs.
6. User can review the songs and continue to the next planning step.

## Screen outline

### Connect library

- Headline: "Connect your music library"
- Supporting text: explain that Tune Traveller uses favourite songs to shape travel ideas.
- Primary action: "Connect YouTube Music"
- Secondary content: short privacy note clarifying that only the required library data is used.

### Connection loading

- Show a progress message such as "Connecting to YouTube Music..."
- Disable repeated connection attempts while the request is in progress.
- Keep the user on the same page so the state change feels continuous.

### Connected favourites

- Show a connected account summary.
- Show the favourites playlist title and total song count when available.
- List songs with song name, artist name, album name, and release data.
- Include controls to disconnect or switch accounts.
- Include an obvious next action for moving into cross-reference planning later.

## Required states

| State                   | Design need                                                                    |
| ----------------------- | ------------------------------------------------------------------------------ |
| Not connected           | Explain the value and show the connect action.                                 |
| Connecting              | Confirm that work is in progress and prevent duplicate actions.                |
| Connected with songs    | Show account details, song count, and the song list.                           |
| Connected with no songs | Explain that no favourites were found and suggest checking the source library. |
| Connection failed       | Explain that the connection failed and provide a retry action.                 |

## Content notes

- Keep copy concise and non-technical.
- Use "favourites playlist" consistently in this step.
- Avoid promising travel recommendations until the song data is visible.

## Decisions

- Use the YouTube Music API for authentication and library access.
- The first integration should expect these song fields:
  - Artist name
  - Album name
  - Song name
  - Release data
- Users should be able to disconnect or switch accounts in the first version.
