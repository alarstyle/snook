/**
 * NODETIME
 */
require('nodetime').profile({
    accountKey: '1ea33d3ab93224453b480f77a6cf090fe44df843',
    appName: 'PrettyAlbums openshift'
});

/**
 * Variables
 */
var logger, errorLogger;

/**
 * Dependencies
 */
var express = require('express'),
    app = express(),
    https = require('https'),
    appConfig = require('config').app,
    http = require('http'),
    ectRenderer = require('ect')({ watch: appConfig.watchTemplates, root: __dirname + '/app/views'}),
    i18n = require("i18n"),
    load = require('express-load'),
    //viewMiddleware =  require('./lib/middlewareView'),
    _ = require('underscore'),
    log4js = require('log4js'),
    async = require('async'),
    models = require('./app/models');

/**
 * Basic configs
 */
i18n.configure({
    locales:['en', 'ru'],       // setup some locales - other locales default to en silently
    defaultLocale: 'en',        // you may alter a site wide default locale
    cookie: 'yourcookiename',   // sets a custom cookie name to parse locale settings from  - defaults to NULL
    directory: './app/lang',    // where to store json files - defaults to './locales'
    updateFiles: false          // whether to write new locale information to disk - defaults to true
});

/**
 * Configer logger
 */
function configureLogger(callback){
    var appenders = [];
    if (appConfig.logToConsole) {
        appenders.push({ type: 'console' });
    }
    if (appConfig.logToFile) {
        appenders.push({ type: 'file', filename: 'logs/all.log', maxLogSize: 1048576, backups: 5 });
        appenders.push({ type: 'file', filename: 'logs/errors.log', maxLogSize: 1048576, backups: 5, category: "errors" });
    }
    log4js.configure({ appenders: appenders, replaceConsole: true });
    logger =  log4js.getLogger(),
    errorLogger =  log4js.getLogger('errors');
    callback(null);
};

/**
 * Handle uncaught exceptions
 */
function handleUncaughtExceptions(callback){
    process.on('uncaughtException', function (err) {
        errorLogger.error(err.stack);
    });
    callback(null);
};

/**
 * Match databes with models
 */
function matchDbWithModels(callback) {
    logger.info('Matching Databse: Started.');
    var sequelize = models.sequelize,
        sequelizeForMatch = models.sequelizeForMatch,
        modelsNames = models.modelsNames;

    // main database sync(), will create new models
    function dbSync(callback) {
        logger.info('Matching Database: Start main database sync.');
        sequelize.sync({logging: false})
            .success(function() {
                logger.info('Matching Database: Success with main database sync.');
                callback(null);
            })
            .error(function(err) {
                errorLogger.error('Matching Database: Fail with main database sync. %s', err.stack);
                callback(err);
            });
    }

    // forced database for match sync(), will delete old tables and create new
    function dbForMatchForcedSync(callback) {
        logger.info('Matching Database: Start database for match sync.');
        sequelizeForMatch.sync({force: true, logging: false})
            .success(function() {
                logger.info('Matching Database: Success with database for match sync.');
                callback(null);
            })
            .error(function(err) {
                errorLogger.error('Matching Database: Fail with database for match sync. %s', err.stack);
                callback(err);
            });
    }

    // comparing tables
    function compareDbs(callback) {
        logger.info('Matching Databse: Start database compare.');
        async.each(modelsNames,
            function(modelName, callback) {
                compareTables(models[modelName].tableName, callback);
            },
            function(err) {
                if (!err) {
                    logger.info('Matching Databse: Success with database compare.');
                }
                callback(err);
            }
        );
    }

    // comparing tables, called from compareDbs()
    function compareTables(tableName, callback) {
        var tableDb, tableDbForMatch;

        async.series(
            [
                // getting columns for table from main database
                function(callback) {
                    sequelize.query("SELECT column_name, is_nullable, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = ?", null, {raw: true, logging: false}, tableName)
                        .success(function(columns) {
                            tableDb = columnsToObject(columns);
                            callback(null);
                        })
                        .error(function(err) {
                            errorLogger.error('Matching Databse: Fail to get coulmns for table "%s" from main database. %s', tableName, err.stack);
                            callback(err);
                        });
                },
                // getting columns for table from database for match
                function(callback) {
                    sequelizeForMatch.query("SELECT column_name, is_nullable, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = ?", null, {raw: true, logging: false}, tableName)
                        .success(function(columns) {
                            tableDbForMatch = columnsToObject(columns);
                            callback(null);
                        })
                        .error(function(err) {
                            errorLogger.error('Matching Databse: Fail to get coulmns for table "%s" from database for match. %s', tableName, err.stack);
                            callback(err);
                        });
                },
                // comparing results
                function(callback) {
                    // if tables matched
                    if (_.isEqual(tableDb, tableDbForMatch)) {
                        callback(null);
                    }
                    // if tables doesn't match
                    else {
                        var difference = compareColumns(tableDb, tableDbForMatch);
                        errorLogger.error('Matching Databse: Table "%s" doesn\'t match. %s', tableName, difference);
                        callback(new Error());
                    }
                }
            ],
            function(err) {
                callback(err);
            }
        );
    }

    // converting columns from Array to Object
    function columnsToObject(columns) {
        var obj = {};
        _.each(columns,
            function(column) {
                obj[column.column_name] = column;
            }
        );
        return obj;
    }

    // comparing columns, called from compareTables()
    function compareColumns(tableDb, tableDbForMatch) {
        var difference = '',
            keysDb = _.keys(tableDb),
            keysDbForMatchKeys = _.keys(tableDbForMatch),
            commonKeys = _.intersection(keysDb, keysDbForMatchKeys),
            missingColumns = _.difference(keysDbForMatchKeys, keysDb),
            excessColumns = _.difference(keysDb, keysDbForMatchKeys);

        if ( missingColumns.length ) {
            difference += '\n\t Missing columns: ' + missingColumns.toString();
        }
        if ( excessColumns.length ) {
            difference += '\n\t Excess columns: ' + excessColumns.toString();
        }
        _.each(commonKeys,
            function(key) {
                if ( !_.isEqual( tableDb[key], tableDbForMatch[key] ) ) {
                    difference += '\n\t Wrong column options: ' + key;
                }
            }
        );
        return difference;
    }

    async.series(
        [
            dbSync,
            dbForMatchForcedSync,
            compareDbs
        ],
        function(err) {
            if (err) {
                logger.info('Matching Database: Failed.');
            }
            else {
                logger.info('Matching Database: Successed.');
            }
            callback(err);
        }
    );
}

