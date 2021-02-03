// ****************
// HELPER FUNCTIONS
// ****************

// **********
// API HELPER

// Make API call, return result
async function apiCall(apiURL) {
    return await $.getJSON(apiURL);
}



// ***************
// DATA PROCESSING

// Sort movies by revenue
function sortMoviesByRevenue(movieData) {
    if (verbose === 2) { console.log("Stringified movieData-Titanic:", JSON.stringify(movieData[597])); }

    // Get items Array
    let data_items = Object.keys(movieData).map(function(key) {
        return [key, movieData[key]['revenue'], movieData[key]['name']]
    });

    // Sort based on revenue
    data_items.sort(function(first, second) { return second[1] - first[1] });


    // Add rank to movie entry
    for (let i=0; i<data_items.length-1; i++) {
        movieData[data_items[i][0]]['rank'] = i+1;
    }

    return data_items
} // END: sortArray

// Combine an array of lists together
function combineLists(arrayLists) {
    if (arrayLists.length === 0) { return null}         // If array is empty, return null
    if (arrayLists.length < 2) { return arrayLists[0] } // If only 1 list in array, return list

    let newList = arrayLists[0];                        // Initiate newList w/ 1st list
    let offset = arrayLists[0].length-1;                // Create offset to be length of 1st list

    for (let i=1; i<arrayLists.length; i++) {           // Loop through all lists (after 1st)
        for (let j=0; j<arrayLists[i].length-1; j++) {      // Loop through values in lists
            newList[j+offset] = arrayLists[i];              // Append list w/ offset
        }
        offset += arrayLists[i].length-1;               // Update offset
    }
    return newList                                      // Return new List
} // END: combineLists


