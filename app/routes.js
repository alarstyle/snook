module.exports = {
  '/': {all: 'static.home'},
  '/about': {all: 'static.about'},
  '/login': {get: 'login.get', post: 'login.post'},
  '/picasa': {all: 'picasa.index'},
  '/picasa/:user': {all: 'picasa.user'},
  '/picasa/:user/:album': {all: 'picasa.album'},
  '/picasa/:user/:album/*': {all: 'picasa.album'}
}