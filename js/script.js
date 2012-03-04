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