var historyContent  = document.getElementById("history");
var searchBtn       = document.getElementById("searchBtn");
var searchTxt       = document.getElementById("searchTxt");
var localHistoryList= [];
var urlSearchCity   = "http://api.openweathermap.org/geo/1.0/direct?appid=658ef29a4cb4df2e55ce7d1051dde05b&limit=1&q=";
var urlSearchData   = "https://openweathermap.org/data/2.5/onecall?appid=439d4b804bc8187953eb36d2a8c26a02&units=imperial";
var urlIcon         = "http://openweathermap.org/img/w/" //*.png

//http://openweathermap.org/img/w/04d.png
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
        btn.setAttribute("class", "btn btn-primary btn btn-block");
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
    debugger;

    for (i=0; i < 5; i++){
        console.log ("----------" + i);
        console.log(data[i].dt);        
        var date =moment.unix(data[1].dt).format("DD/MM/YYYY");
        console.log(date);
        console.log(data[i].weather[0].icon); 
        console.log(data[i].temp.day); 
        console.log(data[i].wind_speed); 
        console.log(data[i].humidity); 
        console.log(data[i].uvi); 
        console.log ("----------");

        if (i === 0) {
            $("#title-"+i).text(city + " (" +date + ")");
            $("#ico-"+i).attr("src",urlIcon + data[i].weather[0].icon + ".png");
            $("#temp-"+i).text("Temp: "+ data[i].temp.day + " °F");
            $("#wind-"+i).text("Wind: " + data[i].wind_speed + " MHP");
            $("#humi-"+i).text("Humidity: " + data[i].humidity +" %");
        }

    }

    debugger
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
                }
                
                /*
                dataWeather.current.weather[0].icon

                */


            }
            else{
                //error no se encontro la ciudad.
            }
        }
        else{
            //error debe capturar una ciudad.
        }
    }
}



searchBtn.addEventListener("click",search);

function init(){
    dataCrud("R");
    refreshList();
}

init();

/*
data.cod  200 /404
data.main.temp
data.wind.speed
data.main.humidity
uv_index NA
data.weather[0].icon
*/