// Add thousands comma to a number as appropriate, returns a string
function addThousandsComma(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// Format TMDb date format to: 25th December 2020
function formatDate(date) {
    let splitDate = date.split('-');                                    // Split date at char
    let getOrdinal = n => [,'st','nd','rd'][n/10%10^1&&n%10]||'th';     // returns st,nd,rd or th based on last value
    let ordinal = getOrdinal(date);                                     // Get ordinal
    const dateType = new Date(splitDate[2], splitDate[1], splitDate[0]);// Create datatype
    const month = dateType.toLocaleString('default', { month: 'long' });// retrieve mounth string
    // Return concact of date
    return splitDate[2] + ordinal + " " + month + " " + splitDate[0];
} // END: formatDate

// Change minutes to h and min string
function formatRunTime(time) {
    let hours = (time / 60);                // Get hours (in float)
    let rhours = Math.floor(hours);         // Only keep int
    let minutes = (hours - rhours) * 60;    // Get minutes left over
    let rminutes = Math.round(minutes);     // Round up to int
    return rhours + "h " + rminutes + "min";
}

// ********
// GET DATA


// Get data for a given set of countries into the correct iso6331 alpha3 format
async function getMapData(formattedData, movieId) {
    let film_countries = formattedData[movieId].production_countries;
    let country_codes = [];
    film_countries.forEach(element => country_codes.push(element.iso_3166_1));

    let country_conversion = {};
    let mapData = {};

    await $.ajax({
        type: 'GET',
        url: 'iso_3166_a2_a3.csv',
        dataType: 'text',
        success: function (response) {
            country_conversion = Papa.parse(response)['data'];
            for (let i = 0; i < country_conversion.length; i++) {
                for (let j = 0; j < country_codes.length; j++) {
                    if (country_codes[j] === country_conversion[i][1]) {
                        mapData[country_conversion[i][2]] = {fillKey: 'active'};
                    }
                }
            }
        }
    });
    return mapData
}
// Get count of gender in a dict
function getCount(list, gender) {
    let count = 0;                                          // let to store gender count
    if (list) {                                             // If list exists, loop through entries
        for (let i=0; i<list.length-1; i++) {
            if (list[i]['gender'] === gender) { count++; }     // Increase count if list gender is gender passed in arg
        }
    }
    return count
} //END getCount


// Get all members of a given cast/crew department and return as a string
function getMembers(role, formattedData, movie_id) {
    let directors = "";
    // Loop through all directors
    for (let i=0; i<formattedData[movie_id]['cast_crew'].length-1;i++) {
        if (formattedData[movie_id]['cast_crew'][i].known_for_department === role) {
            directors += formattedData[movie_id]['cast_crew'][i].name + ", ";
        }
    }
    return directors.slice(0, directors.length-2);
} // END: getDirectors

function createChartLegend() {
    let legend_container = customElement('div', 'legend-container', '');
    let legend_one = customElement('div', 'legend-content', 'Female', 'legend-txt-female');
    let legend_two = customElement('div', 'legend-content', 'Male', 'legend-txt-male');

    legend_container.appendChild(legend_one);
    legend_container.appendChild(legend_two);

    return legend_container;
}

// Return total of dataset (for Chart.js donut charts)
// Loops through metadata total value (index changes per datatype, hence need for recursion)
function getTotal(dataset, index=0) {
    var total;
    try {
        total = dataset['_meta'][index]['total'];
    } catch (error) {
        total = getTotal(dataset, index+1)
    }
    return total
}
// ************
// DOM ELEMENTS

// Create elements with a given class name and inner text
function customElement(type, className, text, id=null) {
    let newElement = document.createElement(type);
    newElement.className = className;
    if (id) { newElement.id = id}
    newElement.innerHTML = text;
    return newElement;
}


// Expand Movie Details
function expandMovieDetails(formattedData, movieId, index) {
    // Movie Wrapper, toggle Expanded
    toggleClassName('movieWrapper', 'wrapperExpanded', index);
    // Movie Details, toggle Expanded
    toggleClassName('inline-movie-details', 'detailsExpanded', index);
} // END: expandMovieDetails


// Toggle a class name for a given set of elements retrieved by class name (Currently: define target Index for class)
function toggleClassName(targetElementClassName, toggledClassName, elementIndex) {
    let domElements = document.getElementsByClassName(targetElementClassName);
    Array.from(domElements).forEach(element => element.classList.remove(toggledClassName));
    domElements[elementIndex].className += " "+toggledClassName;
} // END removeOthersAddClass

// Get & clear DOM container, add title
function getContainerWithTitle(containerId, containerTitle, id='') {
    let element_container = document.getElementById(containerId);
    element_container.textContent = '';
    element_container.appendChild(customElement('h2', 'viz-title', containerTitle, id));
    return element_container
}


// Remove animation class from Dom elements
function removeAnimation() {
    let animation_elements = document.querySelectorAll('.loader');
    console.log("ANimation_el:", animation_elements);
    for (let i=0; i<animation_elements.length; i++) {
        animation_elements[i].classList.remove('loader');
    }
}

// Create a sticky Header on page scroll
function stickyHeader() {
    var stickyHeader = document.getElementById("stickyHeader");
    stickyHeader.innerHTML = '';
    let movieImgSticky = customElement('img', 'movie-img-sticky', '');

    stickyHeader.appendChild(movieImgSticky);


    var srctest = document.querySelector(".wrapperExpanded img").src;
    var titletest = document.querySelector(".wrapperExpanded .movieTitle-Expanded").innerHTML;
    var releaseDatetest = document.querySelectorAll(".wrapperExpanded .details-Release span")[1].innerHTML;
    var genretest = document.querySelector(".wrapperExpanded .movieGenres").innerHTML;
    var movieRatingtest = document.querySelector(".wrapperExpanded .movieRating-text").innerHTML;
    movieImgSticky.src = srctest;

    var desired = titletest.split('<')[0];
    var desired2 = releaseDatetest.split(':')[1];
    let movieTitleSticky = customElement('p', 'movie-title-sticky', desired);
    let movieGenresSticky = customElement('p', 'movie-genres-sticky', genretest);
    let releaseDataSticky = customElement('p', 'movie-release-sticky', desired2);

    let movieRatingSticky = customElement('p', 'movie-rating-sticky', movieRatingtest + "/10");
    let movieRatingWrapperSticky = customElement('div', 'movie-rating-wrapper-sticky', '');

    movieRatingWrapperSticky.appendChild(movieRatingSticky);

    stickyHeader.appendChild(movieTitleSticky);
    stickyHeader.appendChild(movieGenresSticky);
    stickyHeader.appendChild(releaseDataSticky);
    stickyHeader.appendChild(movieRatingWrapperSticky);
}

// Library to set the number of visible words in a div, toggleable
function readMoreText() {
    $readMoreJS.init({
        target: '.details-Overview',    // Selector of the element the plugin applies to (any CSS selector, eg: '#', '.'). Default: ''
        numOfWords: 40,                 // Number of words to initially display (any number). Default: 50
        toggle: true,                   // If true, user can toggle between 'read more' and 'read less'. Default: true
        moreLink: 'Read more',          // The text of 'Read more' link. Default: 'read more ...'
        lessLink: 'Read less'           // The text of 'Read less' link. Default: 'read less'
    });
}

// Add Posters once api call made
function addPosters(formattedData) {
    // Set BgImg to be first Trending Movie
    let bgImg = document.getElementById('bgImage');
    bgImg.style.backgroundImage = "url('" + formattedData[299534].backdrop_path + "')";
    bgImg.style.backgroundPosition = "center 8%";     // Forces poster to start from top of screen
    bgImg.style.backgroundSize = "100%";         // narrows over screen width but shows more content. Increase percentage and bgImg height

    addPlayButton(bgImg, formattedData);
    // addTrending(formattedData);
}

// Create Play btn within BgImg Poster
function addPlayButton(bgImg, formattedData) {
    if (bgImg.childElementCount < 1) {      // Check no element exist first
        // Create container & btn
        let play_container = customElement('div', '', '', 'play-container');
        let play_btn = customElement('button', '', '', 'play-btn');

        // Append btn to container, container to bg
        play_container.appendChild(play_btn);
        bgImg.appendChild(play_container);
    }
}

// Append elements to dom, overwriting if they exist
function appendToDomCheck(element, container_id, checkElement_id, returnResult=false) {
    let check_element = document.getElementById(checkElement_id);
    if (check_element) {
        check_element = element;
        if (returnResult) {
            return true
        }
    } else {
        document.getElementById(container_id).appendChild(element);
        if (returnResult) {
            return null
        }
    }
}