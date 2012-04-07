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
	
	// Help notices for builder
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
	
	// Builder charts
	DaisyManager.initialise();
	
});