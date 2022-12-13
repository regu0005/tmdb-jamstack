import TMDB_API_KEY from './TMDBapi.js';
import { NetworkError, CharactersNotAllowed, EmptyInputError, EmptyRecordsError } from './errs.js';

console.log('API KEY: ' + TMDB_API_KEY);

const BASE_URL          = 'https://api.themoviedb.org/3';
const IMAGES_URL        = 'https://image.tmdb.org/t/p/w500';

const MOVIE_API_URL     = BASE_URL + '/discover/movie?sort_by=popularity.desc&api_key='+ TMDB_API_KEY;
const SERIE_API_URL     = BASE_URL + '/discover/tv?sort_by=popularity.desc&api_key='+ TMDB_API_KEY;

const MOVIE_SEARCH_URL  = BASE_URL + '/search/movie?api_key=' + TMDB_API_KEY;
const SERIE_SEARCH_URL  = BASE_URL + '/search/tv?api_key=' + TMDB_API_KEY;

const MOVIE_CREDITS_URL = BASE_URL + '/movie/';
const SERIE_CREDITS_URL = BASE_URL + '/tv/';

let mFormMovie   = '';
let mFormSerie   = '';
let mSearchMovie = '';
let mSearchSerie = '';
let mMainIndex        = '';
let mMainCredits = '';
let mTextMovie;

// In this function we made the Fetch for get the Credits
// File used: from credits.html
function getCredits(url,type){
    
    mMainCredits.innerHTML = '';
    fetch(url)
    .then((response) => {
        if (!response.ok) throw new NetworkError('Failed to get response', response);
        return response.json();
    })
    .then((data) => {
        let results = data.cast;

        results.map( function(obj) {
            let resRoute = 'movie'; // The route in the URL is movie for default
            let resName = '';
            let resCharacter = '';
            let resPopularity = '';

            if(type=='movie'){
                resName = obj.name;
                resCharacter = obj.character;
                resPopularity = obj.popularity;
            }
            else if(type=='serie'){
                resName = obj.name;
                resRoute = 'tv';
            }
            else {
                resName = obj.name;
                resCharacter = obj.character;
                resPopularity = obj.popularity;
            }

            let resImage   = obj.profile_path;
            let imageURL   = "";

            if(!resImage){
                imageURL = 'images/no_photo.jpg';
            }
            else{
                imageURL = IMAGES_URL+resImage;
            }
            
            const resContent = document.createElement('div');
            resContent.classList.add('movie_credits');
            resContent.innerHTML = `
                    <img src="${imageURL}" alt="${resName}">
                    <div class="movie_credits_info">
                        <h3>${resName}</h3>
                        <p class="movie_credits_name">
                            as ${resCharacter}
                        </p>
                        Pupularity: <span class="green">${resPopularity}</span>
                    </div>
                </div>
            `;

            mMainCredits.appendChild(resContent);
        });

    })
    .catch(function(err){

        if(err.name=='NetworkError'){
            // Got a non-404 fetch error
            APP.showError(err.name + ': ' + err.message + '. Status code: ' + err.status);
            mTextMovie.innerHTML = '';
        }
        else{
            // Other kind of error
            APP.showError(err.name + ': ' + err.message);
            mTextMovie.innerHTML = '';
        }
    });
}

// In this function we made the Fetch for get the Movies and TV Series
// File used: from index.html
function getInfo(url,type){
    
    mMainIndex.innerHTML = '';

    let mLoader = document.getElementById('loading');
    mLoader.innerHTML = "<div class='loader'><div class='newtons-cradle'><div class='newtons-cradle__dot'></div><div class='newtons-cradle__dot'></div><div class='newtons-cradle__dot'></div><div class='newtons-cradle__dot'></div></div></div>";

    fetch(url)
    .then((response) => {
        if (!response.ok) throw new NetworkError('Failed to get response', response);
        return response.json();
    })
    .then((data) => {
        mLoader.innerHTML = "";

        let results = data.results;

        results.map( function(obj) {
            let resRoute = 'movie'; // Defaul the route for URL is movie
            let resTitle = '';
            let resRelease = ''; // obj.release_date;

            if(type=='movie'){
                resTitle = obj.title;
                resRelease = obj.release_date;
            }
            else if(type=='serie'){
                resTitle = obj.name;
                resRelease = obj.first_air_date;
                resRoute = 'tv';
            }
            else {
                resTitle = obj.title;
                resRelease = obj.release_date;
            }

            let resID      = obj.id;
            let resImage   = obj.poster_path;
            let resAverage = obj.vote_average;
            let imageURL;

            if(!resImage){
                imageURL = 'images/no_photo.jpg';
            }
            else{
                imageURL = IMAGES_URL+resImage;
            }
            
            resRelease = realeaseDate(resRelease);
            let resOverview = obj.overview;
            const resContent = document.createElement('div');
            resContent.classList.add('movie');
            resContent.innerHTML = `
                <div class="movie_image">
                    <a href="credits.html#/${resRoute}/${resID}/${resTitle}" class="movie_link">
                        <img src="${imageURL}">
                    </a>
                </div>
                    <div class="movie_col">
                    <a href="credits.html#/${resRoute}/${resID}/${resTitle}" class="movie_link">
                            <div class="movie_title">
                            ${resTitle}
                            </div>
                            <div class="movie_ranking">
                            Ranking: ${resAverage} - Release: ${resRelease}
                            </div>
                            <div class="movie_detail">
                            ${resOverview}
                            </div>
                        </a>
                    </div>
                </div>
            `;

            mMainIndex.appendChild(resContent);
        });

    })
    .catch(function(err){
        console.log(err);

        if(err.name=='NetworkError'){
            // Got a non-404 fetch error
            APP.showError(err.name + ': ' + err.message + '. Status code: ' + err.status);
            mTextMovie.innerHTML = '';
        }
        else{
            // Other kind of error
            APP.showError(err.name + ': ' + err.message);
            mTextMovie.innerHTML = '';
        }

    });
}

