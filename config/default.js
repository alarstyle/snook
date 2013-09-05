module.exports = {
    app: {
        title: "Snook[dev]",
        port: 5000,
        maxRestarts: 1,         // Maximum amount of starting attempts.
        logToConsole: true,
        logToFile: false,
        watchTemplates: true,   // Automatic reloading of changed templates.
        ENABLE_GA: false,        // Is Google Analytics enabled.
        APP_DIR: __dirname + '/..'

    },
    database: {
        dbname: 'snook_dev',
        dbnameForMatch: 'snook_dev_for_match',
        username: 'postgres',
        password: 'password',
        options: {
            host: 'localhost',
            port: 5432,
            dialect: 'postgres',
            sync: {
                logging: false
            }
        }
    }
}