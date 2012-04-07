var DaisyManager = {

	// The raw data from the model
	rawData: {},

	// The graph 1 data object
	graph1data: {},
	
	// The graph 2 data object
	graph2data: {},
	
	// Graph 1
	graph1: {},
	
	// Graph 2
	graph2: {},
	
	// Temperature data
	tempData: [],
	
	// Daisy population data
	daisyData: {},
	
	// The current render step
	renderStage: 0,

	// Options for graph 1
	graph1options: {},
	
	// Options for graph 2
	graph2options: {},
	
	// Call to initialise the output
	initialise: function() {
		
		// Clean out the data
		this.tempData = [];
		this.daisyData = {};
		this.renderStage = 0;
		
		// Setup the data objects
		this.graph1data = new google.visualization.DataTable();
		this.graph2data = new google.visualization.DataTable();
		this.graph1data.addColumn("number", "");
		this.graph1data.addColumn("number", "Temperature");
		this.graph2data.addColumn("number", "");
		
		// Graph options
		var options1 = {
			"title": "DaisyWorld Temperature",
			"width": "100%",
			"height": 200,
			"backgroundColor": "#eee",
			"colors": ["white","black"],
			"hAxis": {
				"title": "Time"
			},
			"vAxis": {
				"title": "Temperature"
			}
		};
		var options2 = {
			"title": "DaisyWorld Populations",
			"width": "100%",
			"height": 200,
			"backgroundColor": "#eee",
			"colors": ["white","black"],
			"hAxis": {
				"title": "Time"
			},
			"vAxis": {
				"title": "Daisy populations"
			}
		};
		this.graph1options = options1;
		this.graph2options = options2;
		
		// Setup the graphs
		this.graph1 = new google.visualization.LineChart(document.getElementById('graph1'));
		this.graph2	= new google.visualization.LineChart(document.getElementById('graph2'));
		
		$(".graphbox").empty();
		
		// Reset the table
		this.tableReset();
	},
	
	// Run the daisy world
	run: function() {
	
		// Configure the daisy world
		var options = this.configureDaisyWorld();
	
		// Run DaisyWorld
		DaisyWorld.execute(options.startLumens, options.endLumens, options.lumenStep, function(e) {
			DaisyManager.tempData.push(e.pTemperature - 273);
			
			for (var i = 0; i < e.daisies.length; i++) {
				if (!DaisyManager.daisyData[e.daisies[i]["Label"]]) {
					DaisyManager.daisyData[e.daisies[i]["Label"]] = [];
				}
				DaisyManager.daisyData[e.daisies[i]["Label"]].push(e.daisies[i]["Area"]);
			}
		}, DaisyManager.renderStep);
	
	},
	
	// Render a single step on to the output
	renderStep: function() {

		// Barf out if we reached the end
		if (DaisyManager.renderStage >= DaisyManager.tempData.length) {
			return;
		}
	
		// Update graphs
		if (DaisyManager.renderStage == 0) {
			// Add columns on first run only
			for (var key in DaisyManager.daisyData) {
				DaisyManager.graph2data.addColumn("number", key);
			}
		}
		DaisyManager.graph1data.addRow([DaisyManager.renderStage, DaisyManager.tempData[DaisyManager.renderStage]]);
		var daisyrow = [DaisyManager.renderStage];
		for (var key in DaisyManager.daisyData) {
			daisyrow.push(DaisyManager.daisyData[key][DaisyManager.renderStage]);
		}
		DaisyManager.graph2data.addRow(daisyrow);
		DaisyManager.graph1.draw(DaisyManager.graph1data, DaisyManager.graph1options);
		DaisyManager.graph2.draw(DaisyManager.graph2data, DaisyManager.graph2options);		
	
		// Update the table
		var numbers = {"Black": Math.floor(DaisyManager.daisyData["Black"][DaisyManager.renderStage]*100), "White": Math.floor(DaisyManager.daisyData["White"][DaisyManager.renderStage]*100)};
		DaisyManager.updateTable(numbers);
	
		DaisyManager.renderStage++;
		window.setTimeout(DaisyManager.renderStep, 50);
	},
	
	// Configures the various classes
	configureDaisyWorld: function() {
		var options = {};
		
		options.startLumens = parseFloat($("#startlumens").val());
		options.endLumens = parseFloat($("#endlumens").val());
		options.lumenStep = parseFloat($("#lumenstep").val());
		
		DaisyWorld.soilAlbedo = parseFloat($("#soilalbedo").val());
		DaisyWorld.temperatureInsulation = parseFloat($("#insulation").val());
		DaisyWorld.globalDeathRate = parseFloat($("#deathrate").val());
		
		return options;
	},
	
	// Updates the table rendering
	updateTable: function(numbers) {
	
		$(".worldbox table td").each(function(k, v) {
			$(v).removeClass("black").removeClass("white");
		});
		
		for (var i = 0; i < numbers["Black"]-1; i++) {
			var row = Math.floor(i / 20);
			var col = Math.floor(i % 20);
			$(".worldbox table tr:nth-child(" + (row+1) + ") td:nth-child(" + (col+1) + ")").addClass("black");
		}
		
		for (var i = 0; i < numbers["White"]-1; i++) {
			var row = 4 - Math.floor(i / 20);
			var col = 19 - Math.floor(i % 20);
			$(".worldbox table tr:nth-child(" + (row+1) + ") td:nth-child(" + (col+1) + ")").addClass("white");
		}
	
	},
	
	// Reset the table
	tableReset: function() {
		$(".worldbox table").empty();
		for (var i = 0; i < 5; i++) {
			$(".worldbox table").append("<tr></tr>");
			for (var j = 0; j < 20; j++) {
				$(".worldbox table tr:last-child").append("<td></td>");
			}
		}
	}

}