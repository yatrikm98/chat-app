
jest.mock('../config/generateToken.js', () => jest.fn(() => 'mocked-token'));
jest.mock('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = { _id: '123' };
        next();
    },
}));

jest.mock('../models/chatModel.js');
const request = require('supertest');
const app = require('../server.js')
const chat = require("../models/chatModel.js")
const User = require('../models/userModel.js');



beforeEach(() => {
    jest.resetAllMocks();
});

describe('Checking routes for chats', () => {

    describe('Using fetchchats controller ', () => {
        test('Geting all chats for a particular user ', async () => {
            const mockChats = [
                {
                    _id: 'chat1',
                    users: [
                        { _id: '123', name: 'Current User' },
                        { _id: '456', name: 'Friend One' },
                    ],
                    groupAdmin: null,
                    latestMessage: {
                        sender: {
                            _id: '456',
                            name: 'Friend One',
                            pic: 'pic1.jpg',
                            email: 'friend1@example.com',
                        },
                    },
                },
                {
                    _id: 'chat2',
                    users: [
                        { _id: '123', name: 'Current User' },
                        { _id: '789', name: 'Friend Two' },
                    ],
                    groupAdmin: null,
                    latestMessage: {
                        sender: {
                            _id: '789',
                            name: 'Friend Two',
                            pic: 'pic2.jpg',
                            email: 'friend2@example.com',
                        },
                    },
                },
                {
                    _id: 'chat3',
                    users: [
                        { _id: '123', name: 'Current User' },
                        { _id: '456', name: 'Friend One' },
                        { _id: '789', name: 'Friend Two' },
                    ],
                    groupAdmin: { _id: '123', name: 'Current User' },
                    latestMessage: {
                        sender: {
                            _id: '123',
                            name: 'Current User',
                            pic: 'mypic.jpg',
                            email: 'me@example.com',
                        },
                    },
                },
            ];


            chat.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockChats),
            });

            User.populate = jest.fn().mockResolvedValue(mockChats);


            const res = await request(app).get('/chat');
            expect(res.statusCode).toBe(200)
            expect(res.body).toEqual(mockChats)
            expect(chat.find).toHaveBeenCalledWith({
                users: { $elemMatch: { $eq: '123' } } // 123 is req.user._id from mocked middleware
            });

            expect(User.populate).toHaveBeenCalledWith(mockChats, {
                path: 'latestMessage.sender',
                select: 'name pic email',
            });
        })

    })



    describe('access chat controller ', () => {
        test('should return 400 if userId is not sent', async () => {
            const res = await request(app)
                .post('/chat')
                .send({}); // Missing userId

            expect(res.statusCode).toBe(400);
        });

        test('Sending a created chat for a particular User 1 on 1 ', async () => {
            const mockChat = {
                _id: 'chat123',
                isGroupChat: false,
                users: ['123', '456'],
                latestMessage: {
                    sender: {
                        name: 'Test User',
                        pic: 'pic.jpg',
                        email: 'test@example.com'
                    }
                }
            };


            chat.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue([mockChat])
                }),
            });


            User.populate = jest.fn().mockResolvedValue([mockChat]);


            const res = await request(app)
                .post('/chat')
                .send({ userId: '456' });


            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockChat);
            expect(chat.find).toHaveBeenCalledWith({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: '123' } } },
                    { users: { $elemMatch: { $eq: '456' } } },
                ],
            });
            expect(User.populate).toHaveBeenCalledWith([mockChat], {
                path: 'latestMessage.sender',
                select: 'name pic email',
            });
        })

        test('Did not find chat so creating a chat', async () => {
            const mockCreatedChat = { _id: 'chat789' };
            const mockFullChat = {
                _id: 'chat789',
                isGroupChat: false,
                chatName: 'sender',
                users: [
                    { _id: '123', name: 'Current User' },
                    { _id: '456', name: 'Friend' },
                ],
            };
            chat.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValueOnce(Promise.resolve([]))
                })
            });

            User.populate = jest.fn().mockResolvedValue([]);

            chat.create.mockResolvedValue(mockCreatedChat);


            chat.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockFullChat)
            });

            const res = await request(app)
                .post('/chat')
                .send({ userId: '456' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockFullChat);
        })
    })


    describe('create group chat', () => {
        test('Not sending users and chatname', async () => {
            const res = await request(app).post('/chat/group').send({})
            expect(res.statusCode).toBe(400)
        })

        test('Sending users and chat name', async () => {

            const mockCreatedChat = {
                _id: 'group123',
            };
            const populatedGroupChat = {
                _id: 'group123',
                chatName: 'My Group',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                    { _id: '123', name: 'Logged In User' },
                ],
                groupAdmin: { _id: '123', name: 'Logged In User' },
            };


            chat.create.mockResolvedValue(mockCreatedChat);

            const populate2 = jest.fn().mockResolvedValue(populatedGroupChat);
            const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
            chat.findOne.mockReturnValue({ populate: populate1 });


            const res = await request(app).post('/chat/group').send({
                name: 'My Group',
                users: JSON.stringify(['user1', 'user2'])
            })

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                _id: 'group123',
                chatName: 'My Group',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                    { _id: '123', name: 'Logged In User' },
                ],
                groupAdmin: { _id: '123', name: 'Logged In User' },
            })

        })
    })



    describe('Rename Group Chat', () => {
        test('Renaming by giving chat Id and Name', async () => {

            const mockUpdatedChat = {
                _id: '123456',
                chatName: 'My Group1',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                ],
                groupAdmin: { _id: '123', name: 'Admin User' }
            };

            chat.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockUpdatedChat)
                })
            });


            const res = await request(app).put('/chat/rename').send({
                chatId: "123456",
                chatName: 'My Group1'

            })

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                _id: '123456',
                chatName: 'My Group1',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                ],
                groupAdmin: { _id: '123', name: 'Admin User' }
            });

        })
    })


    describe('add to group', () => {
        test('Adding a user to a group', async () => {

            const mockUpdatedChat = {
                _id: '123456',
                chatName: 'My Group1',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                    { _id: '1234', name: 'User Two' },
                ],
                groupAdmin: { _id: '123', name: 'Admin User' }
            };

            chat.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockUpdatedChat)
                })
            });

            const res = await request(app).put('/chat/groupadd').send({
                chatId: "123456",
                userId: "1234"
            })

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                _id: '123456',
                chatName: 'My Group1',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                    { _id: '1234', name: 'User Two' },
                ],
                groupAdmin: { _id: '123', name: 'Admin User' }
            });
        })
    })


    describe('Removing from  group', () => {
        test('Removing a user to a group', async () => {

            const mockUpdatedChat = {
                _id: '123456',
                chatName: 'My Group1',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' },
                ],
                groupAdmin: { _id: '123', name: 'Admin User' }
            };

            chat.findByIdAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockUpdatedChat)
                })
            });

            const res = await request(app).put('/chat/groupremove').send({
                chatId: "123456",
                userId: "1234"
            })

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                _id: '123456',
                chatName: 'My Group1',
                isGroupChat: true,
                users: [
                    { _id: 'user1', name: 'User One' },
                    { _id: 'user2', name: 'User Two' }
                ],
                groupAdmin: { _id: '123', name: 'Admin User' }
            });
        })
    })

})



