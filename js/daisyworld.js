/*
* JS impl of daisyworld simulation
*
* (C) 2012 Chris Alexander
* siu07cja@reading.ac.uk / siu07cja@gmail.com
*/
var DaisyWorld = {

	/*
	* Parameters
	*/
	
	// Configuration of the types of daisy
	daisies: [
		{
			"Label": "White",
			"Albedo": 0.75,
			"IdealTemperature": 22.5,
			"MaxTemperature": 40,
			"Enabled": true
		},
		{
			"Label": "Black",
			"Albedo": 0.25,
			"IdealTemperature": 22.5,
			"MaxTemperature": 40,
			"Enabled": true
		}
	],

	// Albedo of the soil
	soilAlbedo: 0.5,
	
	// Albedo of the planet
	pAlbedo: 0,
	
	// Temperature of the planet
	pTemperature: 0,
	
	// Solar flux density constant
	//solarFluxDensityConstant: 3399,
	solarFluxDensityConstant: 91763426350,
	
	// Stefan-Boltzmann constant
	sbConstant: 5.67032,
	
	// Insulation constant for the planet - how easy it is to transfer heat between areas
	temperatureInsulation: 0.12,
	
	// Death rate for daisies
	globalDeathRate: 0.3,
	
	// How well to converge
	similarityFactor: 1000,
	
	// How many convergence steps when updating the area coverage at each luminosity
	convergenceSteps: 1000,
	
	/*
	* Methods
	*/
	
	// Executes the whole system
	execute: function(startLumens, endLumens, lumenStep, stepCallback, completeCallback) {
	
		// Start up
		this.initialise();
		
		var iterations = Math.floor((endLumens - startLumens) / lumenStep);
		var currentLumens = startLumens;
		
		// Run through the iterations
		for (var i = 0; i < iterations; i++) {
			// Run the step
			var res = this.runStep(currentLumens);
			res["Lumens"] = {
				"Start": startLumens,
				"End": endLumens,
				"Step": lumenStep,
				"Current": currentLumens
			};
			// Call back the run callback function
			stepCallback(res);
			// Move to next lumen value
			currentLumens += lumenStep;
		}
		
		// Execute the complete callback
		completeCallback();
	
	},
	
	// Initialises the whole system
	initialise: function() {
		
		// Reset the daisy populations
		for (var i = 0; i < this.daisies.length; i++) {
			// Reset temp
			this.daisies[i]["Temperature"] = 0;
			this.daisies[i]["Birthrate"] = 0;
			this.daisies[i]["Converged"] = 0;
			this.daisies[i]["Area"] = 0.01;
			this.daisies[i]["LastArea"] = 2;
		}
		
		// Reset parameters
		this.pAlbedo = 0;
		this.soilArea = 1;
		
	},
	
	// Reset daisy populations
	resetPopulations: function() {
	
		for (var i = 0; i < this.daisies.length; i++) {
			if (this.daisies[i]["Area"] < 0.01) {
				this.daisies[i]["Area"] = 0.01;
			}
			if (this.daisies[i]["Area"] > 1) {
				this.daisies[i]["Area"] = 1;
			}
		}
	
	},
	
	// Run the loop
	runStep: function(lumens) {
	
		var converged = 0;
	
		this.resetPopulations();
	
		for (var j = 0; j < this.convergenceSteps; j++) {
			
			this.planetAlbedo();
			this.planetTemperature(lumens);
			this.localTemperature(lumens);
			this.birthrate();
			this.areaChange();
			this.resetPopulations();
		}
	
		return DaisyWorld;
	
	},
	
	// Find planet albedo
	planetAlbedo: function() {
	
		var sum = 0;
		var totalPopulation = 0;
	
		// Iterate through all of the daisies, adding their population*albedo
		for (var i = 0; i < this.daisies.length; i++) {
			if (this.daisies[i]["Enabled"]) {
				sum += this.daisies[i]["Albedo"] * this.daisies[i]["Area"];
				totalPopulation += this.daisies[i]["Area"];
			}
		}
		
		sum += Math.max((1-totalPopulation), 0)*this.soilAlbedo;
	
		this.pAlbedo = sum;
		return this.pAlbedo;
		
	},
	
	// Find planet temperature
	planetTemperature: function(luminosity) {
	
		var temp = Math.sqrt(Math.sqrt((luminosity * this.solarFluxDensityConstant * (1 - this.pAlbedo)) / this.sbConstant));
		
		this.pTemperature = temp;
		return temp;
	
	},
	
	// Find local temperatures
	localTemperature: function(luminosity) {
	
		for (var i = 0; i < this.daisies.length; i++) {
			if (this.daisies[i]["Enabled"]) {
				this.daisies[i]["Temperature"] = Math.sqrt(Math.sqrt(((this.temperatureInsulation * luminosity * this.solarFluxDensityConstant * (this.pAlbedo - this.daisies[i]["Albedo"])) / this.sbConstant) + Math.pow(this.pTemperature, 4)));
			}
		}
	
	},
	
	// Find birth rate for each colour
	birthrate: function() {
	
		for (var i = 0; i < this.daisies.length; i++) {
			if (this.daisies[i]["Enabled"]) {
				this.daisies[i]["Birthrate"] = 1 - (Math.pow(this.daisies[i]["Temperature"] - (this.daisies[i]["IdealTemperature"] + 273), 2)/Math.pow(this.daisies[i]["IdealTemperature"] - this.daisies[i]["MaxTemperature"], 2));
			}
		}
	
	},
	
	// Calculate the changes in area attributed to the 
	areaChange: function() {
	
		// Work out the barren area
		var barren = 0;
		for (var i = 0; i < this.daisies.length; i++) {
			if (this.daisies[i]["Enabled"]) {
				barren += this.daisies[i]["Area"];
			}
		}
		barren = 1 - barren;
	
		for (var i = 0; i < this.daisies.length; i++) {
			if (this.daisies[i]["Enabled"]) {
				this.daisies[i]["Area"] += this.daisies[i]["Area"] * ((this.daisies[i]["Birthrate"]*barren) - this.globalDeathRate);
			}
		}
	
	}
}