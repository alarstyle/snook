var passport = require('passport');

module.exports = {
    get: function(req, res, next) {
        res.render('login', {header: "heyy man"});
    },
    post: function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            console.log(user);
            if (err) { return next(err) }
            if (!user) {
                //req.flash('error', info.message);
                return res.redirect('/login')
            }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/account');
            });
        })(req, res, next);
    },
    success: function(req, res, next) {
        res.render('registration', {header: "heyy man"});
    },
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }
}