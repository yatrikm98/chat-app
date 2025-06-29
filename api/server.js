const express = require('express')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes.js')
const { notFound,errorHandler } = require('./middleware/errorMiddleware.js')
const chatRoutes = require('./routes/chatRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js')
const notificationRoutes = require('./routes/notificationRoutes.js')

dotenv.config()
const app = express()
app.use(express.json())

app.use('/user',userRoutes)
app.use('/chat',chatRoutes)
app.use('/message',messageRoutes)
app.use('/notification',notificationRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app