// In this function we validate the data before it's sending to getInfo
// File used: from index.html
function searchMovies(event) {
    event.preventDefault();

    mSearchMovie = document.getElementById('search_movie').value;

    // ERROR - Verify characters allowed - Only letters, numbers and space
    if(!verifyString(mSearchMovie)) throw new CharactersNotAllowed();

    // REVIEW THE URL THAT IS GENERATED THE SEARCH
    let currentURL = document.URL;
    let indexURL   = currentURL.includes('index.html');
    let creditsURL = currentURL.includes('credits.html');

    if(indexURL){
        if(mSearchMovie){
            let movieURLSearch = MOVIE_SEARCH_URL + '&query=' + mSearchMovie;
            getInfo(movieURLSearch,'movie');
    
            // CREATE THE URL WITH HASH VALUES
            let urlHash = `index.html#/movie/${mSearchMovie}`;
            location.replace(urlHash);
        }
        else{
            getInfo(MOVIE_API_URL,'movie');
    
            // CREATE THE URL WITH HASH VALUES
            let urlHash = `index.html#/movie/${mSearchMovie}`;
            location.replace(urlHash);
        }
    }

    if(creditsURL){
        let urlHash;

        if(mSearchMovie){
            urlHash = `index.html#/movie/${mSearchMovie}`;
            location.replace(urlHash);
        }
        else{
            urlHash = `index.html#/movie/`;
            location.replace(urlHash);
        }
    }
}

// In this function we validate the data before it's sending to getInfo
// File used: from index.html
function searchSeries(event){
    event.preventDefault();

    mSearchSerie = document.getElementById('search_serie').value;

    // ERROR - Verify characters allowed - Only letters, numbers and space
    if(!verifyString(mSearchSerie)) throw new CharactersNotAllowed();

    // REVIEW THE URL THAT IS GENERATED THE SEARCH
    let currentURL = document.URL;
    let indexURL   = currentURL.includes('index.html');
    let creditsURL = currentURL.includes('credits.html');

    if(indexURL){
        if(mSearchSerie){
            let serieURLSearch = SERIE_SEARCH_URL + '&query=' + mSearchSerie;
            getInfo(serieURLSearch,'serie');
        }
        else{
            getInfo(SERIE_API_URL,'serie');
        }
    
        // CREATE THE URL WITH HASH VALUES
        let urlHash = `index.html#/tv/${mSearchSerie}`;
        location.replace(urlHash);
    }

    if(creditsURL){
        let urlHash;
        if(mSearchSerie){
            urlHash = `index.html#/tv/${mSearchSerie}`;
            location.replace(urlHash);
        }
        else{
            urlHash = `index.html#/tv/`;
            location.replace(urlHash);
        }
    }
}

// UTILS FUNCTIONS
function cleanChars(text) {
    if(text){
        return text.replace(/%20/g," ");
    }
}

function verifyString(str) {
    // Only leters, number and spaces return True if fits with the condition, and False if not
    if(str.length>0)
    {
        return /^[a-zA-Z0-9 ]*$/.test(str);
    }
    else {
        return true;
    }
}

function realeaseDate(dateOri){
    let result = '';

    if(dateOri){
        let part = dateOri.split('-');
        let year = part[0];
        let month = part[1];
        let day = part[2];

        result = month + '/' + day + '/' + year;
    }
    return result;
}

