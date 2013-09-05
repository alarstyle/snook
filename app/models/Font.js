module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Font', {
        family:  DataTypes.STRING,
        title:   DataTypes.STRING,
        url:     DataTypes.STRING
    });
};