const expressAsyncHandler = require("express-async-handler")
const User = require("../models/userModel.js")
const generateToken = require("../config/generateToken.js")

const registerUser = expressAsyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please Enter All Fields")
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("User already Exists")
    }

    const user = await User.create({ name, email, password, pic })

    if (user) {
        res.status(201)
            .json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            })
    } else {
        res.status(400)
        throw new Error("Failed to create the user")
    }

})

const authUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body
    // console.log(email, password)

    const user = await User.findOne({ email })
    // console.log(user)
    if (user && (await user.matchPassword(password))) {
        res.status(200)
            .json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            })
    } else {
        res.status(401)
            .json("Invalid Credentials")
    }
})

const getAllUsers = expressAsyncHandler(async (req, res) => {


    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })

    res.status(200)
        .send(users)
})

module.exports = { registerUser, authUser, getAllUsers }