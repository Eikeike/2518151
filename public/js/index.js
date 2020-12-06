"use strict";
//This is a script for basic page functions such as pulling up different windows or searching wikipedia

/***
 * funtion to call at the beginning, as soon as the whole page has loaded
 */
function Init ()
{
  //declare a Button that appears when we scroll down. If we click it, we scroll back to the top of the page with a short animation
  //jquery used because it was easier here. It just saves some lines of code
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

 

  //if a back-Button on one of the pullup-windows is pressed, detroy the window its in
  var backButtons = document.getElementsByClassName('backButton');
  Array.from(backButtons).forEach(el => {
  el.addEventListener("click", ()=>{el.parentNode.style.display = "none";});})

  //get the username from the cookies string. This is probably not best practice but it works
  let easycookies = "; " + document.cookie + ";";
  const partsUser = easycookies.split('; username=');
  console.log(easycookies);
  //Welcome the user by his individual username
  if (partsUser.length === 2) document.getElementById("welcomeMessage").innerHTML = "Welcome, " + partsUser.pop().split(';').shift();

  //Get the users role from the coookies string
  const partsRole = easycookies.split("; role=");
  const role = partsRole.pop().split(';').shift();

  //If he is poor, hide all the dynamic elements from him (aka the dashboard)
  if(role == 'poor'){
    document.getElementById("hideFromPoorUsers").innerHTML = "<p style=\"margin:4px; text-align:justify\">Sorry, you cannot view dynamic contents. "+
                                                          "Only users with the word \"rich\" in their name can do this</p>"
    }

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

   /***
 * Take the height of the Window containing the options, add a small offset and place the "Leute" window underneath that window
 */
function updatePeopleWindowPos(){
  var options = document.getElementById('PullupOptions');
    document.getElementById('showwindow').style.top = window.pageYOffset + options.getBoundingClientRect().top + options.offsetHeight + 100 + "px";
}
   /***
 * Take the height of the Window containing the headerand place the scrollable part underneath that window
 */
function updateScrollWindowPos(){
  var header = document.getElementById('headerAndNav');
    document.getElementById('scrollablePart').style.paddingTop = header.offsetHeight+  "px";
    document.getElementById('PullupOptions').style.marginTop = (header.offsetHeight + 10)+ "px"
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
  
  //iterate over parsed json and make it a table
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