const APP = {

    errorBox: null,

    init: () => {

        // Detect if the URL changed and update the vars calling APP.init
            window.onhashchange = function() { 
                APP.init();
            }

        // Main vars init
            mMainIndex = document.getElementById('movies');
            mMainCredits = document.getElementById('credits');

            mFormMovie = document.getElementById('form1');
            mFormMovie.addEventListener('submit', searchMovies);
        
            mFormSerie = document.getElementById('form2');
            mFormSerie.addEventListener('submit',searchSeries);

            mTextMovie = document.getElementById('search_text');

            APP.errorBox = document.querySelector('.err');
            // getInfo(MOVIE_API_URL);
        

        // Process to get the hash parameters and review the data that the page needs depending if the URL has index or credits
            let hash = window.location.hash;
            let currentURL = document.URL;
            
            let indexURL   = currentURL.includes('index.html');
            let creditsURL = currentURL.includes('credits.html');

            // If we are in the credits web page, we get the credits information from getCredits function
            if(creditsURL)
            {
                let index = hash.indexOf("#");
                if (index !== -1)
                {
                    let creditsURLSearch = '';

                    let hashPart = hash.substring(index + 1);

                    let urlParts = hashPart.split('/');

                    let searchType  = urlParts[1];
                    let searchID    = urlParts[2];
                    let searchTitle = urlParts[3];

                    if(searchType=='movie'){
                        creditsURLSearch = MOVIE_CREDITS_URL + searchID + '/credits?api_key='+ TMDB_API_KEY + '&language=en-US';
                        
                        mTextMovie.innerHTML = `Listing Credits of the Movie: <span class="search_word">"${cleanChars(searchTitle)}"</span>`;

                        getCredits(creditsURLSearch, searchType);
                    }
                    if(searchType=='tv'){
                        
                        creditsURLSearch = SERIE_CREDITS_URL + searchID + '/credits?api_key='+ TMDB_API_KEY + '&language=en-US';

                        mTextMovie.innerHTML = `Listing Credits of the TV Serie: <span class="search_word">"${cleanChars(searchTitle)}"</span>`;

                        getCredits(creditsURLSearch, searchType);
                    }
                }
            }
            
            // If we are in the home page (index), we get the Movie(s) or TV Serie(s) information from getInfo function
            if(indexURL)
            {
                let index = hash.indexOf("#");
                if(index !== -1){
                    
                    let hashPart = hash.substring(index + 1);

                    let urlParts = hashPart.split('/');

                    let searchType = urlParts[1];
                    let searchTitle = urlParts[2];

                    // If the search comes from Movie as a part in the url, we prepare the string movieURLSearch for the function getInfo
                    if(searchType=='movie'){
                        
                        if(searchTitle){
                            let movieURLSearch = MOVIE_SEARCH_URL + '&query=' + searchTitle;

                            // Update the value inside the input search_movie
                            document.getElementById('search_movie').value = cleanChars(searchTitle);
                            document.getElementById('search_serie').value = '';

                            mTextMovie.innerHTML = `Movie search results for <span class="search_word">"${cleanChars(searchTitle)}"</span>`;

                            getInfo(movieURLSearch,'movie');
                        }
                        else{

                            mTextMovie.innerHTML = `Listing Movies - <span class="search_word">Top 20</span>`;

                            getInfo(MOVIE_API_URL,'movie');
                        }

                    }

                    // If the search comes from TV Serie as a part in the url, we prepare the string serieURLSearch for the function getInfo
                    if(searchType=='tv'){
                    
                        if(searchTitle){
                            let serieURLSearch = SERIE_SEARCH_URL + '&query=' + searchTitle;

                            // Update the value inside the input search_serie
                            document.getElementById('search_movie').value = '';
                            document.getElementById('search_serie').value = cleanChars(searchTitle);

                            mTextMovie.innerHTML = `TV Serie search results for <span class="search_word">"${cleanChars(searchTitle)}"</span>`;

                            getInfo(serieURLSearch,'serie');
                        }
                        else{
                            mTextMovie.innerHTML = `Listing TV Series - <span class="search_word">Top 20</span>`;

                            getInfo(SERIE_API_URL,'serie');
                        }
                    }

                }
            }
            
        // END Process to get the hash parameters and review the data that the page needs depending if the URL has index or credits
    },
    showError: (msg) => {
        let mainErr = document.getElementById('main_err');
        mainErr.innerHTML = '';
        APP.errorBox.innerHTML = `<p>${msg}</p>`;
    },

    
  };

document.addEventListener("DOMContentLoaded", APP.init);

