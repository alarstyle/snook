module.exports = {
  home: function(req, res, next) {
    res.render('index', {header: "heyy man"});
  },
  about: function(req, res, next) {
    res.send('about');
  }
}