// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// MAIN FILE for making API calls, Storing relevant data, and populating the DOM
// with elements and data
// Created by Damien Pilat and Mohammed Tahmid.
// Project started in December 2020
//
// Credits:
// Code written entirely by the authors mentioned above, unless otherwise specified
//
// Libraries:
// For Building Charts:
//      FusionCharts, Chart.js
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-


// Global variables
var verbose = 1;                        // Levels of printing to console. 0: Nothing, 1: Main lists, 2: Every loop
var finalData = {};                     // Store final data retrived from all API calls



// *******************
// MAIN ASYNC FUNCTION
// *******************
// TMDb Top Movies by Revenue API URL
var movie_ranking_url = "https://api.themoviedb.org/3/discover/movie?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US&sort_by=revenue.desc&include_video=false&page=1";

// Make 1st TMDb API call to retrieve Trending movies
apiCall(movie_ranking_url)
    .then(value => movieData(value))        // Collect individual movie details
    .then(value => creditsData(value))      // Collect individual credits details
    .then(value => getAwards(value))        // Collect awards from OMDb
    .then(value => addDomElements(value));  // Add elements to Dom
    // .then(value => buildCharts(value));  // Build charts using Fusion & Chart.js


// ********************
// MOVIE DATA FUNCTIONS

// Retrieve and process movieData from api
async function movieData(data) {
    if (verbose !== 0) { console.log("Revenue API Data:", data) }

    // Get Basic & requested Movie Details Data
    return await getMovieDetails_Basic(data)
        .then(value => getMovieDetails_Requested(value));
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
        var requestedMovieDetails = ['revenue', 'budget', 'overview', 'genres', 'belongs_to_collection', 'backdrop_path', 'poster_path', 'popularity','release_date', 'runtime', 'status', 'vote_average', 'vote_count', 'production_countries', 'production_companies', 'spoken_languages', 'imdb_id'];

        // Loop through requested Data
        for (var i = 0; i<requestedMovieDetails.length; i++) {
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


    // Add rank to movie entry
    for (var i=0; i<data_items.length-1; i++) {
        movieData[data_items[i][0]]['rank'] = i+1;
    }

    return data_items
} // END: sortArray


// *****************
// CREDITS FUNCTIONS

// Retrieve Cast & Crew details from credits API call
async function creditsData(movieData) {
    // Store all movie IDs
    var movie_id = Object.keys(movieData);

    // Loop through all movie ids
    for (var i=0; i<movie_id.length; i++) {
        // TMDb Movie Credits API URL
        var moive_credits_url = "https://api.themoviedb.org/3/movie/" + movie_id[i] + "/credits?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";

        // Make TMDb API call, then store general cast/crew details, then store cast/crew statistics
        await apiCall(moive_credits_url)
            .then(value => creditsDetails(value, movieData, movie_id[i]))
            .then(value => castStats(value, movie_id[i]));
    }

    return movieData
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


// Get awards from each movie by running a API call to OMDb on each movie in the movieData dict
async function getAwards(movieData) {
    var movieID = Object.keys(movieData);   // Get movie Ids of all movies in dict

    // Loop through all movies by ID
    for (var i=0; i<movieID.length; i++) {
        // OMDb API URL for each movie
        var awards_omdb_url = 'https://www.omdbapi.com/?apikey=874a2978&i=' + movieData[movieID[i]].imdb_id;

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
    var awardNumbers = data.Awards.match(/\d+/g).map(Number);

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


// Add all elements to dom
function addDomElements(formattedData) {
    var default_id = '299534';                          // Default is currently #1 movie Avengers:Endgame
    var default_index = 0;

    addTrending(formattedData);                         // Add trending posters to top of Dom
    expandMovieDetails(formattedData, default_id, default_index);   // Expand 1st Movie Details
    addMovieDetails(formattedData, default_id, default_index);         // Add movie details
    addMovieAwards(formattedData, default_id);          // Add Movie Awards
    addBudgetChart(formattedData, default_id);          // Add movie budget vs revenue

    //addCharts(formattedData);                     // Add charts to corresponding sections
} // END: addDomElements


// Add trending posters to Dom
function addTrending(formattedData) {
    var moviesSorted = sortMoviesByRevenue(formattedData);
    // Loop through all movies
    moviesSorted.forEach((movieData, index) => {
        // Create wrapper div container
        var movieWrapper = document.createElement('div');
        movieWrapper.className = 'movieWrapper';

        // Create movie title [currently not used. Add as child to movieWrapper if needed]
        var title = document.createElement('p');
        title.className = 'movieTitle';
        title.innerHTML = formattedData[movieData[0]].name;

        // Create poster img element
        var moviePoster = document.createElement('img');
        moviePoster.className = 'movieImage';
        moviePoster.id = movieData[0];
        moviePoster.setAttribute('onclick', 'updateContents(' + movieData[0] + ',' + index + ')');
        moviePoster.src = formattedData[movieData[0]].poster_path;

        var detailElement = document.createElement('div');
        detailElement.className = 'inline-movie-details';
        detailElement.id = 'movieDetail_' + index;

        // Append elements to Dom
        document.getElementById('scrollWrapper1').appendChild(movieWrapper);
        movieWrapper.appendChild(moviePoster);
        movieWrapper.appendChild(detailElement);
    });

    // Set BgImg to be first Trending
    var bgImg = document.getElementById('bgImage');
    bgImg.style.backgroundImage = "url('" + formattedData[moviesSorted[0][0]].backdrop_path + "')";
    bgImg.style.backgroundPosition = "Top";     // Forces poster to start from top of screen
    bgImg.style.backgroundSize = "80%";         // narrows over screen width but shows more content. Increase percentage and bgImg height

    // new SimpleBar(document.getElementById('scrollWrapper1')); // initialise the custom scrollbar

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
} // END: updateBgImg


// Expand Movie Details
function expandMovieDetails(formattedData, movieId, index) {
    // Movie Wrapper, toggle Expanded
    toggleClassName('movieWrapper', 'wrapperExpanded', index);
    // Movie Details, toggle Expanded
    toggleClassName('inline-movie-details', 'detailsExpanded', index);
} // END: expandMovieDetails


// Toggle a class name for a given set of elements retrieved by class name (Currently: define target Index for class)
function toggleClassName(targetElementClassName, toggledClassName, elementIndex) {
    var domElements = document.getElementsByClassName(targetElementClassName);
    Array.from(domElements).forEach(element => element.classList.remove(toggledClassName));
    domElements[elementIndex].className += " "+toggledClassName;
} // END removeOthersAddClass


// Add Movie Details to DOM
function addMovieDetails(formattedData, movie_id, index) {
    // Get movie details container
    var details_container = document.getElementById('movieDetail_'+index);
    details_container.textContent = '';         // Remove content before adding new elements

    // Header for movie main details
    var movieHeader = document.createElement('div');
    movieHeader.className = "movieHeader";

    //Wrapper for title, release data and genre types
    var movieTitleWrapper = document.createElement('div');
    movieTitleWrapper.className = "movieTitleWrapper";

    // Movie Title & Year Elements
    var movieTitle = customElement('p', 'movieTitle-Expanded', formattedData[movie_id].name);
    var movieYear = customElement('span', 'movieYear', formattedData[movie_id]['release_date'].split('-')[0]);
    // Add Movie Year span within Movie Title
    movieTitle.appendChild(movieYear);

    // Movie Genres
    var movieGenres = customElement('p', 'movieGenres', formattedData[movie_id].genres.map((key) => key.name ).join(', '));

    // Rating container & Text element
    var movieRating = document.createElement('div');
    movieRating.className = "movieRating-container";
    var rating = customElement('p',"movieRating-text", formattedData[movie_id]['vote_average']);
    movieRating.appendChild(rating);        // Append rating text to rating div

    // Movie length
    var movieLength = customElement('p', 'movieLength', formatRunTime(formattedData[movie_id].runtime));

    // Append elements to Movie Header
    movieTitleWrapper.appendChild(movieTitle);
    movieTitleWrapper.appendChild(movieGenres);
    movieHeader.appendChild(movieTitleWrapper);
    movieHeader.appendChild(movieRating);
    movieRating.appendChild(movieLength);

    // Details Container
    var movieDetails = document.createElement('div');
    movieDetails.className = "movieDetails-container";

    // Dict of all elements and values for Details section
    var detailsElements = {
        "Directors": getMembers('Directing', formattedData, movie_id),
        "Writers": getMembers('Writing', formattedData, movie_id),
        "Release Date": formatDate(formattedData[movie_id].release_date),
        "Country": formattedData[movie_id]['production_companies'][0].origin_country,
        "Language": formattedData[movie_id]['spoken_languages'][0].english_name,
        "Overview": formattedData[movie_id].overview
    };

    // Add all Elements to Div as paragraphs
    for (const elements in detailsElements) {
        movieDetails.appendChild(customElement('p', "details-"+elements, elements + ": " + detailsElements[elements]));
    }

    // Append contents to container
    details_container.appendChild(movieHeader);
    details_container.appendChild(movieDetails);
} // END: addMovieDetails


// Add Movie AwardsDetails to DOM
function addMovieAwards(formattedData, movie_id) {
    // Get movie Awards container
    var awards_container = document.getElementById('movieAwards');
    awards_container.textContent = '';

    var awards = formattedData[movie_id].awards;

    for (const elements in awards) {
        awards_container.appendChild(customElement('p', "award-"+elements, elements + ": " + awards[elements]));
    }
} // END: addMovieAwards


// Add Budget vs Revenue to DOM
function addBudgetChart(formattedData, movie_id) {
    var budget_container = document.getElementById('budgetRevenue');
    budget_container.textContent = '';

    var percentageFilled = formattedData[movie_id].budget / formattedData[movie_id].revenue * 100;

    console.log("percentage:", percentageFilled);
    
    budget_container.appendChild(customElement('p', 'budget-text', "Budget: "+formattedData[movie_id].budget));
    budget_container.appendChild(customElement('p', 'revenue-text', "Revenue: "+formattedData[movie_id].revenue));
} // END: addBudgetChart

// ************
// BUILD CHARTS

// Build Charts from data
function addCharts(formatedData) {
    buildRevenueChart(formatedData);
    buildGenderChart(formatedData);
} // END: bulidCharts

// Build Revenu chart using Fusion Charts
function buildRevenueChart(formatedData) {
    var sortedArray = sortMoviesByRevenue(formatedData);

    // Pull name & revenue from movieData
    var data = sortedArray.map(function(key) {
        return {
            "label": formatedData[key[0]]['name'],
            "value": formatedData[key[0]]['revenue']
        }
    });

    var highestGrossingChart = new FusionCharts({
        type: 'bar2d',
        renderAt: 'revenue-chart-container',
        width: '100%',
        height: '100%',
        dataFormat: 'json',
        dataSource: {
                "chart": {
                    caption: "Highest grossing movies of all time",
                    yaxisname: "Box office gross ($)",
                    aligncaptionwithcanvas: "0",
                    plottooltext: "<b>$dataValue</b> revenue",
                    theme: "fusion"
                },
                "data": data
            }
    }).render();
} // END: buildRevenueChart


// Build Gender chart using Chart.js
function buildGenderChart(formatedData) {
    // When DOM loaded
    $(document).ready(function() {
        // Define data options
        var gender_data_options = {
            backgroundColor: ['rgba(153,207,255,1)', 'rgba(51,160,255,1)', 'rgba(209,233,255,1)'],
        };
        // Define chart options
        var gender_chart_options = basicChartOptions('Cast & Crew Gender Divide', true);
        // Build chart
// NOTE: change movie id here!!
        buildChart('#gender-split-chart', formatedData[19995].cast_crew_stats.overall, 'doughnut', gender_data_options, gender_chart_options);
    });
} // END: buildChartJS


// Build Chart based on supplied elements
// canvasID: string starting with '#' of id in DOM, data: array of int/float values, chartType: str of viable chrat type,
// dataOptions: list of viable data options, chartOptions: list of viable chart options
function buildChart(canvasID, data, chartType, dataOptions, chartOptions) {
    let chartCanvas = $(canvasID);                          // Get element from DOM based on supplied ID
    let chartData = populateChartData(data, dataOptions);   // Get list of data w/ labels and options
    // Build chart
    chartBuild(chartCanvas, chartType, chartData, chartOptions)
} // END: buildChart


// Build chart onto DOM
// chartCanvas: tag to DOM element, chartType: str of viable chart type, chartData: list of data,labels,dataOptions,
// chartOptions: list of chart options
function chartBuild(chartCanvas, chartType, chartData, chartOptions) {
    let newChart = new Chart(chartCanvas, {
        type: chartType,
        data: chartData,
        options: chartOptions
    });
} //END: chartBuild


// **************** //
// HELPER FUNCTIONS
// **************** //

// **********
// API HELPER

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

// Get all members of a given cast/crew department and return as a string
function getMembers(role, formattedData, movie_id) {
    var directors = "";
    // Loop through all directors
    for (var i=0; i<formattedData[movie_id]['cast_crew'].length-1;i++) {
        if (formattedData[movie_id]['cast_crew'][i].known_for_department === role) {
            directors += formattedData[movie_id]['cast_crew'][i].name + ", ";
        }
    }
    return directors.slice(0, directors.length-2);
} // END: getDirectors

// Create elements with a given class name and inner text
function customElement(type, className, text) {
    var newElement = document.createElement(type);
    newElement.className = className;
    newElement.innerHTML = text;
    return newElement;
}

// Format TMDb date format to: 25th December 2020
function formatDate(date) {
    var splitDate = date.split('-');                                    // Split date at char
    var getOrdinal = n => [,'st','nd','rd'][n/10%10^1&&n%10]||'th';     // returns st,nd,rd or th based on last value
    var ordinal = getOrdinal(date);                                     // Get ordinal
    const dateType = new Date(splitDate[2], splitDate[1], splitDate[0]);// Create datatype
    const month = dateType.toLocaleString('default', { month: 'long' });// retrieve mounth string
    // Return concact of date
    return splitDate[2] + ordinal + " " + month + " " + splitDate[0];
} // END: formatDate

// Change minutes to h and min string
function formatRunTime(time) {
    var hours = (time / 60);                // Get hours (in float)
    var rhours = Math.floor(hours);         // Only keep int
    var minutes = (hours - rhours) * 60;    // Get minutes left over
    var rminutes = Math.round(minutes);     // Round up to int
    return rhours + "h " + rminutes + "min";
}
// ***************
// Chart.js Helper

// Return list of labels & datasets(w/ data & data options)
// chartLabels: Array of strings, data: array of int/float values, dataOptions: list of viable data options
function populateChartData(data, dataOptions) {
    return {
        labels: Object.keys(data),                                              // Retrieve keys of data as labels
        datasets: [Object.assign({data: Object.values(data)}, dataOptions)]     // Combine data and data options
    }
} // END: populateChartData

// Return list of chart options w/ custom title and boolean legend
function basicChartOptions(Title, isLegend) {
    return {
        responsive: true,
        title: {
            display: true,
            position: 'top',
            text: Title
        },
        legend: {
            display: isLegend,
            position: 'bottom'
        }
    }
} // END: basicCHartOptions
