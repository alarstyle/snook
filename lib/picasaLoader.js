/**
 * Module dependencies.
 */
var request = require('request'),
    _ = require('underscore');

var PicasaLoader = {

    /**
     Get a user's public photos

     @param {String} username The username to fetch photos from
     @param {Function} [callback] The callback to be called when the data is ready
     */

    getUser: function( username, callback ) {
        this._call( 'user', 'user/' + username, callback, {username: username} );
    },

    /**
     * Get photos from an album
     *
     * @param {String} username The username that owns the album
     * @param {String} album The album ID
     * @param {Function} [callback] The callback to be called when the data is ready
     */

    getAlbum: function( username, albumId, callback ) {
        this._call( 'useralbum', 'user/' + username + '/albumid/' + albumId, callback, {username: username} );
    },

    /**
     * call Picasa
     */

    _call: function( type, url, callback, properties ) {

        url = 'https://picasaweb.google.com/data/feed/api/' + url + '?';

        var self = this,
            urlParams = {
            //'kind': 'photo',
            //'access': 'public',
            //'max-results': 30,
            'thumbsize': type === 'user' ? '140c' : '140c,1600u',
            'alt': 'json'
        };

        _.each(urlParams, function( value, key ) {
            url += '&' + key + '=' + value;
        });

        console.log(url);

        request.get({ url: url }, function (error, response, data) {
            console.log(response.statusCode);
            if (!error && response.statusCode === 200) {
                self._parse(type, data, callback, properties);
            }
            else {
                callback({error: true, errorType: type === "user" ? "NO_USER" : "NO_ALBUM"});
            }
        });
    },

    // parse the result and call the callback with the galleria-ready data array

    _parse: function( type, data, callback, properties ) {

        try {
            data = JSON.parse(data);

            var result = {
                author: {
                    id: data.feed.gphoto$user.$t,
                    fullName: data.feed.author[0].name.$t,
                    username: properties.username,
                    url: '/picasa/' + properties.username + '/',
                    remoteUrl: data.feed.author[0].uri.$t,
                    avatar: null
                }
            }

            if (type === 'user') {
                result.author.avatar = data.feed.icon.$t;
                result.author.avatar = data.feed.icon.$t;
                result.albums = [];
                _.each( data.feed.entry, function(entry) {
                    // skip system albums
                    if (entry['gphoto$albumType']) return;
                    result.albums.push({
                        id: entry['gphoto$id']['$t'],
                        url: result.author.url + entry['gphoto$id']['$t'],
                        alias: entry['gphoto$name']['$t'],
                        thumb: entry['media$group']['media$thumbnail'][0]['url'],
                        title: entry['title']['$t'],
                        summary: entry['summary']['$t'],
                        published: entry['published']['$t'],
                        updated: entry['updated']['$t'],
                        imagesNum: entry['gphoto$numphotos']['$t']
                    });
                });
            }
            else {
                result.album = {
                    id: data.feed.gphoto$id.$t,
                    alias: data.feed.gphoto$name.$t,
                    title: data.feed.title.$t,
                    subtitle: data.feed.subtitle.$t
                };
                result.images = [];
                _.each( data.feed.entry, function(entry) {
                    result.images.push({
                        id: entry['gphoto$id']['$t'],
                        thumb: entry['media$group']['media$thumbnail'][0]['url'],
                        url: entry['media$group']['media$thumbnail'][1]['url'],
                        filename: entry['title']['$t'],
                        summary: entry['summary']['$t'],
                        published: entry['published']['$t'],
                        updated: entry['updated']['$t'],
                        position: entry['gphoto$position']['$t']
                    });
                });
            }

        }
        catch (exp) {
            console.log(exp);
            callback({error: true, errorMsg: "Faild to parse data."});
            return;
        }

        callback(result);
    }

}

/**
 * 
 */

module.exports = PicasaLoader;