module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Theme', {
        title:      DataTypes.STRING,
        bgcolor:    DataTypes.STRING(10)
    });
};