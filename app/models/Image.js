module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Image', {
        title:      DataTypes.STRING,
        url:        DataTypes.STRING,
        thumb:      DataTypes.STRING
    });
};