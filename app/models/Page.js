module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Page', {
        image:      DataTypes.STRING,
        title:      DataTypes.STRING,
        bgcolor:        DataTypes.STRING(10)
    });
};