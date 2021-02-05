// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// COLLECT all data used in project
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Retrieve Cast & Crew details from credits API call
async function creditsData(movieData) {
    let movie_id = Object.keys(movieData);

    for (let i=0; i<movie_id.length; i++) {

        // Get Watch Providers
        let movie_watch_providers = "https://api.themoviedb.org/3/movie/" + movie_id[i] + "/watch/providers?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";
        await apiCall(movie_watch_providers)
                .then(resultData => getWatchProviders(resultData, movieData, movie_id[i]));

        // Get Youtube Video Key
        let movie_video_url = "https://api.themoviedb.org/3/movie/" + movie_id[i] + "/videos?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";
        await apiCall(movie_video_url)
            .then(result => { movieData[movie_id[i]]['video_id'] = result['results'][0]['key']; });

        // Make TMDb API call, then store general cast/crew details, then store cast/crew statistics
        let moive_credits_url = "https://api.themoviedb.org/3/movie/" + movie_id[i] + "/credits?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";
        await apiCall(moive_credits_url)
            .then(value => creditsDetails(value, movieData, movie_id[i]))
            .then(value => castStats(value, movie_id[i]));
    }
    return movieData
} // END: creditsData

function getWatchProviders(resultData, movieData, movieId) {
    // MUST attribute the source of the data as JustWatch
    let poster_link = "https://www.themoviedb.org/t/p/original/";

    let buy_providers = resultData.results.GB.buy;
    let flatrate_providers = resultData.results.GB.flatrate;
    let rent_providers = resultData.results.GB.rent;

    let buy_details = [];
    if (buy_providers) {
        buy_providers.forEach(provider => {
            buy_details.push({ name: provider.provider_name, logo_path: poster_link + provider.logo_path });
        });
    }

    let flatrate_details = [];
    if (flatrate_providers) {
        flatrate_providers.forEach(provider => {
            flatrate_details.push({ name: provider.provider_name, logo_path: poster_link + provider.logo_path });
        });
    }

    let rent_details = [];
    if (rent_providers) {
        rent_providers.forEach(provider => {
            rent_details.push({ name: provider.provider_name, logo_path: poster_link + provider.logo_path });
        });
    }

    movieData[movieId]['watch_providers'] = { buy_providers: buy_details, flatrate_providers: flatrate_details, rent_providers: rent_details};
}

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