var origAddr ;
var destAddr ;
// Initiate Map
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37,lng: -95},
    zoom: 4
  });
  autocompleteLocations(map);
}
// Autocomplete Set-up on Inputs

function autocompleteLocations(map){
  var orig = document.getElementById('origin');
  var dest = document.getElementById('destination');
  var autocompleteOrig = new google.maps.places.Autocomplete(orig);
  var autocompleteDest = new google.maps.places.Autocomplete(dest);
  autocompleteListener(autocompleteOrig,map,'SRC');
  autocompleteListener(autocompleteDest,map,'DEST');
}
// Set-up Listeners on autocomplete fields

function autocompleteListener(autocomplete,map,type){
  autocomplete.bindTo('bounds', map);
  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  origAddr =null;
  destAddr =null;
  autocomplete.addListener('place_changed', function() {
    marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      var messageHtml='<div class="options"><p>Sorry! There are no results for this input. Please choose one from the list.</p></div>';
      $('.js-directions-result').html(messageHtml);
      return;
    }
    map.setCenter(place.geometry.location);
    map.setZoom(10);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    if(type === 'SRC'){
      origAddr=place.place_id;
    } else{
      destAddr=place.place_id;
    }
    getTransitDetails(origAddr, destAddr);
  });
}
//Transit Details and rendering directions

function getTransitDetails(origAddr, destAddr) {
  if(origAddr === destAddr){
    var messageHtml='<div class="options"><p>Origin and Destination are same.</p></div>';
    $('.js-directions-result').html(messageHtml);
  }
  if(origAddr && destAddr)
  {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.90973623453719,lng: -102.48046875},
      zoom: 4
    });
    var request = {
      origin: {'placeId': origAddr},
      destination: {'placeId': destAddr},
      travelMode: 'TRANSIT',
      provideRouteAlternatives: true
    };
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsService.route(request,function(response, status){
      var routes = null;
      if (status === 'OK') {
        directionsDisplay.setDirections(response);
        routes = response.routes;
        getDetails(routes);
      } else
      {
        var messageHtml='<div class="options"><p>Sorry! There are no results for that search. Please try again.</p></div>';
        $('.js-directions-result').html(messageHtml);
      }
    });
  }
  else
  {
    return;
  }
}

//Displaying Transit details

function getDetails(routes) {
    routes.forEach(function(route) {
      var legs = route.legs;
      var optionHtml="";
      var stepsHtml="";
      legs.forEach(function(leg) {
        var steps = leg.steps;
        var imgIcon="";
        steps.forEach(function(step) {
          var n=step.instructions.search("rail");
          var stepHtml="";
          if(step.travel_mode === 'WALKING'){
            stepHtml='<img src="img/walk.png">';
            imgIcon+='<img src="img/walk.png">'+' ';
          }else{
            if(n>0){
              stepHtml='<img src="img/rail.png">';
              imgIcon+='<img src="img/rail.png">';
            }
            else{
              imgIcon+='<img src="img/bus.png">';
              stepHtml='<img src="img/bus.png">';
            }
          }
          var transit = step.transit;
          stepHtml+= '  '+step.instructions+'<p>'+step.distance.text +'-' + step.duration.text + '</p>' ;
          if (transit !== undefined) {
            stepHtml+='<p>Headsign : ' + transit.headsign + '</p><ul><li>'+ transit.departure_time.text +
            '  Depart at '+ transit.departure_stop.name + '</li><li>'+transit.arrival_time.text +'  Arrive at  '+
            step.transit.arrival_stop.name + '</li></ul>';
          }
          stepsHtml+=stepHtml+'<hr>';
        });
        optionHtml='<div class="options"><p>First available option : </p>'+ imgIcon +'<p>'+ leg.departure_time.text + ' to '+
        leg.arrival_time.text +'</p><div class="steps hidden">';
        optionHtml+='<hr>'+stepsHtml;
      });
      optionHtml+='</div></div>';

    $('.js-directions-result').html(optionHtml);
    });
  optionListeners();
}

function optionListeners(){
  $('.options').click(function(event){
    event.stopPropagation();
    $(this).find('.steps').toggleClass('hidden');
  });
}
