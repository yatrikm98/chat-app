
jest.mock('../config/generateToken.js', () => jest.fn(() => 'mocked-token'));
jest.mock('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = { _id: '123' };
        next();
    },
}));

jest.mock('../models/chatModel.js');
jest.mock('../models/messageModel.js')
jest.mock('../models/userModel.js')
const request = require('supertest');
const app = require('../server.js')
const chat = require("../models/chatModel.js")
const User = require('../models/userModel.js');
const Message = require("../models/messageModel.js")


beforeEach(() => {
    jest.resetAllMocks();
});




describe("Messages Routes", () => {
    describe('Creating Message ', () => {
        test('One of the data is not sent to back end', async () => {
            const res = await request(app).post('/message').send({ content: "", chatId: "" });
            expect(res.statusCode).toBe(400)
        })


        test("Creating a message with credentials", async () => {
            const createdMessage = {
                sender: {
                    _id: "685046936b171d3f9c5395a3",
                },
                content: "How are you",
                chat: {
                    _id: "685408b87e379f5eacfe2db8",
                    chatName: "sender",
                    isGroupChat: false,
                    users: [
                        {
                            _id: "68530f85d3d986f72cfa7cdf",
                        },
                        {
                            _id: "685046936b171d3f9c5395a3",
                        }
                    ]
                }
            }

            const populate2 = jest.fn().mockResolvedValueOnce(createdMessage);
            const populate1 = jest.fn().mockResolvedValueOnce({ populate: populate2 });

            Message.create.mockResolvedValueOnce({ populate: populate1 });

            User.populate = jest.fn().mockResolvedValueOnce(createdMessage);

            chat.findByIdAndUpdate.mockResolvedValueOnce();
            const res = await request(app).post('/message').send({ content: "Hello", chatId: "123456" });
            expect(res.statusCode).toBe(201)
            expect(res.body).toEqual(createdMessage)
        })

    })


    describe('Fetching Messages', () => {
        test('Fetching Messages Successfull', async () => {
            const allMessagesForAPArticularChat = [
                {
                    _id: "6856a95abfa37c7fb5c01def",
                    sender: {
                        _id: "685046936b171d3f9c5395a3",
                        name: "John Doe",
                        email: "johndoe@gmail.com",
                    },
                    content: "Hello",
                    chat: {
                        _id: "685408b87e379f5eacfe2db8",
                        chatName: "sender",
                        isGroupChat: "false",
                        users: [
                            "68530f85d3d986f72cfa7cdf",
                            "685046936b171d3f9c5395a3"
                        ],
                        latestMessage: "6856a9f8bfa37c7fb5c01dfb"
                    }
                },
                {
                    _id: "6856a9f8bfa37c7fb5c01dfb",
                    sender: {
                        _id: "685046936b171d3f9c5395a3",
                        name: "John Doe",
                        email: "johndoe@gmail.com",
                    },
                    content: "How are you",
                    chat: {
                        _id: "685408b87e379f5eacfe2db8",
                        chatName: "sender",
                        isGroupChat: false,
                        users: [
                            "68530f85d3d986f72cfa7cdf",
                            "685046936b171d3f9c5395a3"
                        ],
                        latestMessage: "6856a9f8bfa37c7fb5c01dfb"
                    },
                }
            ]


            Message.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValueOnce(allMessagesForAPArticularChat)
                })
            });
            const res = await request(app).get('/message/1234');
            expect(res.statusCode).toBe(200);

            expect(res.body).toEqual(allMessagesForAPArticularChat)
        })

        test('Failed to fetch all users', async () => {
            const res = await request(app).get('/message/@');
            expect(res.statusCode).toBe(400)
        })
    })


})