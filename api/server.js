const express = require('express')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes.js')
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js')
const chatRoutes = require('./routes/chatRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js')
const notificationRoutes = require('./routes/notificationRoutes.js')
const path = require('path')


dotenv.config()
const app = express()
app.use(express.json())

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/notification', notificationRoutes)

app.use(
    express.static(
        path.join(__dirname, '../frontend/dist')
    )
)

app.get(/^.*$/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
})



app.use(notFound)
app.use(errorHandler)

module.exports = app

