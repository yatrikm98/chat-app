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
const Notification = require("../models/notificationModel.js")



beforeEach(() => {
    jest.resetAllMocks();
});


describe('TEsting routes of notification', () => {

    describe("Tsting sending and Updating a notification", () => {
        test('Testing sending notifications', async () => {
            const res = await request(app).post('/api/message').send({});

            expect(res.statusCode).toBe(400)
        })

        test("Creating new Notification", async () => {
            const mockCreatedNotification = {
                _id: 'chat789',
                chatId: "123",
                usersOffline: [
                    {
                        userId: "1",
                        count: 1
                    },
                    {
                        userId: "2",
                        count: 1
                    }
                ]
            };


            Notification.findOne = jest.fn().mockResolvedValue(undefined);
            Notification.create = jest.fn().mockResolvedValue(mockCreatedNotification);
            const res = await request(app).post('/api/notification').send({ chatId: "123", users: ["1", "2"] });

            expect(res.statusCode).toBe(201)
            expect(res.body).toEqual(mockCreatedNotification)
        })

        test('Already Present Notification But updating count', async () => {
            const mockCreatedNotification = {
                _id: 'chat789',
                chatId: "123",
                usersOffline: [
                    {
                        userId: "1",
                        count: 1
                    },
                    {
                        userId: "2",
                        count: 1
                    }
                ],
                save: jest.fn().mockResolvedValue({
                    _id: "123",
                    content: "Updated content",
                })
            };
            Notification.findOne = jest.fn().mockResolvedValue(mockCreatedNotification);

            const res = await request(app).post('/api/notification').send({ chatId: "123", users: ["1", "2"] });
            expect(Notification.findOne).toHaveBeenCalled();
            expect(mockCreatedNotification.save).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);

        })
    })


    describe("testing Fetching all notifications", () => {
        test("When no user id", async () => {

            const mockAllNotifications = [
                {
                    _id: "1",
                    usersOffline: [
                        {
                            userId: "1",
                            count: 2
                        },
                        {
                            userId: "2",
                            count: 2
                        }
                    ]
                },
                {
                    _id: "2",
                    usersOffline: [
                        {
                            userId: "1",
                            count: 3
                        },
                        {
                            userId: "5",
                            count: 2
                        }
                    ]
                }
            ]
            Notification.find = jest.fn().mockResolvedValue(mockAllNotifications);

            const res = await request(app).get('/api/notification/123');
            expect(res.statusCode).toBe(200)
            expect(res.body).toEqual(mockAllNotifications)
        })


        test("Getting error while fetching notifications", async () => {
            Notification.find = jest.fn().mockRejectedValue(new Error("Database error"));

            const res = await request(app).get('/api/notification/123');
            expect(res.statusCode).toBe(400)
        })

    })

    describe("Remove Notification", () => {
        test("When Notification is not present in the database", async () => {

            Notification.findOne = jest.fn().mockResolvedValue(undefined);
            const res = await request(app).put('/api/notification/removeNotification').send({ chatId: "123", userId: "1" });

            expect(res.statusCode).toBe(404)
        })

        test("When found notification", async () => {
            const foundNotification = {
                _id: "1",
                usersOffline: [
                    {
                        userId: "1",
                        count: 2
                    },
                    {
                        userId: "2",
                        count: 2
                    }
                ],
                save: jest.fn().mockResolvedValue({
                    _id: "123",
                    content: "Updated content",
                })
            }

            Notification.findOne = jest.fn().mockResolvedValue(foundNotification);
            const res = await request(app).put('/api/notification/removeNotification').send({ chatId: "123", userId: "1" });
            expect(foundNotification.save).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
        })

        test("Deleting Notification error", async () => {
            const foundNotification = {
                _id: "1",
                usersOffline: [
                    {
                        userId: "1",
                        count: 2
                    },
                    {
                        userId: "2",
                        count: 2
                    }
                ],
                save: jest.fn().mockRejectedValue(new Error("Not able to save"))
            }

            Notification.findOne = jest.fn().mockResolvedValue(foundNotification);
            const res = await request(app).put('/api/notification/removeNotification').send({ chatId: "123", userId: "1" });
            expect(res.statusCode).toBe(400)
        })

    })



})