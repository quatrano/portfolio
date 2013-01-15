//this is the portfolio object
//contains an array of articles and some functions
//important public functions:
	//Portfolio(n); will create a portfolio with n articles
	//downloadArticles(); will download JSON and create objects for articles
	//updateView(from, to); will page article 'from' and [load and] show page 'to'

var Portfolio = function(n){
	var documentHeight = window.innerHeight;
	var documentWidth = window.innerHeight;
	this.articleCount = n;
	this.articles = new Array();
	this.thumbnails = new Array();
	this.thumbsLoaded = false;
	this.visitMonitor = new VisitMonitor();
	this.currentView = 0;
}

Portfolio.prototype.updateView = function updateView(origin, destination){
	var thisPortfolio = this;
	var theseArticles = this.articles;
	//simplify the origin and destination
		//landing: -1
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
			} else { //is the thumbnail page
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
	if ( destinationID == 0 ){ //destination = thumbnail page
		destinationLoaded = thisPortfolio.thumbsLoaded;
	} else { //destination = an article
		destinationLoaded = thisPortfolio.articles[destinationID].fullyLoaded;
	}

	//if the destination isn't loaded, load the destination
		//when you're done, hide the origin and show the destination
	if ( !destinationLoaded ){
		if (destinationID == 0){ //going to the thumbnails page
			thisPortfolio.loadThumbnails(function() {
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
	} else if ( destinationID == originID && destinationID == 0){ //staying at thumbnails page
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
		if (originID == -1){ //coming from the landing page
			$('body').removeClass('landing');
			thisPortfolio.hideLanding();
		} else if (originID == 0){ //coming from the thumbnails page
			$('body').removeClass('thumbnails');
			thisPortfolio.hideThumbnails();
		} else { //coming from an article
			$('body').removeClass('article');
			thisPortfolio.hideArticle(originID);
		}
	}

Portfolio.prototype.showDestination = function showDestination(destinationID, destination){
	var thisPortfolio = this;
	if (destinationID == 0){ //going to the thumbnails page
		if (typeof destination == 'object'){
			var dest = '#'+(destination[0]);
			console.log('showing ' + dest);
			_gaq.push(['_trackPageview', dest]);
			thisPortfolio.showThumbnails(destination[0]);
		} else {
			_gaq.push(['_trackPageview', '#all']);
			console.log('showing ' + '#all');
			thisPortfolio.showThumbnails('all');
		}
	} else { //going to an article
		if(destination[0] && destination[1]){
			var dest = '#'+(destination[0])+'/'+destination[1]
			console.log('showing ' + dest);
			_gaq.push(['_trackPageview', dest]);
		}else{
			var dest = destinationID;
			console.log('showing ' + dest);
			_gaq.push(['_trackPageview', dest]);
		}
		thisPortfolio.showArticle(destinationID);
	}
}

Portfolio.prototype.downloadArticles = function downloadArticles(done){
	var articles = this.articles;
	var remainingArticles = this.articleCount;
	var articleCount = this.articleCount;
	for(var i=1, c=articleCount; i<=c; i++){
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
			_gaq.push(['_trackEvent','ajax_success']);
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
	$('#thumbnails').fadeOut();
}

Portfolio.prototype.hideLanding = function(){
	$('#landing').fadeOut();
	$('#landing').addClass('transparent');
	$('.navbar').show();
}

Portfolio.prototype.showThumbnails = function(type){
	var articles = this.articles;
	$('.navbar').fadeIn();
	$('#thumbnails').fadeIn();
	if (type=='all' || type==''){
		$('#thumbnails').isotope({ filter: '*'});
	}
	else {
		var selector = '.contact, .' + type;
		$('#thumbnails').isotope({ filter: selector});
	}
}

Portfolio.prototype.showArticle = function(articleId){
	var thisArticle = this.articles[articleId];
	thisArticle.showArticle();
}

Portfolio.prototype.loadThumbnails = function(done){
	var theseArticles = this.articles;
	preload(this.getThumbnailImages());
	//tell each article to instert it's own html
	for (var i=this.articleCount; i>0; i--){
		var thisArticle = theseArticles[i]
		thisArticle.writeThumbHtml();
	}
	//add the the footer which is actually a thumb containter too


	//record that the thumbs have been loaded
	this.thumbsLoaded = true;
	$('#thumbnails').isotope({
		itemSelector : '.thumb-container',
		layoutMode : 'masonry'
	});
	$('#thumbnails').isotope({
		masonry: {
    		columnWidth: 161
  		}
  	});
	done();
}

Portfolio.prototype.getThumbnailImages = function(){
	var articles = this.articles;
	var imgPaths = new Array();
	imgPaths[0] = './img/nav/all.png';
	imgPaths[1] = './img/nav/allOver.png';
	imgPaths[2] = './img/nav/conceptual.png';
	imgPaths[3] = './img/nav/conceptualOver.png';
	imgPaths[4] = './img/nav/digital.png';
	imgPaths[5] = './img/nav/digitalOver.png';
	imgPaths[6] = './img/nav/physical.png';
	imgPaths[7] = './img/nav/physicalOver.png';
	for (var i=1, c=this.articleCount; i<=c; i++){
		var tmpPaths = new Array();
		tmpPaths = articles[i].thumbPaths();
		imgPaths = imgPaths.concat(tmpPaths);
	}
	return imgPaths;
}