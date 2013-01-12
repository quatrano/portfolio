//this is the article object
//contains an array of rows and some functions
//important public functions:
	//fullyLoad(); will download images, write the html, calculate the layout
	//show(); will show an article
	//thumbPaths(); will return the paths to all thumbs for this article
	//thumbHtml(); will spit out html for the thumbnail for this article
	//writeHtml(); will write the html for the article to the DOM
	//show(); will show the article, add IDs and turn on the scroll Monitor

var Article = function(articleObj){
	var content = articleObj;
	if (content.id && typeof content.id == 'number'){
		this.id = content.id;
	}
	else {console.log('error reading id');}
	if (content.thumbnail && typeof content.thumbnail == 'object'){
		this.thumbnail = content.thumbnail;
	}
	else {console.log('error reading thumbnail');}
	if (content.rows && typeof content.rows == 'object'){
		this.rows = content.rows;
	}
	else {console.log('error reading rows');}
	this.fullyLoaded = false;
	this.scrollMonitors = new Array();
}

Article.prototype.fullyLoad = function(done){
	var thisArticle = this;
	preload(thisArticle.imgPaths());
	thisArticle.writeHtml();
	thisArticle.showArticle();
	setTimeout( function() {
		thisArticle.calculateLayout();
		thisArticle.hideArticle();
		thisArticle.fullyLoaded = true;
		done();
	}, 1000 );	
}

Article.prototype.calculateLayout = function(){
	var n = this.id;
	var rowHeights = new Array();
	var navHeight = $('.navbar').outerHeight();
	var headerHeight = $('header').outerHeight();
		rowHeights[0]=(navHeight + headerHeight);
		//this is where the top of the article will be positioned.
	var scrollMonitors = this.scrollMonitors;
	var articleSelector = '#article' + n;
	//$(articleSelector).addClass('behind');
	$('#article').show();
	$(articleSelector).show();
	var theseRows = this.rows;
	for (var i=0; i<=theseRows.length; i++){
		//i iterates through all the rows.
		var colSelector = '#row' + i + ' .column';
		var maxHeight = 0;
		var theseColumns = $(colSelector);
		for (var j=0; j<theseColumns.length; j++){
			//j iterates thorugh all the columns in this row
			var thisColumn = theseColumns[j];
			var thisHeight = $(thisColumn).outerHeight();
			if (thisHeight > maxHeight){
				maxHeight = thisHeight;
			}
		}
		rowHeights[i+1] = (maxHeight);
		var newHight = 'height:' + rowHeights[i+1] + 'px;';
		rowHeights[i+1] += rowHeights[i];
		var newTop = 'top:' + rowHeights[i] + 'px;' + newHight;
		$('#row' + i).attr('style',newTop)
		var floatSelector = '#article' + n + ' #row' + i + ' .floater';
		var theseFloaters = $(floatSelector);
		console.log('there are: ' + theseFloaters.length + ' floaters');
		for (var j=0; j<theseFloaters.length; j++){
			//j iterates though all the floaters in this row
			var thisFloater = theseFloaters[j];
			var thisHeight = $(thisFloater).outerHeight()
			var floaterId = 'floater' + scrollMonitors.length;
//			$(thisFloater).attr('id', floaterId);
			floaterId = '#' + floaterId;
			var floatingBounds = new Array();
			floatingBounds[0]= rowHeights[i] - navHeight;
			floatingBounds[1]= rowHeights[i+1] - (navHeight + thisHeight);
			var thisMonitor = new ScrollMonitor(articleSelector, floaterId, floatingBounds);
			scrollMonitors.push(thisMonitor);
		}
	}
	//add a scroll monitor for the nav
	var navBounds = new Array();
	navBounds[0]= headerHeight;
	navBounds[1]= 999999999;
	var navMonitor = new ScrollMonitor('#body', '.navbar', navBounds);
	scrollMonitors.push(navMonitor);
//	$(articleSelector).hide();
//	$(articleSelector).removeClass('behind');
}

Article.prototype.showArticle = function(){
	$('#loading').hide();
	var n = this.id;
	var headerHeight = $('header').outerHeight();
	$("html, body").animate({ scrollTop: 0 });
	$('#article' + n).fadeIn();
	$('#article' + n + ' header').fadeIn();
	if(this.fullyLoaded == true){
		this.floatFloaters(true);
	}
	$(window).scroll();
}

