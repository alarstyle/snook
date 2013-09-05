PicasaLoader =  {

    /**
     Search for anything at Picasa

     @param {String} phrase The string to search for
     @param {Function} [callback] The callback to be called when the data is ready

     @returns Instance
     */

    search: function( phrase, callback ) {
        return this._call( 'search', 'all', {
            q: phrase
        }, callback );
    },

    /**
     Get a user's public photos

     @param {String} username The username to fetch photos from
     @param {Function} [callback] The callback to be called when the data is ready

     @returns Instance
     */

    user: function( username, callback ) {
        return this._call( 'user', 'user/' + username, callback );
    },

    /**
     Get photos from an album

     @param {String} username The username that owns the album
     @param {String} album The album ID
     @param {Function} [callback] The callback to be called when the data is ready

     @returns Instance
     */

    useralbum: function( username, album, callback ) {
        return this._call( 'useralbum', 'user/' + username + '/album/' + album, callback );
    },

    /**
     Set picasa options

     @param {Object} options The options object to blend

     @returns Instance
     */

    setOptions: function( options ) {
        $.extend(this.options, options);
        return this;
    },


    // call Picasa

    _call: function( type, url, params, callback ) {

        url = 'https://picasaweb.google.com/data/feed/api/' + url + '?';

        if (typeof params == 'function') {
            callback = params;
            params = {};
        }

        var self = this;

        params = $.extend({
            //'kind': 'photo',
            'access': 'public',
            //'max-results': 30,
            //'thumbsize': this._getSizes().join(','),
            'alt': 'json'//,
            //'callback': '?'
        }, params );

        $.each(params, function( key, value ) {
            url += '&' + key + '=' + value;
        });

        // since Picasa throws 404 when the call is malformed, we must set a timeout here:

        var data = false;

        /*Galleria.utils.wait({
            until: function() {
                return data;
            },
            success: function() {
                self._parse.call( self, data.feed.entry, callback );
            },
            error: function() {
                var msg = '';
                if ( type == 'user' ) {
                    msg = 'user not found.';
                } else if ( type == 'useralbum' ) {
                    msg = 'album or user not found.';
                }
                Galleria.raise('Picasa request failed' + (msg ? ': ' + msg : '.'));
            },
            timeout: 5000
        });*/

        $.getJSON(url).
            done(function( result ) {
                console.log(result);
                data = result;
            })
            .fail(function(err) {
               console.log(err);
            });
    },


    // parse image sizes and return an array of three

    _getSizes: function() {

        var self = this,
            norm = {
                small: '72c',
                thumb: '104u',
                medium: '640u',
                big: '1024u',
                original: '1600u'
            },
            op = self.options,
            t = {},
            n,
            sz = [32,48,64,72,94,104,110,128,144,150,160,200,220,288,320,400,512,576,640,720,800,912,1024,1152,1280,1440,1600];

        /*$(['thumbSize', 'imageSize']).each(function() {
            if( op[this] in norm ) {
                t[this] = norm[ op[this] ];
            } else {
                n = Galleria.utils.parseValue( op[this] );
                if (n > 1600) {
                    n = 1600;
                } else {
                    $.each( sz, function(i) {
                        if ( n < this ) {
                            n = sz[i-1];
                            return false;
                        }
                    });
                }
                t[this] = n;
            }
        });*/

        return [ t.thumbSize, t.imageSize, '1280u'];

    },


    // parse the result and call the callback with the galleria-ready data array

    _parse: function( data, callback ) {

        var self = this,
            gallery = [],
            img;

        $.each( data, function() {

            img = this.media$group.media$thumbnail;

            gallery.push({
                thumb: img[0].url,
                image: img[1].url,
                big: img[2].url,
                title: this.summary.$t
            });
        });

        callback.call( this, gallery );
    }

};
