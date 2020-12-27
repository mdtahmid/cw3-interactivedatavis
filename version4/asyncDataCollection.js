// Global var for printing text
var verbose = 1;    // 0: Nothing, 1: Main lists, 2: Every loop

// *******************
// MAIN ASYNC FUNCTION
// *******************
// TMDb Top Movies by Revenue API URL
var movie_ranking_url = "https://api.themoviedb.org/3/discover/movie?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US&sort_by=revenue.desc&include_video=false&page=1";

// Make TMDb API Call, then populate details, then credits, then build charts
apiCall(movie_ranking_url)
    .then(value => movieData(value));
    // .then(value => creditsData(value));
    // .then(value => buildCharts(value));



// ********************
// MOVIE DATA FUNCTIONS

// Retrieve and process movieData from api
async function movieData(data) {
    if (verbose !== 0) { console.log("Revenue API Data:", data) }

    // Get Basic & requested Movie Details Data
    var updatedMovieData = await getMovieDetails_Basic(data)
        .then(value => getMovieDetails_Requested(value));


    return updatedMovieData;
} // END: movieData


// Get Movie id & name to populate movieData
async function getMovieDetails_Basic(data) {
    // Store movieData details
    var movieData = {};

    // Loop through results, populate to main dict
    for (var i = 0; i < data['results'].length - 1; i++) {
        var movieID = data['results'][i].id;								// Get Movie ID
        movieData[movieID] = {};											// Initiate Dict w/ movie ID
        movieData[movieID]['name'] = data['results'][i].original_title;	    // Populate w/ movie Name
    } // END: for loop
    return movieData
} // END: getMovieDetails


// Get Requested Data for each movie
async function getMovieDetails_Requested(movieData) {
    // Get ids of all movies
    var movie_id = Object.keys(movieData);

    // Loop through movie_ids and retrieve requested data
    for (var i=0; i<movie_id.length; i++) {

        // Ensure this runs before proceeding
        await getMovieDetails(movieData, movie_id[i]);

        // On last loop, sort all data by revenue
        if (i === movie_id.length-1) {
            if (verbose === 2) { console.log("LastLoop-MovieData:", movieData); }
            sortMoviesByRevenue(movieData);
        }
    }
    return movieData
} // END: getMovieDetails_Requested


// Make API call for each movie, then process data
async function getMovieDetails(movieData, current_movie_id) {
    // TMDb Movie Details API URL
    var movie_detail_url = "https://api.themoviedb.org/3/movie/" + current_movie_id + "?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";

    // Make TMBd API call, then collect details

    await $.getJSON(movie_detail_url, function (data) {
        if (verbose === 2) { console.log("movieDetails-data", movieData); }

        // Movie Details we are interested in
        var requestedMovieDetails = ['revenue', 'budget', 'overview', 'genres', 'belongs_to_collection', 'backdrop_path', 'poster_path', 'popularity','release_date', 'runtime', 'status', 'vote_average', 'vote_count', 'production_countries'];

        // Loop through requested Data
        for (var i = 0; i<requestedMovieDetails.length-1; i++) {
            movieData[current_movie_id][requestedMovieDetails[i]] = data[requestedMovieDetails[i]];
        }
        // Add full poster and backdrop path
        movieData[current_movie_id]['poster_path'] = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + movieData[current_movie_id]['poster_path'];
        movieData[current_movie_id]['backdrop_path'] = "https://image.tmdb.org/t/p/original" + movieData[current_movie_id]['backdrop_path'];
    });

    return movieData
} // END: getMovieDetails


// Sort movies by revenue
function sortMoviesByRevenue(movieData) {
    if (verbose === 2) { console.log("Stringified movieData-Titanic:", JSON.stringify(movieData[597])); }

    // Get items Array
    var data_items = Object.keys(movieData).map(function(key) {
        return [key, movieData[key]['revenue'], movieData[key]['name']]
    });

    // Sort based on revenue
    data_items.sort(function(first, second) { return second[1] - first[1] });
} // END: sortArray



// *****************
// CREDITS FUNCTIONS

// Retrieve Cast & Crew details from credits API call
function creditsData(movieData) {
    // Store all movie IDs
    var movie_id = Object.keys(movieData);

    // Loop through all ids
    movie_id.forEach(function (item) {
        // TMDb Movie Credits API URL
        var moive_credits_url = "https://api.themoviedb.org/3/movie/" + item + "/credits?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";

        // Make TMDb API call, then store general cast/crew details, then store cast/crew statistics
        apiCall(moive_credits_url)
            .then(value => creditsDetails(value, movieData, item))
            .then(value => castStats(value, item));
    });
} // END: creditsData


// Store cast & crew details
function creditsDetails(data, movieData, item) {
    movieData[item]['cast'] = data.cast;
    movieData[item]['crew'] = data.crew;
    movieData[item]['cast_crew'] = combineLists([data.cast, data.crew]);
    movieData[item]['cast_crew_stats'] = {'cast': {}, 'crew': {}, 'overall': {}};


    return movieData
} // END: creditsDetails


// Call Gender count for cast, crew and both
function castStats(movieData, item) {
    getGenderCount(movieData, movieData[item]['cast'], 'cast', item);
    getGenderCount(movieData, movieData[item]['crew'], 'crew', item);
    getGenderCount(movieData, movieData[item]['cast_crew'], 'overall', item);
} // END: castStats


// Split gender count for each group by gender
function getGenderCount(movieData, list, position, item) {
    movieData[item]['cast_crew_stats'][position]['Male'] = getCount(list, 2);
    movieData[item]['cast_crew_stats'][position]['Female'] = getCount(list, 1);
    movieData[item]['cast_crew_stats'][position]['Not Specified'] = getCount(list, 0);
} // END: getGenderCount


// ************
// BUILD CHARTS
// ************






// ****************
// HELPER FUNCTIONS
// ****************

// Make API call, return result
async function apiCall(apiURL) {
    return await $.getJSON(apiURL);
}


// Combine an array of lists together
function combineLists(arrayLists) {
    if (arrayLists.length === 0) { return null}         // If array is empty, return null
    if (arrayLists.length < 2) { return arrayLists[0] } // If only 1 list in array, return list

    var newList = arrayLists[0];                        // Initiate newList w/ 1st list
    var offset = arrayLists[0].length-1;                // Create offset to be length of 1st list

    for (var i=1; i<arrayLists.length; i++) {           // Loop through all lists (after 1st)
        for (var j=0; j<arrayLists[i].length-1; j++) {      // Loop through values in lists
            newList[j+offset] = arrayLists[i];              // Append list w/ offset
        }
        offset += arrayLists[i].length-1;               // Update offset
    }
    return newList                                      // Return new List
} // END: combineLists


// Get count of gender in a dict
function getCount(list, gender) {
    var count = 0;                                          // Var to store gender count
    if (list) {                                             // If list exists, loop through entries
        for (var i=0; i<list.length-1; i++) {
            if (list[i]['gender'] === gender) { count++; }     // Increase count if list gender is gender passed in arg
        }
    }
    return count
} //END getCount