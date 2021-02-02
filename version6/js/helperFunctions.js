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




// Library to set the number of visible words in a div, toggleable
function readMoreText() {
    $readMoreJS.init({
        target: '.details-Overview',           // Selector of the element the plugin applies to (any CSS selector, eg: '#', '.'). Default: ''
        numOfWords: 40,               // Number of words to initially display (any number). Default: 50
        toggle: true,                 // If true, user can toggle between 'read more' and 'read less'. Default: true
        moreLink: 'Read more',    // The text of 'Read more' link. Default: 'read more ...'
        lessLink: 'Read less'         // The text of 'Read less' link. Default: 'read less'
    });
}