var log4js = require('log4js'),
    forever = require('forever-monitor'),
    appConfig = require('config').app;

//, imageMagick = require('gm').subClass({ imageMagick: true })

/**
 * Configer logger
 */
(function(){
    var appenders = [];
    if (appConfig.logToConsole) {
        appenders.push({ type: 'console' });
    }
    if (appConfig.logToFile) {
        appenders.push({ type: 'file', filename: 'logs/all.log', maxLogSize: 1048576, backups: 5 });
        appenders.push({ type: 'file', filename: 'logs/errors.log', maxLogSize: 1048576, backups: 5, category: "errors" });
    }
    log4js.configure({ appenders: appenders, replaceConsole: true });
})();

var logger = log4js.getLogger();

/**
 * Starting server process
 */
var server = new (forever.Monitor)('server.js', {
    max: appConfig.maxRestarts,
    silent: false
});
server.on('restart', function () {
    logger.fatal(appConfig.title + ' has crashed!')
});
server.on('exit', function () {
    logger.fatal(appConfig.title + ' has exited after ' + appConfig.maxRestarts + ' restarts!')
});
server.start();
