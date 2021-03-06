var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var passport = require('passport')
var session = require('express-session')

var indexRouter = require('./routes/index')
var authRouter = require('./routes/auth')
var catalogRouter = require('./routes/catalog')
var compression = require('compression')
var helmet = require('helmet')

var app = express()
app.use(compression())
app.use(helmet())

// 设置 Mongoose 连接
const mongoose = require('mongoose')
var mongoDB =
  process.env.MONGODB_URI ||
  'mongodb+srv://quietdw:asdfghjkl@express-study-xafey.azure.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.Promise = global.Promise
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB 连接错误：'))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({ secret: 'sessionsecret' }))
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/catalog', catalogRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
