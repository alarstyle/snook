module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Album', {
        //id:             { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
        title:          DataTypes.STRING,
        description:    DataTypes.TEXT,
        bgcolor:        DataTypes.STRING(10),
        published:      { type: DataTypes.BOOLEAN, defaultValue: true },
        temp:           DataTypes.BOOLEAN
    });
};