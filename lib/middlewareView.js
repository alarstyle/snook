/**
 * Module dependencies.
 */


/**
 * 
 */

module.exports = function middlewareView(){
  return function middlewareView(req, res, next) {
    console.log("----------------");
    //console.log(req);
    
    next();
  };
};