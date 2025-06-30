
const User = require("../models/userModel.js") ;
const Message = require("../models/messageModel.js") ;
const chat = require("../models/chatModel.js") ;
const mongoose = require("mongoose") ;

mongoose.Schema.Types.String.cast(false);

describe('Testing whether models are properly Validating or not ', () => {
    test('adding new Message and checking how message schema is responding', async () => {
        const msg = new Message({
            sender: new mongoose.Types.ObjectId(),
            content: 'true', // invalid
            chat: new mongoose.Types.ObjectId()
        });

        const error = msg.validateSync();
        expect(error).toBeUndefined();

    })

    test('Adding new user andchecking if schema is responding or not ', () => {
        const user = new User({
            name: 'Yatrik',
            email: 'PAssword',
            password: '1234',
        })

        const error = user.validateSync();
        expect(error).toBeUndefined();
    })

    test('Adding new Chat and checking whether it is passing the scgema or not ', () => {
        const userId1 = new mongoose.Types.ObjectId();
        const userId2 = new mongoose.Types.ObjectId();
        const chat1 = new chat({
            chatName: 'Yatrik',
            isGroupChat: true,
            users: [userId1, userId2],
            latestMessage:new mongoose.Types.ObjectId(),
            groupAdmin: new mongoose.Types.ObjectId()
        })

        const error = chat1.validateSync();
        expect(error).toBeUndefined();
    })
})
