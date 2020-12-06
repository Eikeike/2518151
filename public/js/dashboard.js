//declare global variables
document.getElementsByTagName("BODY")[0].onload = Init;
var wikiPediaText = "";
var speech = window.speechSynthesis;
var voices = [];

//Call this function once the whole body is loaded. This way we make sure noting is left out
function Init() {

    //Get all the available voices of our OS
    //Note that we have to wait until voices have loaded. 
    //This has caused me quite some pain, but it seems to be an OS-related issue
    setTimeout(() => {
        voices = speech.getVoices();
        fillSelection();
        if (speech.onvoiceschanged !== undefined) {
            speech.onvoiceschanged = fillSelection;
        }
    }, 1000);
    //Read the cookies string and show the right user. This makes the dashboard a little more personal
    let easycookies = "; " + document.cookie + ";";
    const partsUser = easycookies.split('; username=');
    let name = "";
    if (partsUser.length === 2) name = partsUser.pop().split(';').shift();
    //Display the grammatically correct form. This is to prevent things like "Jonass Dashboard"
    if (name.endsWith('s')) {
        var grammaticallyCorrectGreeting = " Dashboard";
    } else {
        grammaticallyCorrectGreeting = "s Dashboard";
    }
    document.getElementById("welcomeMessage").innerHTML = name + grammaticallyCorrectGreeting;

    //If a weather city is entered, get the 12h forecast for that specific region
    document.getElementById('weatherSearch').addEventListener('submit', e => {
        e.preventDefault();
        getWeather();
    })

    //Get the wikipedia search value, create a fitting query link that is not too long
    document.getElementById('search').addEventListener('submit', e => {
        e.preventDefault();
        var fullRequest = "http://localhost:3000/proxy/?https://de.wikipedia.org/w/a" +
            "pi.php?action=query&generator=prefixsearch&format=json&gpslimit=4&prop=" +
            "extracts%7Cdescription&exintro=1&explaintext=1&exsentences=2&redirects=1&gpssearch=" +
            document.getElementById('query').value
            //load the contents this request will bring in
        loadDoc(fullRequest);
    })


    //on click of the read out button, read out the text
    document.getElementById("tts").addEventListener("click", textToSpeech);
    var stop = document.getElementById('stop');
    stop.addEventListener('click', () => {
            speech.cancel();
            stop.style.display = "none"
        })
        //on click of the hide button, hide the wikipedia data.
    document.getElementById('hide').addEventListener('click', () => {
        document.getElementById("showResults").style.display = "none";
    })


}

//Fill the selection with all the voices we can possibly use to read out the wikipedia data. Just to put in some diversity :)
function fillSelection() {
    var select = document.getElementById('selectVoice');
    console.log(voices);
    voices.forEach(voice => {
        var option = document.createElement('option');
        option.textContent = voice.name + "/" + voice.lang;
        if (voice.default) {
            option.textContent += " (Default)";
        }
        option.setAttribute('lang', voice.lang);
        option.setAttribute('name', voice.name);
        select.appendChild(option);
    })
}

/**
 * sends an XMLHTTP request to the wikipedia api. Valid API call string with search value already entered is neccessary
 * @param {} toGet valid String for wikipedia api
 */
function loadDoc(toGet) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var pages = JSON.parse(this.responseText).response.query.pages;
            showTable(pages);
        }
    };
    xhttp.open("GET", toGet, true);
    xhttp.send();
}


/***
 This function takes the results from out WIKI-API call and turns it into a nice looking table
 @param pages Json-Parsed ressponse from the wikipedia api that only displays the pages available
 */
function showTable(pages) {
    var tabletext = "";
    Object.keys(pages).forEach(key => {
        var page = pages[key];
        tabletext +=
            `<div class=\"cell\"><span>${page.title}</span></div>
         <div class=\"cell\"><span> ${page.description}</span></div>
         <div class=\"cell\">${page.extract}</div>`;
        //Also create a String that can be read out. Add some pauses, this way it actually sounds nice.
        wikiPediaText += page.title + "!. " + page.description + "!. " + page.extract +
            "!. !. !.";
    })
    var fulltext = tabletext + "</div>";
    var resDiv = document.getElementById("showResults");
    resDiv.innerHTML = fulltext;
    document.getElementById('hide').style.display = "inline-block";
}

/**
 * Implements the text to speech function to read out wikipedia values
 */
function textToSpeech() {
    //some setup
    let utterText = new SpeechSynthesisUtterance(wikiPediaText);
    let selection = document.getElementById("selectVoice")
        .selectedOptions[0].getAttribute('name');

    //if the user is stupid enough to not choose an option, select default
    if (selection == null) {
        utterText.voice = voices.filter(voice => { return (voice.default != undefined) })[0];
        console.log(utterText.voice);
    } else {
        utterText.voice = voices.filter(voice => {
            return voice.name === selection;
        })[0]
    }
    //Basic pitch and speed. This makes things easier
    utterText.pitch = 1;
    utterText.rate = 1;
    //read out the text
    speech.speak(utterText);
    document.getElementById('stop').style.display = "inline-block"
}

/**
 * Sends a call to the openweathermap api that sends 3h forecasts. From these, we take 4x3h for a 12h forecast.
 */
function getWeather() {
    var input = document.getElementById('location').value;
    const key = 'f5cfae53f953c1f71a08d0ed979d3fdc';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let weather = JSON.parse(this.responseText).response
            console.log(weather);
            //now that the data is received, we can make it look good
            showWeather(weather);
        } else if ((this.status != 0 && this.status != 200)) {
            console.log(this.readyState, this.status);
        }
    };
    //Create call with own key and input from search form (declared in Init()- Function)
    let call = `http://localhost:3000/proxy/?https://api.openweathermap.org/data/2.5/forecast?q=${input}&units=metric&lang=de&appid=${key}`;
    xhttp.open("GET", call, true);
    xhttp.send();
}

/***
 * This takes the data and creates a HTTP card for it. It is already styled, so we just need to populate it with data.
 * @param weather full Response of the API. Only the response, not the request or anything. 
 * */
function showWeather(weather) {
    let hours = weather.list.slice(0, 4);
    //create header
    let text = `<h1 id=location>12h forecast for ${weather.city.name}</h1>
                <div class="flexWeatherCards" id="results">`
    hours.forEach(hour => {
        let datetime = new Date(hour.dt * 1000);
        console.log(datetime.toString());
        let hours = "0" + (datetime.getHours() - (weather.city.timezone / 3600));
        let minutes = "0" + datetime.getMinutes();
        let datetimeString = hours.substr(-2) + ":" + minutes.substr(-2)
            //get the icon with the according openweathermap-icon
        let imagesrc = `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`
            //Display it in a nice looking card that is styled with flexboxes
        text += `<div class="cardContainer">
        <div class="cardItem"><span class="Tag">${datetimeString}</span></div>
        <div class="cardItem"><h1 class="Temp">${Math.round(hour.main.temp)}&#176C</h1></div>
        <div class="cardItem" class="icon"><img src=\"${imagesrc}\" alt="weatherIcon"></div>
        <div class="cardItem" class="weather"><span>${hour.weather[0].description}</span></div>
        </div>`
    })
    text += "</div>"
    document.getElementById("cardsGoHere").innerHTML = text;

}