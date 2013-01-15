//this script contains the procedure for a session

//create a new portfolio: Portfolio(<article count>);
var myPortfolio = new Portfolio(8);
//set the current location to the loading page
var currentLocation = -1;

$(window).bind('load',function(){
	//once the window is ready
	//bind the hashchange event
  	$(window).bind( 'hashchange', function(e) {
  		//read the new hash
		var url = $.param.fragment();
		url = url.split("\/");
		if ( !url ) {
		//there was an error reading the URL
			console.log('error reading URL');
			navSelect('all');
			window.location.href = '#all';
			myPortfolio.updateView(currentLocation, 0);
		} else {
			if (url[0] == ''){ //no hash on the URL. Take them to the thumbnails from wherever they are
				document.location.hash = "all";
				currentLocation = myPortfolio.updateView(currentLocation, 0);
			}
			else { //there is a hash. Check if its valid.  If so, send them there.
				var hashIsValid = false;
				var validHashes = ['all', 'conceptual', 'digital', 'physical', 'contact'];
				for (var i=0; i<validHashes.length; i++){
					if (url[0] == validHashes[i]){hashIsValid = true};
				}
				if (hashIsValid){
					navSelect(url[0]);
					currentLocation = myPortfolio.updateView(currentLocation, url);
				} else { //hash is invalid
					console.log('invalid URL');
					navSelect('all');
					myPortfolio.updateView(currentLocation, 0);
					currentLocation = 0;
				}
			}
		}
  	});

	$(window).bind( 'resize', function(){
		var windowHeight = $(window).innerHeight();
		var newHeight = 'height:' + windowHeight + 'px;';
		$('#layer1').attr('style',newHeight);
	});

	//download the articles
	myPortfolio.downloadArticles(function (){
		$('#enter').bind( 'click', function(){
			$(window).trigger('hashchange');
		});
		$('.loading').removeClass('loading');
		$(window).trigger('resize');
	});
});

function navSelect(type){
	var scrolled = $(window).scrollTop();
	if (scrolled > 0){
		$("html, body").animate({ scrollTop: 0 });
	}
	$('.nav li').removeClass('active');
	$('#nav' + type).addClass('active');
}

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
    });
	return true;}

function addBehavior(thumbSelector, imgArray){
	$(thumbSelector).mouseenter(function(){
		if(imgArray[1]){
			$(thumbSelector).css('background',imgArray[1])
		}
		$(thumbSelector).addClass('over');
		if ($(thumbSelector + " label").queue("fx").length < 3){
			$(thumbSelector + " label").slideDown();	
		}
	});
	$(thumbSelector).mouseleave(function(){
		if(imgArray[0]){
			$(thumbSelector).css('background',imgArray[0])
		}
		$(thumbSelector).removeClass('over');
		$(thumbSelector + " label").stop();
		$(thumbSelector + " label").slideUp();
	});
}
