const d = new Date();
document.getElementById("currentdate").innerHTML = d;

let tripData = localStorage.getItem("tripData");

let parsedTripData = JSON.parse(tripData);

/**
 *  let objectToSetInLocalStorage = {
                    totallen,
                    totaltim,
                    savecal,
                    saveco2,
                    savemoney
                };
 */

var totlallen2 = document.getElementById("totlallen");
totlallen2.innerHTML += `${parsedTripData.totallen}`
var totaltime2 = document.getElementById("totaltime");
totaltime2.innerHTML += `${parsedTripData.totaltim}`
var co2 = document.getElementById("co2");
co2.innerHTML +=`${parsedTripData.saveco2}`
var money2 = document.getElementById("money");
money2.innerHTML +=`${parsedTripData.savemoney}`
var calories = document.getElementById("calories");
calories.innerHTML += `${parsedTripData.savecal}`