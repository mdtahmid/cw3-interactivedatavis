// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// COLLECT all data used in project
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Add all elements to dom
function addDomElements(formattedData) {
    let default_id = '299534';                          // Default is currently #1 movie Avengers:Endgame
    let default_index = 0;

    addTrending(formattedData);                         // Add trending posters to top of Dom
    expandMovieDetails(formattedData, default_id, default_index);   // Expand 1st Movie Details
    addMovieDetails(formattedData, default_id, default_index);         // Add movie details
    addMovieAwards(formattedData, default_id);          // Add Movie Awards
    addBudgetChart(formattedData, default_id);          // Add movie budget vs revenue
    addFilmLocations(formattedData, default_id);

    //addCharts(formattedData);                     // Add charts to corresponding sections
} // END: addDomElements


// Add trending posters to Dom
function addTrending(formattedData) {
    let moviesSorted = sortMoviesByRevenue(formattedData);
    // Loop through all movies
    moviesSorted.forEach((movieData, index) => {
        // Create wrapper div container
        let movieWrapper = document.createElement('div');
        movieWrapper.className = 'movieWrapper';

        // Create movie title [currently not used. Add as child to movieWrapper if needed]
        let title = document.createElement('p');
        title.className = 'movieTitle';
        title.innerHTML = formattedData[movieData[0]].name;

        // Create poster img element
        let moviePoster = document.createElement('img');
        moviePoster.className = 'movieImage';
        moviePoster.id = movieData[0];
        moviePoster.setAttribute('onclick', 'updateContents(' + movieData[0] + ',' + index + ')');
        moviePoster.src = formattedData[movieData[0]].poster_path;

        let detailElement = document.createElement('div');
        detailElement.className = 'inline-movie-details';
        detailElement.id = 'movieDetail_' + index;

        // Append elements to Dom
        document.getElementById('scrollWrapper1').appendChild(movieWrapper);
        movieWrapper.appendChild(moviePoster);
        movieWrapper.appendChild(detailElement);
    });

    // Set BgImg to be first Trending
    let bgImg = document.getElementById('bgImage');
    bgImg.style.backgroundImage = "url('" + formattedData[moviesSorted[0][0]].backdrop_path + "')";
    bgImg.style.backgroundPosition = "center 8%";     // Forces poster to start from top of screen
    bgImg.style.backgroundSize = "100%";         // narrows over screen width but shows more content. Increase percentage and bgImg height
    // bgImg.style.backgroundRepeat = "repeat-x"; // repeats background horizontally

    new SimpleBar(document.getElementById('scrollWrapper1')); //initalise the custom scrollbar

} // END: addTrending


// Update page contents on poster click
function updateContents(movieId, index) {
    // Update BgImage
    document.getElementById('bgImage').style.backgroundImage = "url('" + finalData[movieId].backdrop_path + "')";

    expandMovieDetails(finalData, movieId, index);
    // Update Movie Details
    addMovieDetails(finalData, movieId, index);
    // Update Awards
    addMovieAwards(finalData, movieId);
    // Update revenue/budget
    addBudgetChart(finalData, movieId);
    // Update film locations
    addFilmLocations(finalData, movieId);
} // END: updateBgImg

