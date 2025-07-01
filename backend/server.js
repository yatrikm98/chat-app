const express = require('express')
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes.js')
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js')
const chatRoutes = require('./routes/chatRoutes.js')
const messageRoutes = require('./routes/messageRoutes.js')
const notificationRoutes = require('./routes/notificationRoutes.js')
const cors = require("cors");

dotenv.config()
const app = express()
app.use(express.json())


app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://chat-app-psi-eight-96.vercel.app"
    ],
    credentials: true, 
}));


app.get('/',(req,res)=>{
    res.send("App is running perfectly")
})

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/notification', notificationRoutes)




app.use(notFound)
app.use(errorHandler)

module.exports = app

