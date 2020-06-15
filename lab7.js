//Width and height
const w = 800;
const h = 1000;

//Define path generator
var path = d3.geoPath()
				.projection(projection);
				
//Define quantize scale to sort data values into buckets of color
var color = d3.scaleQuantize()
				.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(255, 255, 229)","rgb(49,163,84)","rgb(0,109,44)"]);
			
		var	projection = d3.geoAlbers()
			.center([114.4, 4.4])
            .rotate([2, 32])
            .parallels([11, 20])
            .scale([4000])
            .translate([w / 2, h / 2]);
			
//Create SVG element
var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);
			
//Load in population data for 1.Draw a choropleth of Vietnam (using one of the attributes on the dataset)
d3.csv("https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn-provinces-data.csv", function(data) {
	
	//Set input domain for color scale
	color.domain([
		d3.min(data, function(d) {return d.population; }),
		d3.max(data, function(d) {return d.population; })
	]);


//Load in GeoJSON data using d3.json()
d3.json("https://raw.githubusercontent.com/TungTh/tungth.github.io/master/data/vn-provinces.json", function(json) {
	
	//Merge the population data and GeoJSON
	//Loop through once for each population data population
	for (var i = 0; i < data.length; i++) {
				
		//Grab province name
		var dataProvince = data[i].ma;
						
		//Grab data population, and convert from string to float
		var dataPopulation = parseFloat(data[i].population);
				
		//Find the corresponding province inside the GeoJSON
		for (var j = 0; j < json.features.length; j++) {
						
			var jsonProvince = json.features[j].properties.Ma;
				
			if (dataProvince == jsonProvince) {
						
				//Copy the data population into the JSON
				json.features[j].properties.population = dataPopulation;
								
				//Stop looking through the JSON
				break;
								
			}
		}		
	}
	
	var center = d3.geoCentroid(json)
	var scale = 400;
	var offset = [w/2, h/2];
	var projection = d3.geoMercator()
						.scale(scale)
						.center(center)
						.translate(offset);
						
     // create the path
    var path = d3.geoPath().projection(projection);

      // using the path determine the bounds of the current map and use 
      // these to determine better values for the scale and translation
      var bounds  = path.bounds(json);
      var hscale  = scale*w  / (bounds[1][0] - bounds[0][0]);
      var vscale  = scale*h  / (bounds[1][1] - bounds[0][1]);
      var scale   = (hscale < vscale) ? hscale : vscale;
      var offset  = [w - (bounds[0][0] + bounds[1][0])/2,
                        h - (bounds[0][1] + bounds[1][1])/2];

      // new projection
      projection = d3.geoMercator().center(center)
        .scale(scale).translate(offset);
      path = path.projection(projection);


	//Bind data and create one path per GeoJSON feature
	svg.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("fill", function(d) {
					   		//Get data population
					   		var population = d.properties.population;
					   		
					   		if (population) {
					   			//If population exists…
						   		return color(population);
					   		} else {
					   			//If population is undefined…
						   		return "#ccc";
		}
		});
		
	});
});