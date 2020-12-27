// Global var for printing text
var verbose = 1;    // 0: Nothing, 1: Main lists, 2: Every loop

// *******************
// MAIN ASYNC FUNCTION
// *******************
// TMDb Top Movies by Revenue API URL
var movie_ranking_url = "https://api.themoviedb.org/3/discover/movie?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US&sort_by=revenue.desc&include_video=false&page=1";

// Make TMDb API Call, then populate details, then credits, then build charts
apiCall(movie_ranking_url)
    .then(value => movieData(value))
    .then(value => creditsData(value))
    .then(value => buildCharts(value));



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

        // On last loop, sort all data by revenue
        // if (i === movie_id.length-1) {
        //     if (verbose === 2) { console.log("LastLoop-MovieData:", movieData); }
        //     sortMoviesByRevenue(movieData);
        // }
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
    for (var i=0; i<movie_id.length-1; i++) {
        // TMDb Movie Credits API URL
        var moive_credits_url = "https://api.themoviedb.org/3/movie/" + movie_id[i] + "/credits?api_key=54f244c3bc41ade17bb0dcfd25aab606&language=en-US";

        // Make TMDb API call, then store general cast/crew details, then store cast/crew statistics
        await apiCall(moive_credits_url)
            .then(value => creditsDetails(value, movieData, movie_id[i]))
            .then(value => castStats(value, movie_id[i]));
    }

    if (verbose !== 0) { console.log("Post Credits Data:", movieData); }

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


// ************
// BUILD CHARTS
// ************

// Build Charts from data
function buildCharts(formatedData) {
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


// ***************
// Chart.js Helper
// ***************

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