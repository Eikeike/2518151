"use strict";
//This is a script for basic page functions such as pulling up different windows or searching wikipedia

/***
 * funtion to call at the beginning, as soon as the whole page has loaded
 */
function Init ()
{
  //declate a Button that appears when we scroll down. If we click it, we scroll back to the top of the page with a short animation
var button = $('#topButton');
$(window).scroll(function() {
  if ($(window).scrollTop() > 100) {
    button.addClass('show');
  } else {
    button.removeClass('show');
  }
});
button.on('click', function(e) {
  e.preventDefault();
  $('html, body').animate({scrollTop:0}, '100');
});

 //Pull up the Options if "Dienste" is clicked
 $('#PullupServices').on("click", dothisnow );

//define a jsonString holding all the People we want to display and parse it
  var jsonstring = ' { "Menschen" : [' +
    ' { "Vorname" : "Peter", "Nachname" :"Müller", "Gender": "male", "Rolle" : "Student"  },' +
    ' { "Vorname" : "Susanne", "Nachname" :"Lehmann", "Gender": "female", "Rolle" : "Student"  },' +
    ' { "Vorname" : "Jürgen", "Nachname" :"Schneider", "Gender": "male", "Rolle" : "Dozent"  }'+
   ' ] }';
  var parsed = JSON.parse(jsonstring);

  //if the "Leute" Button is clicked, we show the people. Param "parsed" so we don't have to deal with global variables
  $('#popupli1').on("click",function() {showMenschen(parsed)});

 //parse the requested search string into a wikipedia proxy-request and load the Document that it returns
  $("#submitSearch").on("click", ()=>{
    var fullRequest = "http://localhost:6001/proxy/?https://de.wikipedia.org/w/a"+
    "pi.php?action=query&generator=prefixsearch&format=json&gpslimit=4&prop="+
    "extracts%7Cdescription&exintro=1&explaintext=1&exsentences=2&redirects=1&gpssearch="
    + $("#wikiSearch").val();
    loadDoc(fullRequest);

  })

  //if a back-Button on one of the pullup-windows is pressed, detroy the window its in
  var backButtons = document.getElementsByClassName('backButton');
  Array.from(backButtons).forEach(el => {
    el.addEventListener("click", ()=>{el.parentNode.style.display = "none";});})

    let easycookies = "; " + document.cookie + ";";
    const partsUser = easycookies.split('; username=');
    console.log(easycookies);
    if (partsUser.length === 2) document.getElementById("welcomeMessage").innerHTML = "Welcome, " + partsUser.pop().split(';').shift();

    const partsRole = easycookies.split("; role=");
    const role = partsRole.pop().split(';').shift();

    if(role == 'poor'){
      document.getElementById("hideFromPoorUsers").innerHTML = "<p style=\"margin:4px; text-align:justify\">Sorry, you cannot view dynamic contents."+
                                                            "Only users with the word \"rich\" in their name can do this</p>"
    }

}
/***
 This function takes the results from out WIKI-API call and turns it into a nice looking table
 */
function showTable(pages){
   var tabletext = "";
    Object.keys(pages).forEach(key => {
      var page = pages[key];
      tabletext +=
        "<div class=\"cell\">" + "<span>" +  page.title + "</span>" + "</div>" +
        "<div class=\"cell\">" + "<span>" +  page.description + "</span>" + "</div>" +
        "<div class=\"cell\">" + page.extract + "</div>";
    })
    var fulltext = tabletext + "</div>";
    var resDiv = document.getElementById("showResults");
    resDiv.innerHTML = fulltext;
    //when the table is created, it overlaps with the "Leute" window. We need to adjust that position here as well
    updatePeopleWindowPos(); 
}

/***
 * Take the height of the Window containing the options, add a small offset and place the "Leute" window underneath that window
 */
function updatePeopleWindowPos(){
  var options = document.getElementById('PullupOptions');
    document.getElementById('showwindow').style.top = window.pageYOffset + options.getBoundingClientRect().top + options.offsetHeight + 100 + "px";
}

/**
 * 
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



/**
 * Pulls up a new window if "Dienste" is clicked
 */
function dothisnow()
 {
  console.log("Pull up");
  var pull = document.getElementById("PullupOptions");
  pull.style.top = document.getElementById('scrollablePart').offsetTop + "px";
  pull.style.display = "block";
  
   }
 
   /**
    * creates a nice looking table that displays all the people we want to display
    * @param {} parsed parsed JSON string containing all the people we want to show
    */
function showMenschen(parsed)  {
 
  console.log("showMenschen ");

  var tableheader = "<table> <tr>";
  tableheader += "<th>Vorname</th><th>Nachname</th><th>Gender</th><th>Rolle</th></tr>";

  var tabletext = "";
  
  for (var i = 0; i < parsed.Menschen.length; i++) {
    var person = parsed.Menschen[i];
    tabletext += "<tr>";
    Object.keys(person).forEach((key)=>{
      tabletext += "<td>" + person[key] + "</td>";
    })
    tabletext +="</tr>"
  }

  var tableclosing = "</table>";
  var fulltext = tableheader + tabletext + tableclosing;

  document.getElementById('showwindowData').innerHTML = fulltext;
  document.getElementById('showwindow').style.display = "block";
  updatePeopleWindowPos();
 }
