var User = {
    db: {
        table: 'users',
        columns: {
            id: 'INT',
            login: '',
            password: '',
            name: 'STRING',
            email: 'STRING',
            account_type: ''
        }
    }

};
var a = 1;
a++;
module.exports = User;