var appVersion = '1.00';

var store = window.localStorage;
//var domain = 'www.edu-20.com';
//var domain = 'www.matrixlms.com';
//var domain = 'www.neolms.com';
//var domain = 'www.matrix-lms.com';

//branded apps
//var domain = 'mckesson.medpower.org';
//var domain = 'nyack.medpower.org';
//var domain = 'k2t.matrixlms.com';
//var domain = 'sandbox.edu-20.com:3000';
//var domain = 'carroll.medpower.org';
//var domain = 'ecampus.matrixlms.com';
//var domain = 'www.cuohde.com';
//var domain = 'indigolearn.com';
// var domain = 'edu.bibehk.com';
// var domain = 'sankitraining.matrixlms.com';
//var domain = 'hogaresunion.matrixlms.com';
var domain = 'publishers-institute.biblesocieties.org';

var domainProtocol = 'http';
// var domainProtocol = 'https';

//for regular app
// var loginUrl = domainProtocol + '://' + domain + '/app/launch?version=' + appVersion + '&mobile_app=true&new_ios_app=true&left_nav=true&new_left_nav=true&redirected=true&new_jwplayer=true';
// var isBrandedApp = false;

//for branded app
var loginUrl = domainProtocol + '://' + domain + '/?mobile_app=true&branded_app=true&left_nav=true&new_left_nav=true&redirected=true&new_jwplayer=true';
var isBrandedApp = true;

var isFirst = true;
var wasOffline = false;
var isPageLoaded = false;
var pageReloadCount = 0;
var maxRetriesReached = false;
var fowardLink = '';
var schoolDomain = '';
var schoolProtocol = 'http';
var loggedIn = false;
var fileToUpload = '';
var pushToken = '';
var connectionTimeout = 1;
var connectionTimeoutSeconds = 300;
var loadedStylesheets = false;
var portalStylesheet = '';
var headerContent = '';
var leftNavContent = '';
var leftNavHeight = 0;
var mobileNavContent = '';
var addedMessageListener = false;
var pageHistory = [];
var pageHistoryMarker = -1;
var canGoBack = false;
var canGoForward = false;
var wentBack = false;
var wentForward = false;
var API = {};
var androidSenderID = "605038852521";
var originalHeight = $(window).height();
var originalWidth = $(window).width();
var loadingOverlayTimeoutAmount = 2000;
var loadingOverlayShowAmount = 1500;
var loadingOverlayTimeout = 0;
var canHideLoadingOverlay = true;
var canShowLoadingOverlay = false;
var checkHideLoadingOverlay = 0;
var messages_box_offset = 0;
var canLogIn = true;
var headContent = '';
var bodyContent = '';
var editorContent = '';
var ssoWindow = null;
var appPreloader = null;
var canLoadNotification = false;
var canRefreshHeader = true;

(function($){
 $.fn.getStyleObject = function(){
 var dom = this.get(0);
 var style;
 var returns = {};
 if(window.getComputedStyle){
 var camelize = function(a,b){
 return b.toUpperCase();
 }
 style = window.getComputedStyle(dom, null);
 for(var i=0;i<style.length;i++){
 var prop = style[i];
 var camel = prop.replace(/\-([a-z])/g, camelize);
 var val = style.getPropertyValue(prop);
 returns[camel] = val;
 }
 return returns;
 }
 if(dom.currentStyle){
 style = dom.currentStyle;
 for(var prop in style){
 returns[prop] = style[prop];
 }
 return returns;
 }
 return this.css();
 }
 })(jQuery);

function isolatedScroll(element) {
	element.bind('mousewheel DOMMouseScroll', function(e) {
                 var delta = (e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail);
                 var bottomOverflow = ((this.scrollTop + $(this).outerHeight() - this.scrollHeight) >= 0);
                 var topOverflow = (this.scrollTop <= 0);
                 
                 if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
                 e.preventDefault();
                 }
                 });
    
	return element;
};
