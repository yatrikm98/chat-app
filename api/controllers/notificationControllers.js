const expressAsyncHandler = require("express-async-handler")
const Notification = require('../models/notificationModel.js')

const sendNotification = expressAsyncHandler(async (req, res) => {
    const { chatId, users } = req.body;
    // console.log(chatId, users ,"Back end")
    if (!chatId || !users || !Array.isArray(users)) {
        res.status(400);
        throw new Error("chatId and users array are required");
    }

    let existingNotification = await Notification.findOne({ chatId });
    // console.log(existingNotification)
    if (!existingNotification) {
        const newNotification = await Notification.create({
            chatId,
            usersOffline: users.map((userId) => ({
                userId: userId,
                count: 1,
            })),
        });
        return res.status(201).json(newNotification);
    }

    users.forEach((userId) => {
        const userEntry = existingNotification.usersOffline.find((u) =>
            u.userId.toString() === userId
        );

        if (userEntry) {
            userEntry.count += 1;
        } else {
            existingNotification.usersOffline.push({
                userId: userId,
                count: 1,
            });
        }
    });

    try {
        const updatedNotification = await existingNotification.save();
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})


const fetchAllNotifications = expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        res.status(400)
        throw new Error(error.message)
    }

    try {
        const allNotifications = await Notification.find({
            "usersOffline.userId": userId
        })

        res.status(200).send(allNotifications)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})



const removeNotification = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    
    const notification = await Notification.findOne({ chatId: chatId })
    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }
    notification.usersOffline = notification.usersOffline.filter((user) => {
        return user.userId.toString() !== userId
    })

    try {
        if (notification.usersOffline.length > 0) {
            await notification.save();
        } else {
            await Notification.deleteOne({ chatId: chatId });
        }
        res.status(200).json({ message: "Notification updated or removed" });
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

module.exports = {
    sendNotification,
    fetchAllNotifications,
    removeNotification
}