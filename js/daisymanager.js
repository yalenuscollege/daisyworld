/*
* JS rendering of daisyworld simulation
*
* (C) 2012 Chris Alexander
* siu07cja@reading.ac.uk / siu07cja@gmail.com
*/
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
	
	// Data for the table
	tableData: [],
	
	// Are we in Firefox?
	firefox: false,
	
	// Run on page load
	load: function() {
		this.reset();
		this.setupHelp();
		this.firefox = navigator.userAgent.indexOf("Firefox") > 0;
		$("#interactive-go").on("click", function(e) {
			e.preventDefault();
			DaisyManager.interactive();
			return false;
		});
		$("#interactive-reset").on("click", function(e) {
			e.preventDefault();
			$("#interactive-opt").val("22.5");
			$("#interactive-max").val("40");
			DaisyManager.interactive();
			return false;
		});
		DaisyManager.interactive();
		$("#resetbtn").on("click", DaisyManager.reset);
		$("#runbtn, #defaultrun").on("click", DaisyManager.go);
		window.setTimeout(function() {
			$("#defaultrun").tooltip("show");
		}, 5000);
		$(".togglebtn").on("click", function(e) {
			e.preventDefault();
			$(".btntoggle").toggleClass("hidden");
			$("#helpbtn").tooltip("hide");
			if (!$("#daisyform").parent().hasClass("hidden")) {
				DaisyManager.populateDaisyData("White");
			} else {
				DaisyManager.saveDaisyData();
			}
			return false;
		});
		$("#daisyselect").on("change", function() {
			var newtype = $(this).val();
			DaisyManager.saveDaisyData();
			DaisyManager.populateDaisyData(newtype);
		});
		DaisyManager.populateDaisyDropdown();
		$("#resetbtn2").on("click", function(e) {
			e.preventDefault();
			DaisyWorld.daisies = [
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
			];
			DaisyManager.populateDaisyData("White");
			return false;
		});
		$("#daisy-create").modal({ "show": false });
		$("#daisy-delete").modal({ "show": false });
		$("#daisy-create-modal").on("click", function(e) {
			e.preventDefault();
			var val = $("#daisy-new-name").val();
			$("#daisy-new-name").val("");
			if (val.length > 0) {
				$("#daisy-create").modal("hide");
				var corrected = val.replace(" ", "");
				corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
				DaisyWorld.daisies.push({
					"Label": corrected,
					"Albedo": 0.75,
					"IdealTemperature": 22.5,
					"MaxTemperature": 40,
					"Enabled": true
				});
				DaisyManager.saveDaisyData();
				DaisyManager.populateDaisyDropdown();
				DaisyManager.populateDaisyData(corrected);
			}
			return false;
		});
		$("#deldaisy").on("click", function(e) {
			e.preventDefault();
			$("#daisy-to-delete").empty().append($("#daisyselect").val());
			$("#daisy-delete").modal("show");
			return false;
		});
		$("#daisy-delete-modal").on("click", function(e) {
			e.preventDefault();
			$("#daisy-delete").modal("hide");
			var target = $("#daisyselect").val();
			var targetint = false;
			for (var i = 0; i < DaisyWorld.daisies.length; i++) {
				if (DaisyWorld.daisies[i].Label == target) {
					targetint = i;
					break;
				}
			}
			if (targetint !== false) {
				DaisyWorld.daisies.splice(targetint, 1);
			}
			DaisyManager.saveDaisyData();
			DaisyManager.populateDaisyDropdown();
			DaisyManager.populateDaisyData(DaisyWorld.daisies[0].Label);
			return false;
		});
		$("#stoprender").on("click", function(e) {
			e.preventDefault();
			$(this).addClass("hidden");
			DaisyManager.stopRender = true;
			return false;
		});
	},
	
	// Populates daisy data in the form
	populateDaisyData: function(type) {
		$("#daisyselect").val(type);
		$("#daisyname").empty().append(type + " daisies");
		$("#daisy-id").val(type);
		
		// Get the data
		var data = null;
		for (var i = 0; i < DaisyWorld.daisies.length; i++) {
			if (DaisyWorld.daisies[i].Label == type) {
				data = DaisyWorld.daisies[i];
				break;
			}
		}
		if (!data) {
			return;
		}
		
		$("#enabled").attr("checked", data.Enabled);
		$("#albedo").val(data.Albedo);
		$("#ideal").val(data.IdealTemperature);
		$("#max").val(data.MaxTemperature);
	},
	
	// Populates the dropdown
	populateDaisyDropdown: function() {
		$("#daisyselect").empty();
		for (var i = 0; i < DaisyWorld.daisies.length; i++) {
			var label = DaisyWorld.daisies[i]["Label"];
			$("#daisyselect").append("<option value=\"" + label + "\">" + label + " daisies</option>");
		}
	},
	
	// Saves daisy data from the form
	saveDaisyData: function() {
		var data = {};
		data.Label = $("#daisy-id").val();
		if ($("#enabled").attr("checked")) {
			data.Enabled = true;
		} else {
			data.Enabled = false;
		}
		data.Albedo = parseFloat($("#albedo").val());
		data.IdealTemperature = parseFloat($("#ideal").val());
		data.MaxTemperature = parseFloat($("#max").val());
		
		for (var i = 0; i < DaisyWorld.daisies.length; i++) {
			if (DaisyWorld.daisies[i].Label == data.Label) {
				DaisyWorld.daisies[i] = data;
				break;
			}
		}
	},
	
	// Bound to when the run button is clicked
	go: function(e) {
		e.preventDefault();
		DaisyManager.simStart();
		DaisyManager.initialise();
		DaisyManager.run();
		return false;
	},
	
	// Update UI for sim start
	simStart: function() {
		$("#simform input, #simform button, #defaultrun, .togglebtn").attr("disabled", "disabled");
		$("#stoprender").removeClass("hidden");
	},
	
	// Update UI on sim end
	simEnd: function() {
		$("#simform input, #simform button, #defaultrun, .togglebtn").removeAttr("disabled");
		if (!$("#defaultrun").parent().hasClass("hidden")) {
			$("#defaultrun").parent().addClass("hidden");
			$("#simform").parent().removeClass("hidden");
			$("#helpbtn").tooltip("show");
		}
		$("#stoprender").addClass("hidden");
	},
	
	// Bound to when the reset button is clicked
	reset: function(e) {
		if (e) {
			e.preventDefault();
		}
		$("#startlumens").val(0.25);
		$("#endlumens").val(2.0);
		$("#lumenstep").val(0.01);
		
		$("#soilalbedo").val(0.5);
		$("#insulation").val(0.12);
		$("#deathrate").val(0.3);
		return false;
	},
	
	// Sets up the help tooltips
	setupHelp: function() {
		$("#simform input.input-small, #daisyform input.input-small").tooltip({
			"animation": true,
			"placement": "right",
			"trigger": "focus"
		});
		$("#simform button, #simform legend, .worldbox table").tooltip({
			"animation": true,
			"placement": "bottom",
			"trigger": "manual"
		});
		$(".graphbox").tooltip({
			"animation": true,
			"placement": "top",
			"trigger": "manual"
		});
		$("#helpbtn").tooltip({
			"animation": true,
			"placement": "top"
		});
		$("#defaultrun").tooltip({
			"animation": true,
			"placement": "top",
			"trigger": "manual"
		});
		$(".togglebtn.ttip").tooltip({
			"animation": true,
			"placement": "top",
			"trigger": "manual"
		});

		$("#helpbtn").on("click", function() {
			$("#simform legend, #simform button, .worldbox table, .graphbox, .togglebtn.ttip").tooltip("show");
		}).on("mouseout", function() {
			$("#simform legend, #simform button, .worldbox table, .graphbox, .togglebtn.ttip").tooltip("hide");
			$(this).tooltip("hide");
		});
		$("#defaultrun").on("mouseover", function() {
			$(this).tooltip("hide");
		});
	},
	
	// Call to initialise the output
	initialise: function() {
		
		// Clean out the data
		this.tempData = [];
		this.daisyData = {};
		this.renderStage = 0;
		this.tableData = [];
		
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
			"colors": ["black"],
			"hAxis": {
				"title": "Time"
			},
			"vAxis": {
				"title": "Temperature"
			},
			"legend": {
				"position": "none"
			}
		};
		var options2 = {
			"title": "DaisyWorld Populations",
			"width": "100%",
			"height": 200,
			"backgroundColor": "#eee",
			"colors": [],
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
	
	// Flag to stop the render
	stopRender: false,
	
	// Render a single step on to the output
	renderStep: function() {

		// Barf out if we reached the end
		if (DaisyManager.renderStage >= DaisyManager.tempData.length || DaisyManager.stopRender) {
			DaisyManager.simEnd();
			DaisyManager.stopRender = false;
			if (DaisyManager.firefox) {
				DaisyManager.graph1.draw(DaisyManager.graph1data, DaisyManager.graph1options);
				DaisyManager.graph2.draw(DaisyManager.graph2data, DaisyManager.graph2options);
			}
			return;
		}
	
		// Update graphs
		if (DaisyManager.renderStage == 0) {
			// Add columns on first run only
			for (var key in DaisyManager.daisyData) {
				DaisyManager.graph2data.addColumn("number", key);
				DaisyManager.graph2options.colors = [];
				for (var i = 0; i < DaisyWorld.daisies.length; i++) {
					var a = Math.round(DaisyWorld.daisies[i].Albedo * 255);
					DaisyManager.graph2options.colors.push("rgb(" + a + "," + a + "," + a + ")");
				}
			}
		}
		DaisyManager.graph1data.addRow([DaisyManager.renderStage, DaisyManager.tempData[DaisyManager.renderStage]]);
		var daisyrow = [DaisyManager.renderStage];
		for (var key in DaisyManager.daisyData) {
			daisyrow.push(DaisyManager.daisyData[key][DaisyManager.renderStage]);
		}
		DaisyManager.graph2data.addRow(daisyrow);
		if (!DaisyManager.firefox) {
			DaisyManager.graph1.draw(DaisyManager.graph1data, DaisyManager.graph1options);
			DaisyManager.graph2.draw(DaisyManager.graph2data, DaisyManager.graph2options);
		} else {
			$("#graph1").empty().append("Due to an SVG issue in Firefox, charts are rendered at the end. Please switch to Chrome or Internet Explorer for real-time renders.");
		}
	
		// Update the table
		var numbers = {};
		for (var i = 0; i < DaisyWorld.daisies.length; i++) {
			var label = DaisyWorld.daisies[i].Label;
			numbers[label] = Math.floor(DaisyManager.daisyData[label][DaisyManager.renderStage]*100);
		}
		DaisyManager.updateTable(numbers);
	
		DaisyManager.renderStage++;
		window.setTimeout(DaisyManager.renderStep, 10);
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
	
		// Clear the table
		$(".worldbox table td").each(function(k, v) {
			$(v).removeClass("occupied").children("img").css("opacity", 0);
		});
		
		var counter = 0;
		for (var i = 0; i < DaisyWorld.daisies.length; i++) {
			var label = DaisyWorld.daisies[i].Label;
			var opacity = DaisyWorld.daisies[i].Albedo;
			if (numbers[label] && numbers[label] > 1) {
				var startcounter = counter;
				for (counter; counter < startcounter + numbers[label]; counter++) {
					var row = Math.floor(counter / 20);
					var col = Math.floor(counter % 20);
					$(".worldbox table tr:nth-child(" + (row+1) + ") td:nth-child(" + (col+1) + ")").addClass("occupied").children("img").css("opacity", opacity);
				}
			}
		}
	
	},
	
	// Reset the table
	tableReset: function() {
		$(".worldbox table").empty();
		for (var i = 0; i < 5; i++) {
			$(".worldbox table").append("<tr></tr>");
			for (var j = 0; j < 20; j++) {
				$(".worldbox table tr:last-child").append("<td><img src=\"../img/daisy-white.png\" /></td>");
				this.tableData.push("soil");
			}
		}
	},
	
	// Interactive chart object
	interactiveChart: false,
	
	// Options for interactive chart
	interactiveChartOptions: {
		"title": "Daisy birth rate",
		"width": "100%",
		"height": 200,
		"backgroundColor": "whiteSmoke",
		"colors": ["black"],
		"hAxis": {
			"title": "Temperature"
		},
		"animation": {
			"duration": 1000,
			"easing": "inAndOut"
		},
		"vAxis": {
			"title": "Birth rate"
		},
		"legend": {
			"position": "none"
		}
	},
	
	// Renders the interactive graph in maths section
	interactive: function() {
		var opt = parseFloat($("#interactive-opt").val());
		var max = parseFloat($("#interactive-max").val());
		var min = opt - (max - opt);
		
		var data = new google.visualization.DataTable();
		data.addColumn("number", "Temperature");
		data.addColumn("number", "Birth rate");
		for (var i = min; i <= max; i+= 0.1) {
			var res = 1 - (Math.pow(i - opt, 2)/Math.pow(opt - max, 2));
			data.addRow([i, res]);
		}
		if (!DaisyManager.interactiveChart) {
			DaisyManager.interactiveChart = new google.visualization.LineChart(document.getElementById('interactive-graph'));
		}
		DaisyManager.interactiveChart.draw(data, DaisyManager.interactiveChartOptions);
	}

}