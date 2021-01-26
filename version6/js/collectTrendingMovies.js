// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// COLLECT main movie data
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Collect Movie Data from TMDB API
async function movieData(data) {
    if (verbose !== 0) { console.log("Revenue API Data:", data) }
    return await getMovieDetails(data);
}


// Populate main Dict w/ dict for each movie ID/Name, then collect requested data
async function getMovieDetails(data) {
    let movieData = {};

    for (let i = 0; i < data['results'].length - 1; i++) {
        let movieID = data['results'][i].id;								// Get Movie ID
        movieData[movieID] = {};											// Initiate Dict w/ movie ID
        movieData[movieID]['name'] = data['results'][i].original_title;	    // Populate w/ movie Name
    }

    movieData = getMovieDetails_Requested(movieData);
    return movieData
}


// Loop through each movie, getting requested data
async function getMovieDetails_Requested(movieData) {
    for (let i=0; i<Object.keys(movieData).length; i++) {
        await getSpecificMovieDetails(movieData, Object.keys(movieData)[i]);
    }
    return movieData
}


// Make custom API call for each movie, collect all requested data
async function getSpecificMovieDetails(movieData, current_movie_id) {
    let movie_detail_url = "https://api.themoviedb.org/3/movie/" + current_movie_id + "?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";

    await $.getJSON(movie_detail_url, function (data) {
        if (verbose === 2) { console.log("movieDetails-data", movieData); }

        let requestedMovieDetails = ['revenue', 'budget', 'overview', 'genres', 'belongs_to_collection', 'backdrop_path', 'poster_path', 'popularity','release_date', 'runtime', 'status', 'vote_average', 'vote_count', 'production_countries', 'production_companies', 'spoken_languages', 'imdb_id'];

        for (let i = 0; i<requestedMovieDetails.length; i++) {
            movieData[current_movie_id][requestedMovieDetails[i]] = data[requestedMovieDetails[i]];
        }
        // Add full poster and backdrop path
        movieData[current_movie_id]['poster_path'] = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + movieData[current_movie_id]['poster_path'];
        movieData[current_movie_id]['backdrop_path'] = "https://image.tmdb.org/t/p/original" + movieData[current_movie_id]['backdrop_path'];

        addPosters(movieData);
    });

    return movieData
}