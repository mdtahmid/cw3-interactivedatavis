// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// COLLECT all data used in project
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

// Add all elements to dom
function addAllDomElements(formattedData) {
    let default_id = '299534';                          // Default is currently #1 movie Avengers:Endgame
    let default_index = 0;

    addTrending(formattedData);                         // Add trending posters to top of Dom
    expandMovieDetails(formattedData, default_id, default_index);   // Expand 1st Movie Details
    addMovieDetails(formattedData, default_id, default_index);         // Add movie details
    addAwardsDetails(formattedData, default_id);

    // Add Movie Budget/Revenue
    let domBudgetDetails = { "budget-text": "Budget: " + formattedData[default_id].budget, "revenue-text": "Revenue: " + formattedData[default_id].revenue };
    addDomElements('budgetRevenue', domBudgetDetails, 'Budget vs. Box Office');

    // Add Film Locations
    let domLocationDetails = {};
    for (let i=0; i< Object.keys(formattedData[default_id]['production_countries']).length; i++) {
        domLocationDetails['location_'+i] = "Location: " + formattedData[default_id]['production_countries'][i].name;
    }
    addDomElements('filmLocations', domLocationDetails, 'Film Shoot Locations');


    //addCharts(formattedData);                     // Add charts to corresponding sections
} // END: addAllDomElements


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

    // Initialise custom scrollbar
    new SimpleBar(document.getElementById('scrollWrapper1'));

} // END: addTrending


// Update page contents on poster click
function updateContents(movieId, index) {
    // Update BgImage
    document.getElementById('bgImage').style.backgroundImage = "url('" + finalData[movieId].backdrop_path + "')";

    expandMovieDetails(finalData, movieId, index);
    // Update Movie Details
    addMovieDetails(finalData, movieId, index);

    // Update Awards
    addAwardsDetails(finalData, movieId);

    // Add Movie Budget/Revenue
    let domBudgetDetails = { "budget-text": "Budget: " + finalData[movieId].budget, "revenue-text": "Revenue: " + finalData[movieId].revenue };
    addDomElements('budgetRevenue', domBudgetDetails, 'Budget vs. Box Office');

    // Add Film Locations
    let domLocationDetails = {};
    for (let i=0; i< Object.keys(finalData[movieId]['production_countries']).length; i++) {
        domLocationDetails['location_'+i] = "Location: " + finalData[movieId]['production_countries'][i].name;
    }
    addDomElements('filmLocations', domLocationDetails, 'Film Shoot Locations');
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

    // Info Container
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
    movieInfoWrapper.appendChild(overview_container);

    readMoreText(); //run read more function
} // END: addMovieDetails

function addAwardsDetails(formattedData, movieId) {
    let awards_container = getContainerWithTitle('movieAwards', 'Awards & Nominations');
    let award_content_container = customElement('div', 'center', '', 'award-content');

    for (const element in formattedData[movieId].awards) {
        let el_container = document.createElement('div');
        el_container.className = 'award-container';

        let value_icon_container = document.createElement('div');
        value_icon_container.className = 'icon-value-container';

        let value = customElement('p', 'award-value', formattedData[movieId]['awards'][element].value);
        let icon = customElement('img', 'award-img', '');
        icon.src = formattedData[movieId]['awards'][element].src;

        value_icon_container.appendChild(value);
        value_icon_container.appendChild(icon);

        let name = customElement('p', 'award-name', element);

        el_container.appendChild(value_icon_container);
        el_container.appendChild(name);

        award_content_container.appendChild(el_container);
    }
    awards_container.appendChild(award_content_container);

}

// Get & clear DOM container, add title
function getContainerWithTitle(containerId, containerTitle) {
    let element_container = document.getElementById(containerId);
    element_container.textContent = '';
    element_container.appendChild(customElement('h2', 'viz-title', containerTitle));
    return element_container
}

// Abstract function to add an object of data into a given container, specifying a title
function addDomElements(container_id, elements, element_title) {
    // Get and clear container
    let element_container = document.getElementById(container_id);
    element_container.textContent = '';

    // Add title
    element_container.appendChild(customElement('h2', 'viz-title', element_title));

    // Add all elements to dom
    for (const el in elements) {
        element_container.appendChild(customElement('p', el, elements[el]));
    }
}



// Add Posters once api call made
function addPosters(formattedData) {
    // Set BgImg to be first Trending Movie
    let bgImg = document.getElementById('bgImage');
    bgImg.style.backgroundImage = "url('" + formattedData[299534].backdrop_path + "')";
    bgImg.style.backgroundPosition = "center 8%";     // Forces poster to start from top of screen
    bgImg.style.backgroundSize = "100%";         // narrows over screen width but shows more content. Increase percentage and bgImg height

    // addTrending(formattedData);
}