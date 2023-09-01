
//set the map height according to the window. It's set to a fixed value in CSS before the JS is loaded.
document.getElementById("map").style.height = (window.innerHeight + "px");

//LEAFLET CONFIGURATION - init
var map = L.map('map').setView([47.67622, -2.22378], 13);

//LEAFLET CONFIGURATION - overlay + layers (OSM + GGL)
var osm =           L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    googleSat =     L.tileLayer('http://{s}.google.com/vt?lyrs=s&x={x}&y={y}&z={z}',	{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    googleTerrain = L.tileLayer('http://{s}.google.com/vt?lyrs=p&x={x}&y={y}&z={z}',	{maxZoom: 20,subdomains:['mt0','mt1','mt2','mt3']}),
	googleHybrid =  L.tileLayer('http://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}',	{maxZoom: 20,subdomains:['mt0','mt1','mt2','mt3']});

var baseMaps = {
    "OpenStreetMap": osm,
    "Google Satellite": googleSat,
    "Google Satellite + noms": googleHybrid,
    "Google Relief": googleTerrain
};

var overlays =  {//add any overlays here

    };

L.control.layers(baseMaps,overlays, {position: 'bottomleft'}).addTo(map);

//LEAFLET CONFIGURATION - default overlay
osm.addTo(map);

//cleaning leaflet by removing that cringy flag
let flag = document.getElementsByTagName("A")[3];
flag.removeChild(flag.firstChild);

//my data
let cadastre = [
	{color:'#FF9B21', name:'Lot 1', data:[{section:'zv', numero:89}, {section:'zv', numero:90}]},
	{color:'#FF3AC0', name:'Lot 2', data:[{section:'zt', numero:114}, {section:'zt', numero:115},{section:'zt', numero:139},{section:'zt', numero:190},{section:'zt', numero:211},{section:'zt', numero:212},{section:'zv', numero:11},{section:'zv', numero:3},{section:'zv', numero:37}]},
	{color:'#5EA1FF', name:'Lot 3', data:[{section:'zv', numero:76}, {section:'zv', numero:77}]}
	];

for( let article of cadastre)
{
	for(let parcelle of article.data)
	{
		let num = parcelle.numero.toString();
		num = num.padStart(4, '0'); //format to a 4 digit string padded with 0 on the left as a requirement forthe API
		let url = 'https://apicarto.ign.fr/api/cadastre/parcelle?code_insee=56221&section=' + parcelle.section.toUpperCase() + '&numero=' + num + '&source_ign=PCI'
		fetch(url).then((response) => { 
			return response.json().then((data) => {
				showDivisionGeometryWithText(data, article.name, article.color);
				return data;
			}).catch((err) => {
				console.log(err);
			}) 
		});
	}
}

function showDivisionGeometryWithText(data, text, lineColor)
{
	let divisionPolygon =  swapPairsOfArray(data.features[0].geometry.coordinates[0][0]);
	let divisionName = text + ' : ' + data.features[0].properties.section + ' ' + data.features[0].properties.numero;
	let boundingBox = L.polygon(divisionPolygon,{color: lineColor, fillColor: 'white', fillOpacity: 0.0}).addTo(map).bindPopup(divisionName);
}

//the API gives coordinates in a a/b format andleaflet requires a b/a format. IDK which one is wrong and it doesn't matter.
function swapPairsOfArray(data)
{
	let result = [];
	for(let pair of data)
		result.push([pair[1],pair[0]]);
	return result;
}
