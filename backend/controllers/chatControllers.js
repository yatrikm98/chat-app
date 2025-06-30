const expressAsyncHandler = require("express-async-handler")
const chat = require("../models/chatModel.js")
const User = require("../models/userModel.js")


const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log("User id param not sent with the request")
        return res.sendStatus(400)
    }

    let isChat = await chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate("users", "-password").populate("latestMessage")

    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email'
    })

    if (isChat.length > 0) {
        res.status(200)
            .send(isChat[0])
    } else {
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        }

        try {
            const createdChat = await chat.create(chatData)
            const fullChat = await chat.findOne({ _id: createdChat._id }).populate("users", "-password")
            res.status(200).send(fullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }

})


const fetchChats = expressAsyncHandler(async (req, res) => {
    // console.log('In fetchChats, req.user:', req.user);

    try {
        await chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'name pic email'
                })

                // console.log(results)
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})



const createGroupChat = expressAsyncHandler(async (req, res) => {

    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the Details" })
    }
    let users = JSON.parse(req.body.users)
    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group Chat")
    }


    users.push(req.user._id)

    try {
        const groupChat = await chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id
        })

        const fullGroupChat = await chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})



const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true
        }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!updatedChat) {
        res.status(404)
        throw new Error("Chat Not Found")
    } else {
        res.json(updatedChat)
    }
})

const addToGroup = expressAsyncHandler(async (req, res) => {

    const { chatId, userId } = req.body

    const added = await chat.findByIdAndUpdate(
        chatId,
        {
            $push: { users: userId }
        },
        {
            new: true
        }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password")


    if (!added) {
        res.status(404)
        throw new Error("Chat Not Found")
    } else {
        res.json(added)
    }

})

const removeFromGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const removed = await chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { users: userId }
        },
        {
            new: true
        }
    ).populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        res.status(404)
        throw new Error("Chat Not Found")
    } else if (userId === removed.groupAdmin._id.toString()) {
        await chat.deleteOne({ _id: chatId })
        // console.log("else If Remove Group")
        res.json([])
    } else {
        res.json(removed)
    }
})

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }