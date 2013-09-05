module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        email:      { type: DataTypes.STRING, unique: true},
        password:   DataTypes.STRING,
        name:       DataTypes.STRING
    }, {
        instanceMethods: {
            countTasks: function() {
                // how to implement this method ?
            }
        }
    });
};