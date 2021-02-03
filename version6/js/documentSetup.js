runOnceDomLoaded();

function runOnceDomLoaded() {
    addMoviePosterPlaceholder();
    addSectionTitles();

    activateStickyHeader();
}


// Add Placeholder for Movie Posters
function addMoviePosterPlaceholder() {

    let movie_poster_container = document.getElementById('trending-movies-container');
    movie_poster_container.appendChild(customElement('h2', 'viz-title', 'Top Trending Movies'));

    for (let i=0; i<20; i++) {
        let movie_wrapper = customElement('div','movieWrapper', '');
        let poster_placeholder = customElement('div', 'poster-placeholder', '');
        movie_wrapper.appendChild(poster_placeholder);
        movie_poster_container.appendChild(movie_wrapper);
    }
}


// Add Section Titles and loading animations
function addSectionTitles() {
    let sections = {
        awards: getContainerWithTitle('movieAwards', 'Awards & Nominations'),
        budget: getContainerWithTitle('budgetRevenue', 'Budget vs. Box Office'),
        filmLocation: getContainerWithTitle('filmLocations', 'Film Shoot Locations'),
        genderChart: getContainerWithTitle('genderDivide', 'Gender Divide : <div id="gender-chart-label"><span class="g-title">CAST</span> & <span class="g-title">CREW</span></div>', 'gender-title')
    };

    // Add Loader div to each element
    for (const key in sections) {
        sections[key].appendChild(customElement('div', 'loader', ''));
    }
}


// Activate sticky header correctly
function activateStickyHeader() {
    //credits: https://stackoverflow.com/questions/11340789/make-an-element-visible-only-when-scrolled-down-to-px

    var isVisible = false;

    $(window).scroll(function(){
        var shouldBeVisible = $(window).scrollTop()>700;
        if (shouldBeVisible && !isVisible) {
            isVisible = true;
            $('#stickyHeader').fadeIn(400);
        } else if (isVisible && !shouldBeVisible) {
            isVisible = false;
            $('#stickyHeader').fadeOut(400);
        }
    });

    $('#stickyHeader').click(function(){
        $(window).scrollTop(0);
    });
}