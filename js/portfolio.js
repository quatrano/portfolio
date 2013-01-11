//this is the portfolio object
//contains an array of articles and some functions
//important public functions:
	//downloadArticles(); will download JSON and create objects for articles
	//showThumbnails(type); will show the landing page with thumbnails of the specified type 
		// loadThumbnails(); writes the HTML for the thumbnails and preloads the images
		// getLandingImages(); returns an array of images on the landing page
	//showArticle(articleId); will show the article with [type, id]

var Portfolio = function(n){
	var documentHeight = window.innerHeight;
	var documentWidth = window.innerHeight;
	this.articleCount = n;
	this.articles = new Array();
	this.thumbnails = new Array();
	this.thumbsLoaded = false;
	this.visitMonitor = new VisitMonitor();
	this.currentView = 0;
	this.example = example;
		function example(){
		console.log('example...');
		}
}

Portfolio.prototype.updateView = function updateView(origin, destination){
	var thisPortfolio = this;
	var theseArticles = this.articles;
	//simplify the origin and destination
		//loading: -1
		//thumbnails: 0
		//article: 1, 2, 3... etc.
	function getType(location){
		var typeID;
		if (typeof location == 'number'){
			typeID = location;
		} else if (typeof location == 'object'){
			if (location.length == 2){ //is an article
				var type = location[0];
				var number = location[1];
				for(var i=1; i<theseArticles.length; i++){
					var thisArticle = theseArticles[i];
					if (thisArticle.thumbnail.num == number){
						if (thisArticle.thumbnail.type.toLowerCase() == type){
							typeID = i;
						}
					}
				}
			} else { //is the landing page
				typeID = 0;
			}
		} else {
		typeID = -1;
		}
			return typeID;
	}

	var originID = getType(origin);
	var destinationID = getType(destination);
	
	//check whether the destination is loaded or not
	var destinationLoaded = false;
	if ( destinationID == 0 ){ //destination = landing page
		destinationLoaded = thisPortfolio.thumbsLoaded;
	} else { //destination = an article
		destinationLoaded = thisPortfolio.articles[destinationID].fullyLoaded;
	}

	//if the destination isn't loaded, load the destination
		//when you're done, hide the origin and show the destination
	if ( !destinationLoaded ){
		if (destinationID == 0){ //going to the landing page
			thisPortfolio.loadThumbnails(function() {
				console.log('finished loading thumbs');
				thisPortfolio.visitMonitor.logVisit(destinationID);
				thisPortfolio.hideOrigin(originID);
				thisPortfolio.showDestination(destinationID, destination);
			});
		} else { //going to an article
			thisPortfolio.articles[destinationID].fullyLoad(function() {
				thisPortfolio.visitMonitor.logVisit(destinationID);
				thisPortfolio.hideOrigin(originID);
				thisPortfolio.showDestination(destinationID, destination);
			});
		}
	} else if ( destinationID == originID && destinationID == 0){ //staying at landing page
		console.log('staying on landing page');
		thisPortfolio.showThumbnails(destination[0]);
	} else { //hide the origin and show the destination immediately
		thisPortfolio.visitMonitor.logVisit(destinationID);
		thisPortfolio.hideOrigin(originID);
		thisPortfolio.showDestination(destinationID, destination);
	}	
return destinationID;
}

Portfolio.prototype.hideOrigin = function hideOrigin(originID){
	var thisPortfolio = this;
		if (originID == -1){ //coming from the loading page
			thisPortfolio.hideLoading();
		} else if (originID == 0){ //coming from the landing page
			thisPortfolio.hideThumbnails();
		} else { //coming from an article
			thisPortfolio.hideArticle(originID);
		}
	}

Portfolio.prototype.showDestination = function showDestination(destinationID, destination){
	var thisPortfolio = this;
	if (destinationID == 0){ //going to the landing page
		if (typeof destination == 'object'){
			thisPortfolio.showThumbnails(destination[0]);
		} else {
			thisPortfolio.showThumbnails('all');
		}
	} else { //going to an article
		thisPortfolio.showArticle(destinationID);
	}
}

Portfolio.prototype.downloadArticles = function downloadArticles(done){
	console.log('downloading articles');
	var articles = this.articles;
	var remainingArticles = this.articleCount;
	for(var i=1, c=this.articleCount; i<=c; i++){
		articleUrl = './content/' + i + '/' + i + '.json';
		var jqxhr = $.getJSON(articleUrl, function(data) {
			articles[data.id] = new Article(data);
		})
		.success(function() { 
			remainingArticles -=1;
		})
	}
	var checkprogress = window.setInterval(function(){
		if(remainingArticles == 0){
			window.clearInterval(checkprogress);
			done();
		}
	},900);
}

Portfolio.prototype.hideArticle = function(articleId){
	$('.navbar').addClass('floating');
	$('.navbar').removeClass('top');
	$(window).unbind('scroll');
	this.articles[articleId].hideArticle();
}

Portfolio.prototype.hideThumbnails = function(){
	$('#landing').fadeOut();
}

Portfolio.prototype.hideLoading = function(){
	$('#loading').fadeOut();
	$('#loading').addClass('transparent');
	$('.navbar').show();
}

Portfolio.prototype.showThumbnails = function(type){
	console.log('showThumbnails');
	var articles = this.articles;
	$('.navbar').fadeIn();
	$('#landing').fadeIn();
	if (type=='all' || type==''){
		$('#landing').isotope({ filter: '*'});
	}
	else {
		var selector = '.' + type;
		$('#landing').isotope({ filter: selector});
	}
}

Portfolio.prototype.showArticle = function(articleId){
	var thisArticle = this.articles[articleId];
	console.log(articleId);
	thisArticle.showArticle();
}

Portfolio.prototype.loadThumbnails = function(done){
	//show thumbnail loading page (full screen load)
		//for now it starts shown
	//preload images
	var articles = this.articles;
	preload(this.getLandingImages());
	//(hidden) write html
	for (var i=this.articleCount; i>0; i--){
		var type = articles[i].thumbnail.type;
		var thumbnailContainer = '<div class="thumb-container ' + type + '" id="thumbnail' + i + '"></div>';
		$('#thumbSpacer').after(thumbnailContainer);
		$('#thumbnail' + i).html(articles[i].thumbHtml());
		addBehavior('#thumb'+i);
	}
	//record that the thumbs have been loaded
	this.thumbsLoaded = true;
	$('#landing').isotope({
		itemSelector : '.thumb-container',
		layoutMode : 'masonry'
	});
	$('#landing').isotope({
		masonry: {
    		columnWidth: 161
  		}
  	});
	done();
}

Portfolio.prototype.getLandingImages = function(){
	var articles = this.articles;
	var imgPaths = new Array();
	imgPaths[0] = '../bootstrap/img/nav/all.png';
	imgPaths[1] = '../bootstrap/img/nav/allOver.png';
	imgPaths[2] = '../bootstrap/img/nav/conceptual.png';
	imgPaths[3] = '../bootstrap/img/nav/conceptualOver.png';
	imgPaths[4] = '../bootstrap/img/nav/digital.png';
	imgPaths[5] = '../bootstrap/img/nav/digitalOver.png';
	imgPaths[6] = '../bootstrap/img/nav/physical.png';
	imgPaths[7] = '../bootstrap/img/nav/physicalOver.png';
	for (var i=1, c=this.articleCount; i<=c; i++){
		var tmpPaths = new Array();
		tmpPaths = articles[i].thumbPaths();
		imgPaths = imgPaths.concat(tmpPaths);
	}
	return imgPaths;
}