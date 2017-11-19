const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('./config')
const User = require('./app/models/user')

const app = express()
const api = express.Router()

const port = process.env.PORT || 8080
mongoose.connect(config.database)
app.set('secret', config.secret)

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send('Hi, The API is at http://localhost' + port + '/api')
})

app.get('/setup', (req, res) => {
  const andyyou = new User({
    name: 'andyyou',
    password: '12345678',
    admin: false
  })
  andyyou.save((err) => {
    if (err) throw err
    console.log('User saved successfully')
    res.json({success: true})
  })
})

// 验证机制
api.post('/authenticate', (req, res) => {
  User.findOne({
    name: req.body.name
  }, (err, user) => {
    if (err) throw err

    if (!user) {
      res.json({success: false, message: 'Authenticate failed. User not found.'})
    } else if (user) {
      if (user.password !== req.body.password) {
        res.json({success: false, message: 'Authenticate failed. Wrong password.'})
      } else {
        let token = jwt.sign(user, app.get('secret'), {
          expiresIn: 60 * 60 * 24
        })

        res.json({
          success: true,
          message: 'Enjoy your token',
          token: token
        })
      }
    }
  })
})

api.get('/', (req, res) => {
  res.json({message: 'Welcome to the APIs'})
})

api.get('/users', (req, res) => {
  User.find({}, (err, users) => {
    if (err) throw err
    res.json(users)
  })
})

app.use('/api', api)

app.listen(port, () => {
  console.log('The server is running at http://localhost:' + port)
})
