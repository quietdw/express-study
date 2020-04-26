const express = require('express')
const router = express.Router()
var passport = require('passport')
var GitHubStrategy = require('passport-github').Strategy

passport.serializeUser(function (user, done) {
  done(null, user)
})
passport.deserializeUser(function (obj, done) {
  done(null, obj)
})

router.get('/logout', function (req, res) {
  req.session.destroy()
  res.redirect('/')
})

router.get('/github', passport.authenticate('github'))

passport.use(
  new GitHubStrategy(
    {
      clientID: 'e9b9a5a218b92828acce',
      clientSecret: 'a627872a347b2d39537209041c0bebbdcf83dd0b',
      callbackURL: 'http://localhost:3000/auth/github/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      // User.findOrCreate({ githubId: profile.id }, function (err, user) {
      // });
      done(null, profile)
    }
  )
)

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function (req, res) {
    req.session.user = {
      id: req.user.id,
      username: req.user.displayName || req.user.username,
      avatar: req.user._json.avatar_url,
      provider: req.user.provider,
    }
    res.redirect('/')
  }
)

module.exports = router
