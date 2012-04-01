// On page load
$(function() {

	// Scrolling effects
	$.stellar();
	
	// Scrolling nav effects
	$("a.animate").on("click", function() {
		var target = $(this).attr("href").replace("#", "");
		var complete = function() {
			window.location.hash = target;
		}
		$.scrollTo("#" + target, 1500, { onAfter: complete });
		return false;
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