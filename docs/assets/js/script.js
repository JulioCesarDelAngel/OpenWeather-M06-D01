var historyContent  = document.getElementById("history");
var searchBtn       = document.getElementById("searchBtn");
var searchTxt       = document.getElementById("searchTxt");
var localHistoryList= [];
var urlSearchCity   = "https://api.openweathermap.org/geo/1.0/direct?appid=658ef29a4cb4df2e55ce7d1051dde05b&limit=1&q=";
var urlSearchData   = "https://openweathermap.org/data/2.5/onecall?appid=439d4b804bc8187953eb36d2a8c26a02&units=imperial";
var urlIcon         = "https://openweathermap.org/img/w/" //*.png


function toastMsg(message){
    var divmessagebox = document.getElementById("snackbar");
        divmessagebox.textContent =message;
        divmessagebox.className = "show";
        setTimeout( function () {divmessagebox.className = divmessagebox.className.replace("show","");}, 2000  
    );
    return;
  }



var historyBtnFn = async function (event){
    debugger;
    if (event.target.matches("button")===true){
        var idx = event.target.getAttribute('data-index');
        if (idx !== null){
            var dataWeather = await getData(localHistoryList[idx].latitude, localHistoryList[idx].longitude);
            if (dataWeather !== null && dataWeather.daily.length > 0 ) {
                dashBoard(localHistoryList[idx].cityId, dataWeather.daily);
            }
        }
    }
};

function dataCrud(actionType,city, lat, lon){
    if (actionType==="R"){
        var getLocalStorage = JSON.parse(localStorage.getItem("HistoryList"));
        if (getLocalStorage !== null){
            localHistoryList = getLocalStorage;
        }
    }
    else if (actionType ==="C"){
        var idx = localHistoryList.findIndex( element => element.cityId === city);
        if ( idx < 0 ) {
            localHistoryList.push({cityId:city, latitude:lat, longitude:lon});
            localStorage.setItem("HistoryList",JSON.stringify(localHistoryList));
        }
    }
    return
}

function removeElement(element){
    while ( (element.firstChild != null) && element.firstChild){
        element.removeChild(element.firstChild);
    }
    return;
}

function refreshList(){
    removeElement(historyContent);

    for (i=0; i < localHistoryList.length; i++){
        var btn = document.createElement("button");
        btn.id = "button-"+i;
        btn.setAttribute("data-index", i)
        btn.type = "button";
        btn.setAttribute("class", "btn btn-secondary btn btn-block");
        btn.setAttribute("style","margin-top: 10px;");
        btn.textContent = localHistoryList[i].cityId;
        historyContent.appendChild(btn);
    }
    return;
}

async function getCity(city){    

    var requestUrl = urlSearchCity + city;
    var response = await fetch(requestUrl);
    var data = await response.json();
    return data;

}

async function getData(latitude, longitude){

    var requestUrl = urlSearchData + "&lat=" + latitude + "&lon=" + longitude;
    var response = await fetch(requestUrl);
    var data = await response.json();
    return data;

}

function dashBoard(city,data){

    for (i=0; i < 6; i++){
        var date =moment.unix(data[i].dt).format("DD/MM/YYYY");
        $("#title-"+i).text( i==0?  city +" "+date :date  );
        $("#ico-"+i).attr("src",urlIcon + data[i].weather[0].icon + ".png");
        $("#temp-"+i).text("Temp: "+ data[i].temp.day + " °F");
        $("#wind-"+i).text("Wind: " + data[i].wind_speed + " MHP");
        $("#humi-"+i).text("Humidity: " + data[i].humidity +" %");

    }
    return;
}

async function search(event){
    var element = event.target;
    if (element.matches("button")===true){
        var searchCity = searchTxt.value.trim()
        if (searchCity !== null && searchCity.length != 0 ){

            var dataCity = await getCity(searchCity);
            if (dataCity !== null && dataCity.length == 1 ){
                var dataWeather = await getData(dataCity[0].lat, dataCity[0].lon);
                if (dataWeather !== null && dataWeather.daily.length > 0 ) {
                    dataCrud("C", dataCity[0].name.trim(), dataCity[0].lat, dataCity[0].lon);    
                    refreshList();
                    dashBoard(dataCity[0].name.trim(), dataWeather.daily);
                    searchTxt.value="";
                }
                else{
                    toastMsg("No se encontraron datos. Intente mas tarde.");
                }
            }
            else{
                toastMsg("No se encontro la ciudad.  Intente mas tarde.");
            }
        }
        else{
            //error debe capturar una ciudad.
            toastMsg("Debe capturar la ciudad.");
        }
    }
}


searchBtn.addEventListener("click",search);
historyContent.addEventListener("click",historyBtnFn)

function init(){
    dataCrud("R");
    refreshList();
}

init();
