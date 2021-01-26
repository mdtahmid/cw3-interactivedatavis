// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// MAIN FILE for all function calls in this project
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020

// Credits:
// All code created by authors, unless otherwise specified

// Libraries:
// For building charts:
//      Fusion Charts, Chart.js
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*

// Global variables
let verbose = 1;                        // Levels of printing to console. 0: Nothing, 1: Main lists, 2: Every loop
let finalData = {};                     // Store final data retrived from all API calls

// *******************
// MAIN ASYNC FUNCTION
// *******************
// TMDb Top Movies by Revenue API URL
let movie_ranking_url = "https://api.themoviedb.org/3/discover/movie?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US&sort_by=revenue.desc&include_video=false&page=1";

// Make 1st TMDb API call to retrieve Trending movies
apiCall(movie_ranking_url)
    .then(value => movieData(value))        // Collect individual movie details
    .then(value => creditsData(value))      // Collect individual credits details
    .then(value => getAwards(value))        // Collect awards from OMDb
    .then(value => addDomElements(value));  // Add elements to Dom