/**
 * Loading routes and controllers
 */
function loadFiles(callback) {

    load('app/routes.js')
        .then('app/controllers/picasa.js')
        .then('app/controllers/static.js')
        .into(app);
    // FIX: loading differs from platform
    if (app.app) {
        if (app.app.routes) app.routes = app.app.routes;
        if (app.app.controllers) app.controllers = app.app.controllers;
    }
    callback(null);
}

/**
 * Configuring application
 */
function configureApp(callback) {

    app.set('models', models);


    app.use(express.compress());                // gzip compression
    app.use(express.static('app/public'));      // handle static files
    //app.use(viewMiddleware());                // my middleware
    app.use(express.cookieParser());            // parses the Cookie header field and populates req.cookies
    app.use(express.bodyParser());              // supporting JSON, urlencoded, and multipart requests
    app.use(i18n.init);                         // init i18n module
    app.use(function (req, res, next) {         // register helper as a locals function
        res.locals.__ = function(arguments) {
            return i18n.__(arguments);
        }
        next();
    });
    app.use(function (req, res, next) {         //
        /*logger.debug("cookies:");
        logger.debug(req.cookies);
        logger.debug("signedCookies:");
        logger.debug(req.signedCookies);*/
        next();
    });
    app.use(app.router);                        // handle routes
    app.use(function(req, res, next){           // handle 404 page
        res.status(404);
        if (req.accepts('html')) {
            res.render('404');
            return;
        }
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }
        res.type('txt').send('Not found');
    });
    app.use(function(err, req, res, next){      // handle errors
        console.log('-----------------');
        console.log(err.stack);
        res.status(err.status || 500);
        if (req.accepts('html')) {
            res.render('500', { error: err });
        }
        else {
            res.send({ error: err });
        }
        //next(err);
    });

    // seting local variables
    app.locals({
        baseUrl: 'asasasasa'
    });

    // handle views
    app.engine('html', ectRenderer.render);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/app/views');

    callback(null);
}

/**
 * Handle routes
 */
function bindPathsToControllers(callback) {
    var allowedVerbs = ['get', 'post', 'all'];
    var temp,controller,method;

    _.map(app.routes, function(route, path) {
        _.map(route, function(funcs, verb) {
            if (!_.contains(allowedVerbs, verb)) {
                return;
            }
            if (!_.isArray(funcs)) {
                funcs = [funcs];
            }
            _.each(funcs, function(func) {
                temp = func.split(".");
                if (_.isEmpty(temp[0]) || _.isEmpty(temp[1])) {
                    return;
                }
                controller = app.controllers[temp[0]];
                if (_.isEmpty(controller)) {
                    return;
                }
                method = controller[temp[1]];
                if ( _.isFunction(method) ) {
                    app[verb](path, method);
                }
            });
        });
    });
    callback(null);
}


/**
 *  Define the sample application.
 */
var MainApp = function() {

    //  Scope.
    var self = this;


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
                process.on(element, function() { self.terminator(element); });
            });
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function(callback) {
        self.setupTerminationHandlers();
        callback(null);
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function(callback) {
        //  Start the app on the specific interface (and port).
        /*self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now() ), self.ipaddress, self.port);
        });*/
        http.createServer(app)
            .listen(process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || appConfig.port, process.env.OPENSHIFT_NODEJS_IP, function() {
                console.log(appConfig.title + " on " + appConfig.port);
                callback(null);
            })
            .on('error', function(err) {
                switch (err.code) {
                    case 'EADDRINUSE':
                        errorLogger.error('Port ' + appConfig.port + ' is in use.');
                        break;
                    default:
                        errorLogger.error('Fail to start the server. ' + err);
                }
                callback(err);
            });
        //https.createServer(options, app).listen(443);
    };

}

var mainApp = new MainApp();
//app.init();
//app.start();

/**
 * Executing Series
 */
async.series([
    configureLogger,
    handleUncaughtExceptions,
    //matchDbWithModels,
    loadFiles,
    configureApp,
    bindPathsToControllers,
    mainApp.initializeServer,
    mainApp.start
]);



/*
 app.get('/', function (req, res, next) {
 imageMagick(__dirname + '/app/public/img/img.jpg')
 .autoOrient()
 .flip()
 .stream('png', function (err, stdout) {
 if (err) return next(err);
 res.setHeader('Content-Type', 'image/jpg');
 stdout.pipe(res);
 });
 });
 */

