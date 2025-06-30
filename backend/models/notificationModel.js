const mongoose = require('mongoose')

const notificationModel = mongoose.Schema({

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
        unique:true
    },
    usersOffline: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            count: {
                type: Number,
                default: 1,
            },
        },
    ]
},
    { timestamps: true }
)

notificationModel.index({ "usersOffline.userId": 1 });

const Notification = mongoose.model("Notification", notificationModel)

module.exports = Notification;