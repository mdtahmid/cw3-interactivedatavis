// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// COLLECT all data used in project
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Get awards from each movie by running a API call to OMDb on each movie in the movieData dict
async function getAwards(movieData) {
    let movieID = Object.keys(movieData);   // Get movie Ids of all movies in dict

    // Loop through all movies by ID
    for (let i=0; i<movieID.length; i++) {
        // OMDb API URL for each movie
        let awards_omdb_url = 'https://www.omdbapi.com/?apikey=874a2978&i=' + movieData[movieID[i]].imdb_id;

        // Make API call, then and retrieve results
        await apiCall(awards_omdb_url)
            .then(value => awardsDetails(value, movieData, movieID[i]))
    }
    if (verbose !== 0) { console.log("Post Awards Data:", movieData); }

    // Store final movie data globally
    finalData = movieData;

    return movieData
} // END: getAwards


// Clean OMDb API response and populate main dict
function awardsDetails(data, movieData, item) {
    // Remove words from OMDb response, keep only numbres as an array
    let awardNumbers = data.Awards.match(/\d+/g).map(Number);

    // Create a new entry in the main movieData dict for awards
    movieData[item]['awards'] = {};

    // If OMDb returned only two numbers, then movie had no oscars
    // Fill entries of dict accordingly
    if (awardNumbers.length === 2) {
        movieData[item]['awards'].oscars = 0;
        movieData[item]['awards'].wins = awardNumbers[0];
        movieData[item]['awards'].nominations = awardNumbers[1];
    } else {
        movieData[item]['awards'].oscars = awardNumbers[0];
        movieData[item]['awards'].wins = awardNumbers[1];
        movieData[item]['awards'].nominations = awardNumbers[2];
    }
} // END: awardsDetails