Article.prototype.floatFloaters = function(boolean){
	var thisArticle = this;
	var scrollMonitors = this.scrollMonitors;
	var n = thisArticle.id;
	var floatSelector = '#article' + n + ' .floater';
	var floaters = $(floatSelector);
	if (boolean == true){
		for (var i=0; i<floaters.length; i++){
			var thisFloater = floaters[i];
			var floaterId = 'floater' + i;
			$(thisFloater).attr('id', floaterId);
			scrollMonitors[i].activate(true);
		}
		//activate the scrollmonitor for the nav
		scrollMonitors[scrollMonitors.length-1].activate(true);
	} else {
		for (var i=0; i<floaters.length; i++){
			var thisFloater = floaters[i];
			$(thisFloater).attr('id', '');
			console.log(scrollMonitors[i].activate(false));
		}
		//deactivate the scrollmonitor for the nav
		scrollMonitors[scrollMonitors.length-1].activate(false);
	}
}

Article.prototype.thumbPaths = function(){
	var imgPaths = new Array();
	imgPaths[0] = this.thumbnail.n.url;
	imgPaths[1] = this.thumbnail.no.url;	
	return imgPaths;
}

Article.prototype.writeThumbHtml = function(){
	var id = this.id;
	var num = this.thumbnail.num;
	var ty = this.thumbnail.type;
	var ti = this.thumbnail.title;
	var height = 'h' + this.thumbnail.height;
	var width = 'w' + this.thumbnail.width;
	var nUrl = 'url('+this.thumbnail.n.url+')';
	var noUrl = 'url('+this.thumbnail.no.url+')';
	var thumbnailContainer = '<div class="thumb-container ' + ty + ' ' + height + ' ' +  width + '" id="thumbnail' + id + '"></div>';
		$('#thumbSpacer').after(thumbnailContainer);
	$('#thumbnail' + id).html('<a href="#' + ty.toLowerCase() + '/' + num + '" class="thumb" id="thumb' + id + '" + style="background:' + nUrl + ';"><label style="display:none;"><div class="type">'+ ty + '</div><div class="num">'+ num + '</div><br><div class="title">'+ ti + '</div></label></a>');
	var imgArray = [nUrl, noUrl];
	addBehavior('#thumb'+id, imgArray);
}

Article.prototype.writeHtml = function(){
	var n = this.id;
	var articleContainer = '<div class="article-container behind" id="article' + n + '" style="display:none;"></div>';
	$('#articleSpacer').after(articleContainer);
//generate header HTML
	var num = this.thumbnail.num;
	var ty = this.thumbnail.type;
	var ti = this.thumbnail.title;
	var headerHtml = '<header id="header' + n + '" style="display:none;"><div class="type">'+ ty + '</div><div class="num">'+ num + '</div><div class="title">'+ ti + '</div></header>';
//generate body HTML
	var rows = this.rows;
	var articleHtml = '';
	for (var i=0; i<rows.length; i++){
		//i iterates through all the rows
		var thisRow = rows[i];
		articleHtml += '<div class="row ' + thisRow.type + '" id="row' + i + '">';
		var theseColumns = rows[i].columns;
		for (var j=0; j<theseColumns.length; j++){
			//j iterates through all the columns in this row
			var thisColumn = theseColumns[j];
			articleHtml += '<div class="column ' + thisColumn.type + '">' + thisColumn.content + '</div>';
		}
		articleHtml += '</div>';
	}
	articleHtml += '<div class="row full" id="row' + (i) + '"><div class="scrollTop">scroll to top</div></div>';
//write the HTML
	$('#article' + n).html(headerHtml + articleHtml);
//add the 'scroll to top' behavior
	$('.scrollTop').bind('click', function(){
		$("html, body").animate({ scrollTop: 0 }, 'slow');
	});
}

Article.prototype.showThumbnail = function(){
	var n = this.id;
	$('#thumbnail' + n).fadeIn();
}

Article.prototype.hideThumbnail = function(){
	var n = this.id;
	$('#thumbnail' + n).fadeOut();
}

Article.prototype.hideArticle = function(){
	var n = this.id;
	this.floatFloaters(false);
	$('#article' + n).fadeOut();
	$('#article' + n + ' header').fadeOut();
	$('#article' + n).removeClass('behind');
}

Article.prototype.imgPaths = function(){
	var imgPath = new Array();
	var theseRows = this.rows;
	for (var i=0; i<theseRows.length; i++){
		var theseColumns = theseRows[i].columns;
		for (var j=0; j<theseColumns.length; j++){
			var thisColumn = theseColumns[j];
			var images = $(thisColumn.content).filter('img');
				if (images.length > 0){
					var imgCount = images.length;
					for (var k=0; k<imgCount; k++){
						imgPath.push($(images[k]).attr('src'));
						console.log(imgPath[imgPath.length-1]);
					}
						
				}
		}
	}
	return imgPath;
}

