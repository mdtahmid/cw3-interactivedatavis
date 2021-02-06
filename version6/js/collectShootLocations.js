// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// COLLECT all data used in project
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Retrieve Movie Shoot Locations
async function getShootLocations(movieData) {
    await apiCall("movie_locations.json")
        .then(locationData => populateShootLocations(locationData, movieData));
    return movieData
}

function populateShootLocations(locationData, movieData) {
    for (const [key] of Object.entries(movieData)) {
        movieData[key]['shoot_locations'] = locationData[key];
    }
}