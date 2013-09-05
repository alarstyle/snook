var Sequelize = require('sequelize'),
    config    = require('config').database;

// initialize database connection
var sequelize = new Sequelize(
    config.dbname,
    config.username,
    config.password,
    config.options
);
var sequelizeForMatch = new Sequelize(
    config.dbnameForMatch,
    config.username,
    config.password,
    config.options
);

// load models
var modelsNames = [
    'User',
    'Album',
    'Page',
    'Image',
    'Text',
    'Theme',
    'Font'
];
var modelsForMatch = {};
modelsNames.forEach(function(modelName) {
    module.exports[modelName] = sequelize.import(__dirname + '/' + modelName);
    modelsForMatch[modelName] = sequelizeForMatch.import(__dirname + '/' + modelName);
});

// describe relationships
function setRelations(m) {
    m.User.hasMany(m.Album);
    m.Album.belongsTo(m.User);
    m.Album.hasMany(m.Page);
}
setRelations(module.exports);
setRelations(modelsForMatch);

// export connection
module.exports.sequelize = sequelize;
module.exports.sequelizeForMatch = sequelizeForMatch;
module.exports.modelsNames = modelsNames;
