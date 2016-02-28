"use strict";
var geoJsonObject;
var lMap;
/*global L*/

var mexLayer;
var mexData;

var dat2Show = 'POBTOT';
var dmin;
var dmax;

$(document).ready(function(){


  var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  });

  lMap = L.map('lMap', {
    scrollWheelZoom: false,
    center: [23.160563309048314, -102.9638671875],
    zoom: 5
  });

  lMap.addLayer(layer);


  lMap.on('click', function(e) {
    console.log(e.latlng);
  });

  addData();

  addLegend();
});


function addData(){
  d3.json( 'data/mgm2015v6_2_4326.topojson', function ( e, json ) {
    var canvas = L.canvas();
    d3.tsv( 'data/ITER_NALMUN_10.tsv', function ( e, data ) {
      mexData = data;
      mexLayer = topojson.feature( json, json.objects['mgm2015v6_2_4326'] );

      var mData = (_.pluck(mexData, dat2Show));
      dmax = _.max(mData.map(function(o){return parseInt(o) || 0;}));
      dmin = _.min(mData.map(function(o){return parseInt(o) || 0;}));
      var scale = chroma.scale(['#F5F5F3', 'yellow', "red", "darkred"]).domain([dmin,dmax], 1 );

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
                  d3.select( ".legend .value" )
                    .attr( "value", (d.NOM_ENT+" - "+d.NOM_MUN+' '+dat2Show+':'+d[dat2Show]));
                }
              },
              mouseout: function() {
                d3.select( ".legend .value" )
                .attr( "value", "" );
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
            var color = scale( (parseInt(d[dat2Show]) || 0) ).hex();
            return {
              fillOpacity: 0.65,
              fillColor: color,
              stroke: 0
            };
          }
        })
      );
    });
  });
}



function addLegend(){
  // Delete existing legend to update it
  d3.select( ".legend" ).remove();

  var   // Legend size
        width = 280,
        padding = 10,

        // Create legend control
        div = d3.select( ".leaflet-bottom.leaflet-left" ).append( "div" )
                  .attr( "class", "legend leaflet-control" ),

        // Display title and unit
        title = div.append( "div" )
                     .attr( "class", "title" )
                     .text( "ITER Nacional 2015 INEGI " )
                     .append( "span" )
                     .text( " (" + dat2Show + ")" ),

        // Input where to display communes on hover
        input = div.append( "input" )
                     .attr( "class", "value" )
                     .attr( "disabled", "" )
                     .attr( "placeholder", "Localidad..." );

        // Prepare linear scale and axis for gradient legend
        // x = d3.scale.linear()
        //             .domain( [$.domain[0], $.domain[$.domain.length-1]] )
        //              .range( [1, width - 2 * padding - 1] ),

        // canvas = div.append( "canvas" )
        //               .attr( "height", padding )
        //               .attr( "width", width - padding )
        //               .node().getContext( "2d" );
  //
  //       gradient = canvas.createLinearGradient( 0, 0, width - 2 * padding, padding ),
  //
  //       stops = $.range.map( function( d, i ) { return { x: x( $.domain[i] ), color:d } } );
  //
  // // Define color stops on the legend
  // for ( var s in stops ) {
  //   gradient.addColorStop( stops[s].x/(width - 2 * padding - 1), stops[s].color );
  // }
  //
  // // Draw the gradient rectangle
  // canvas.fillStyle = gradient;
  // canvas.fillRect( padding, 0, width - 2 * padding, padding );
  //
  // // Draw horizontal axis
  // div.append( "svg" )
  //      .attr( "width", width )
  //      .attr( "height", 14 )
  //    .append( "g" )
  //      .attr( "class", "key" )
  //      .attr( "transform", "translate( 10, 0 )" )
  //      .call( d3.svg.axis()
  //             .tickFormat( d3.format( $.plus + '.0f' ) )
  //             .tickValues( $.domain )
  //               .tickSize( 3 )
  //                  .scale( x )
  //         );
}