// Add Movie Details to DOM
function addMovieDetails(formattedData, movie_id, index) {
    // Get movie details container
    let details_container = document.getElementById('movieDetail_'+index);
    details_container.textContent = '';         // Remove content before adding new elements

    // Header for movie main details
    let movieHeader = document.createElement('div');
    movieHeader.className = "movieHeader";

    //Wrapper for title, release data and genre types
    let movieTitleWrapper = document.createElement('div');
    movieTitleWrapper.className = "movieTitleWrapper";

    // Movie Title & Year Elements
    let movieTitle = customElement('p', 'movieTitle-Expanded', formattedData[movie_id].name);
    let movieYear = customElement('span', 'movieYear', formattedData[movie_id]['release_date'].split('-')[0]);
    // Add Movie Year span within Movie Title
    movieTitle.appendChild(movieYear);

    // Movie Genres
    let movieGenres = customElement('p', 'movieGenres', formattedData[movie_id].genres.map((key) => key.name ).join(', '));

    // Rating container & Text element
    let movieRating = document.createElement('div');
    movieRating.className = "movieRating-container";
    let movieTextWrapper = document.createElement('div');
    movieTextWrapper.className = "movieTextWrapper";
    let rating = customElement('p',"movieRating-text", formattedData[movie_id]['vote_average']);
    movieTextWrapper.appendChild(rating);
    movieRating.appendChild(movieTextWrapper);        // Append rating text to rating div

    // Movie length
    let movieLength = customElement('p', 'movieLength', formatRunTime(formattedData[movie_id].runtime));

    // Append elements to Movie Header
    movieTitleWrapper.appendChild(movieTitle);
    movieTitleWrapper.appendChild(movieGenres);
    movieHeader.appendChild(movieTitleWrapper);
    movieHeader.appendChild(movieRating);
    movieRating.appendChild(movieLength);

    // Details Container
    let movieDetails = document.createElement('div');
    movieDetails.className = "movieDetails-container";

    // Details Container
    let movieInfoWrapper = document.createElement('div');
    movieInfoWrapper.className = "movieInfo-wrapper";

    // Dict of all elements and values for Details section
    let detailsElements = {
        "Directors": getMembers('Directing', formattedData, movie_id),
        "Writers": getMembers('Writing', formattedData, movie_id),
        "Release Date": formatDate(formattedData[movie_id].release_date),
        "Country": formattedData[movie_id]['production_companies'][0].origin_country,
        "Language": formattedData[movie_id]['spoken_languages'][0].english_name
    };

    let movie_details_heading = customElement('p', 'movie_details_heading', 'Details');
    movieDetails.appendChild(movie_details_heading);

    // Add all Elements to Div as paragraphs
    for (const elements in detailsElements) {
        movieDetails.appendChild(customElement('p', "movieDetails details-"+elements, "<span>" + elements + "</span><span>: " + detailsElements[elements] + "</span>"));
    }

    // Create div and content for Details Overview
    let overview_container = customElement('div', 'overview-container', '');
    let overview_heading = customElement('p', 'overview-heading', 'Overview');
    let overview_text = customElement('p', 'details-Overview', formattedData[movie_id].overview);
    overview_container.appendChild(overview_heading);
    overview_container.appendChild(overview_text);

    // Append contents to container
    details_container.appendChild(movieHeader);
    details_container.appendChild(movieInfoWrapper);
    movieInfoWrapper.appendChild(movieDetails);
    movieInfoWrapper.appendChild((overview_container))

    readMoreText(); //run read more function
} // END: addMovieDetails


// Add Movie AwardsDetails to DOM
function addMovieAwards(formattedData, movie_id) {
    // Get movie Awards container
    let awards_container = document.getElementById('movieAwards');
    awards_container.textContent = '';

    let awards = formattedData[movie_id].awards;

    for (const elements in awards) {
        awards_container.appendChild(customElement('p', "award-"+elements, elements + ": " + awards[elements]));
    }
} // END: addMovieAwards


// Add Budget vs Revenue to DOM
function addBudgetChart(formattedData, movie_id) {
    let budget_container = document.getElementById('budgetRevenue');
    budget_container.textContent = '';

    let percentageFilled = formattedData[movie_id].budget / formattedData[movie_id].revenue * 100;

    console.log("percentage:", percentageFilled);

    budget_container.appendChild(customElement('p', 'budget-text', "Budget: "+formattedData[movie_id].budget));
    budget_container.appendChild(customElement('p', 'revenue-text', "Revenue: "+formattedData[movie_id].revenue));
} // END: addBudgetChart


function addFilmLocations(formattedData, movie_id) {
    let location_container = document.getElementById('filmLocations');
    location_container.textContent = '';

    let film_location = formattedData[movie_id].production_countries;

    for (let i=0; i<Object.keys(film_location).length; i++) {
        let country = film_location[Object.keys(film_location)[i]].name;
        console.log("Country:", country);
        location_container.appendChild(customElement('p', 'location', "Location: " + country));
    }
}