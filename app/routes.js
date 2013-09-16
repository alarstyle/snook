module.exports = {
  '/': {all: 'static.home'},
  '/about': {all: 'static.about'},
  '/login': {get: 'login.get', post: 'login.post'},
  '/picasa': {all: 'picasa.index'},
  '/picasa/:username': {all: 'picasa.user'},
  '/picasa/:username/:album': {all: 'picasa.album'},
  '/picasa/:username/:album/*': {all: 'picasa.album'}
}