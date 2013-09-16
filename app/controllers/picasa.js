var appConfig = require('config').app,
    PicasaLoader = require(appConfig.APP_DIR + '/lib/picasaLoader');

function renderError( req, res, result ) {
    var msg ='';
    switch(result.errorType) {
        case 'NO_USER':
            msg = 'User with name <span>' + req.params.username + '</span><br> was not found.';
            break;
        case 'NO_ALBUM':
            msg = 'Album was not found.<br><a href="#">View authors page</a>';
            break;
        default:
            msg = 'Unknown error. [errorType = "' + result.errorType + '"]';
    }
    res.render('error', {errorMsg: msg});
}

function renderUser( req, res, result ) {
    console.log(result);
    if (!result || result.error) {
        renderError(req, res, result);
    }
    else {
        res.render('user', result);
    }
}
function renderAlbum( req, res,  result ) {
    console.log( result );
    if (!result || result.error) {
        renderError(req, res, result);
    }
    else {
        res.render('album', result);
    }
}

module.exports = {

    index: function( req, res, next ) {
        res.render('registration', {header: "index"});
    },

    user: function( req, res, next ) {
        PicasaLoader.getUser(req.params.username, function(result) {
            renderUser(req, res, result);
        });
    },

    album: function( req, res, next ) {
        PicasaLoader.getAlbum(req.params.username, req.params.album, function(result) {
            renderAlbum(req, res, result);
        });
    }

}