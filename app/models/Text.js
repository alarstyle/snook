module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Text', {
        text:    DataTypes.TEXT,
        size:    DataTypes.INTEGER,
        color:   DataTypes.STRING(10),
        x:       DataTypes.INTEGER,
        y:       DataTypes.INTEGER,
        width:   DataTypes.INTEGER,
        height:  DataTypes.INTEGER
    });
};