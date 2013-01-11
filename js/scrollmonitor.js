/* watches a single column and floats it when necessary */
var ScrollMonitor = function(articleId, floaterId, floatingBounds){
  this.articleId = articleId;
  this.floaterId = floaterId
  this.startFloating = floatingBounds[0];
  this.stopFloating = floatingBounds[1];
}

ScrollMonitor.prototype.activate = function(boolean){
  var thisMonitor = this;
  var handler = function(){
      thisMonitor.monitor();
  }
  if (boolean == true){
      $(window).bind('scroll', handler);
  } else {
    $(window).unbind('scroll', handler);
  }
}

ScrollMonitor.prototype.monitor = function(){
  var scrolled = $(window).scrollTop();
  var articleSelector = this.articleId;
  var floatSelector = articleSelector + ' ' + this.floaterId;
  var thisFloater = $(floatSelector);
  if (scrolled < this.startFloating){
    if (thisFloater.hasClass('top')==false){
      $(floatSelector).addClass('top');
      $(floatSelector).removeClass('floating');
      $(floatSelector).removeClass('bottom');
    }
  }
  else if (scrolled > this.stopFloating){
      if (thisFloater.hasClass('bottom')==false){
        $(floatSelector).addClass('bottom');
        $(floatSelector).removeClass('top');
        $(floatSelector).removeClass('floating');
      }
  }
  else {
    if (thisFloater.hasClass('floating')==false){
      $(floatSelector).addClass('floating');
      $(floatSelector).removeClass('top');
      $(floatSelector).removeClass('bottom');
    }
  }
}