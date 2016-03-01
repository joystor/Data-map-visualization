"use strict";
var geoJsonObject;
var lMap;
/*global L*/

var mexLayer;
var mexData;
var mexVariables;

var dat2Show = 'POBTOT';
var dmin;
var dmax;
var arrColors = ['lightyellow', 'orange', 'deeppink', 'darkred'];
var scaleColor;

$(document).ready(function(){

// dark_all  light_all
  var lyLight = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  });

  var lyDark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  });

  var lyToner = new L.StamenTileLayer("toner");
  var lyTerrain = new L.StamenTileLayer("terrain");
  var lyWater = new L.StamenTileLayer("watercolor");

  var baseMaps = {
    "Light": lyLight,
    "Dark": lyDark,
    "Stamen Toner":lyToner,
    "Stamen Terrain":lyTerrain,
    "Stamen watercolor":lyWater
  };

  lMap = L.map('lMap', {
    scrollWheelZoom: false,
    center: [23.160563309048314, -102.9638671875],
    zoom: 5
  });

  lMap.addLayer(lyLight);
  lMap.addLayer(lyDark);
  lMap.addLayer(lyToner);
  lMap.addLayer(lyTerrain);
  lMap.addLayer(lyWater);
  L.control.layers(baseMaps, null).addTo(lMap);


  lMap.on('click', function(e) {
    console.log(e.latlng);
  });

  addData();


});


function addData(){
  d3.json( 'data/mgm2015v6_2_4326.topojson', function ( e, json ) {
    var canvas = L.canvas();
    d3.tsv( 'data/ITER_NALMUN_10_utf.tsv', function ( e, data ) {
      mexData = data;
      mexVariables = _.pairs(mexData[0]).map(function(pair){return pair[0];});
      mexLayer = topojson.feature( json, json.objects['mgm2015v6_2_4326'] );

      var mData = (_.pluck(mexData, dat2Show));
      dmax = _.max(mData.map(function(o){return parseInt(o) || 0;}));
      dmin = _.min(mData.map(function(o){return parseInt(o) || 0;}));
      scaleColor = chroma.bezier(arrColors);
      scaleColor = chroma.scale(scaleColor).domain([dmin,dmax], 1 ).correctLightness(true);

      lMap.addLayer(
        new L.GeoJSON(mexLayer, {
          renderer: canvas,
          smoothFactor: 0.3,

          onEachFeature: function ( feature, layer ) {
            layer.on( {
              mouseover: function() {
                var p = feature.properties;
                var d = _.where(mexData,{'ENTIDAD':p.ent,'MUN':p.mun})[0];
                if(d){
                  $('.overInfo').html(d.NOM_ENT+" - "+d.NOM_MUN+' ('+dat2Show+': '+(parseInt(d[dat2Show]).toLocaleString())+')');
                }
              },
              mouseout: function() {
                $('.overInfo').html('Localidades');
              }
            });
          },

          style: function( feature ) {
            var p = feature.properties;
            var d = _.where(mexData,{'ENTIDAD':p.ent,'MUN':p.mun})[0];
            if(!d){
              //console.log('ENTIDAD:'+p.ent+' MUN:'+p.mun);
              return {
                fillOpacity: 0.65,
                fillColor: '#000000',
                stroke: 0
              };
            }
            var color = scaleColor( (parseInt(d[dat2Show]) || 0) ).hex();
            return {
              fillOpacity: 0.65,
              fillColor: color,
              stroke: 0
            };
          }
        })
      );

      addLegend();
    });
  });
}



function addLegend(){
  var range = $('<div />').css('width', '92%').addClass('overInfo-range').appendTo('#Info');
  var lab = $('<div />').html('Municipio...').css('width', '92%').addClass('overInfo').appendTo('#Info');
  var div = $('<div />').css('width', '92%').addClass('gradient').appendTo('#Info');
  var cols = [];
  var scl = parseInt((dmax-dmin)/100);
  for(var i=scl; i<=dmax;i+=scl){
    var color = scaleColor(i).hex();
    var d = $('<div />');
    d.css('width','1%');
    d.css('background',color);
    d.appendTo(div);
  }
  var dL = $('<div />').addClass('infL').html(parseInt(dmin).toLocaleString()).appendTo(range);
  var dR = $('<div />').addClass('infR').html(parseInt(dmax).toLocaleString()).appendTo(range);
}
