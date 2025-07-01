const { Server } = require('socket.io');
const app = require('./server.js');
const mongoose = require('mongoose')
const { createServer } = require('node:http');

const server = createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [
            'http://localhost:5173',
            'https://chat-app-sand-two.vercel.app'
        ],
    },
});

const connectMongooseAndThenStartServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to Mongodb')
        const PORT = process.env.PORT || 5000
        server.listen(PORT, () => {
            console.log(`Port running on ${PORT}`)
        });
    } catch (error) {
        console.log(error)
    }
}




connectMongooseAndThenStartServer()

const usersInRoom = {}
console.log(usersInRoom, "Users In room after just INitializing it")

io.on('connection', (socket) => {
    console.log('connected to socket.io');
    socket.on('setup', (userData) => {
        socket.userId = userData._id;
        socket.join(userData._id);
        socket.emit("connected")
    })

    socket.on("join chat", (roomId, userId) => {
        socket.join(roomId)
        if (roomId in usersInRoom) {
            if (!usersInRoom[roomId].includes(userId)) {
                usersInRoom[roomId].push(userId);
            }
        } else {
            usersInRoom[roomId] = [userId]
        }
        console.log('User Joined room :' + roomId, userId)
        console.log(usersInRoom, "After Joining")
    })

    socket.on("typing", (room) => {
        socket.broadcast.to(room).emit("typing")
    })

    socket.on("stop typing", (room) => {
        socket.broadcast.to(room).emit("stop typing")
    })

    socket.on("new message", (newMessageReceived) => {
        let chat = newMessageReceived.chat
        if (!chat.users) {
            return console.log("chat.users not defined")
        }

        const usersOnline = usersInRoom[newMessageReceived.chat._id] || []
        const usersOffline = chat.users
            .map(user => user._id)
            .filter(userId => !usersOnline.includes(userId));

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) {
                // console.log("Inside if of new message received server side")
                console.log(usersOffline, "Users OFlline in backend")
                socket.emit("message received", {
                    newMessageReceived,
                    usersOffline: usersOffline || [],
                })
                return;
            } else {
                console.log("inside else statement")
                socket.to(user._id).emit("message received", {
                    newMessageReceived,
                    usersOffline: []
                })
            }

        })
    })

    socket.on("leaving room", (roomId, userId) => {
        if (roomId in usersInRoom) {
            let updatedUsers = usersInRoom[roomId].filter((id) => {
                return id !== userId
            })
            if (updatedUsers.length === 0) {
                delete usersInRoom[roomId]
            } else {
                usersInRoom[roomId] = updatedUsers
            }

        }
        console.log(`usersInRoom ${usersInRoom}`, "AFter leaving")
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
        for (const roomId in usersInRoom) {
            usersInRoom[roomId] = usersInRoom[roomId].filter(id => id !== socket.userId);
            if (usersInRoom[roomId].length === 0) {
                delete usersInRoom[roomId];
            }
        }
        console.log(usersInRoom, "After disconnected")
    });
});