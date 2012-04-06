// On page load
$(function() {

	// Scrolling effects
	$.stellar();
	
	// Visualisations
	function drawChart() {

		// Create the data table.
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Topping');
		data.addColumn('number', 'Slices');
		data.addRows([
			['Mushrooms', 3],
			['Onions', 1],
			['Olives', 1],
			['Zucchini', 1],
			['Pepperoni', 2]
		]);

		// Set chart options
		var options = {'title':'How Much Pizza I Ate Last Night',
			'width':"100%",
			'height':200
		};

		// Instantiate and draw our chart, passing in some options.
		var chart = new google.visualization.PieChart(document.getElementById('graph1'));
		chart.draw(data, options);
	}
	drawChart();
	
	// Scrolling nav effects
	$("a.animate").on("click", function() {
		var target = $(this).attr("href").replace("#", "");
		var complete = function() {
			window.location.hash = target;
		}
		$.scrollTo("#" + target, 1500, { onAfter: complete });
		return false;
	});
	
	$("#simform input.input-small").tooltip({
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
	
	$("#helpbtn").on("click", function() {
		$("#simform legend, #simform button, .worldbox table, .graphbox").tooltip("show");
	}).on("mouseout", function() {
		$("#simform legend, #simform button, .worldbox table, .graphbox").tooltip("hide");
		$(this).tooltip("hide");
	});
	
});

var tempstack = [];
var albedostack= [];
var daisy1areastack = [];
var daisy2areastack = [];

function runDaisyWorld() {
	
	DaisyWorld.execute(0.25, 2.0, 0.01, function(e) {
		tempstack.push(e.pTemperature - 273);
		albedostack.push(e.pAlbedo);
		daisy1areastack.push(e.daisies[0]["Area"]);
		daisy2areastack.push(e.daisies[1]["Area"]);
	}, function() { console.log("Done"); });
	
}