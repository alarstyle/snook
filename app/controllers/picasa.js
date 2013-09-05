var appConfig = require('config').app,
    PicasaLoader = require(appConfig.APP_DIR + '/lib/picasaLoader');

module.exports = {

    index: function( req, res, next ) {
        res.render('registration', {header: "index"});
    },

    user: function( req, res, next ) {
        function renderUser( result ) {
            console.log(result);
            if (!result || result.error) {
                res.render('error', result);
            }
            else {
                res.render('user', result);
            }
        }
        PicasaLoader.getUser(req.params.user, renderUser);
    },

    album: function( req, res, next ) {
        function renderAlbum( result ) {
            console.log( result );
            if (!result || result.error) {
                res.render('error', result);
            }
            else {
                res.render('album', result);
            }
        }
        PicasaLoader.getAlbum(req.params.user, req.params.album, renderAlbum);
    }

}