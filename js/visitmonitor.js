/* Logs Article Visits and Allows lookup on articles */
var VisitMonitor = function(){
  this.cookieHandler = new CookieHandler();
  this.cookieKey = 'visits'; 
  this.cookieExp = 10; //cookie expires in 10 days
}

// gets article visited cookie and parses it
VisitMonitor.prototype.getVisitsList = function(){
  var visits = this.visits;
  // sets visit object to hold all the values of the articles visited otherwise an empty object (if cookie hasn't been set yet)
  var visitsRaw = this.cookieHandler.getCookie(this.cookieKey);
  if (visitsRaw) {
    visits = JSON.parse(visitsRaw);
  }
  return visits;
}

VisitMonitor.prototype.logVisit = function(articleId) {
  var visits = {};
  visits[articleId] = 'seen';
  // save the new counter
  this.cookieHandler.setCookie(this.cookieKey,JSON.stringify(visits), this.cookieExp);
  return visits;
}

// haveBeenSeen determines if an article has been seen.
// If an object array is passed in, it will return an array of articles which have been seen.
// if a single string is passed in, function will return true if article has been seen.
VisitMonitor.prototype.haveBeenSeen = function(articleList) {
  var visits = this.getVisitsList();
  if(typeof articleList === 'string'){
    // passed single string, return whether it has been seen
     return visits[articleList] == 'seen';
  }
  else {
    // passed in array of articles, return object with article as key and true/false as value
    var hasBeenSeen = {};
    for (var articleId in articleList) {
      hasBeenSeen[articleList[articleId]] = visits[articleList[articleId]] == 'seen';
    }
    return hasBeenSeen;
  }
}