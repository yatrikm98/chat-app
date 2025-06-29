const expressAsyncHandler = require("express-async-handler")
const Message = require('../models/messageModel.js')
const User = require("../models/userModel.js")
const chat = require("../models/chatModel.js")

const sendMessage = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body

    if (!content || !chatId) {
        console.log("Invalid data passes to the request")
        return res.status(400).json({ message: "Invalid data" })
    }

    let newMessage = {
        sender: req.user._id,
        content,
        chat: chatId
    }
    try {
        let message = await Message.create(newMessage)
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        })
        await chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        })
        res.status(201).json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }


})

const allMessagesForAParticularChat = expressAsyncHandler(async (req, res) => {
    // console.log(req.user._id)
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat")
        // console.log(messages)
        res.status(200).json(messages)
    } catch (error) {
        res.status(400)
        // console.log(error.message)
        throw new Error(error.message)
    }
})

module.exports = { sendMessage, allMessagesForAParticularChat }