let raf = {};
(function() {
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !raf.requestAnimationFrame; ++x) {
        raf.requestAnimationFrame = raf[vendors[x]+'RequestAnimationFrame'];
        raf.cancelAnimationFrame = raf[vendors[x]+'CancelAnimationFrame'] 
                                   || raf[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!raf.requestAnimationFrame)
        raf.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!raf.cancelAnimationFrame)
        raf.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
export default raf;