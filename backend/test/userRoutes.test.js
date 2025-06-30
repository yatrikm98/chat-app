jest.mock('../config/generateToken.js', () => jest.fn(() => 'mocked-token'));
jest.mock('../middleware/authMiddleware.js', () => ({
    protect: (req, res, next) => {
        req.user = { _id: '123' };
        next();
    },
}));

jest.mock('../models/userModel.js');

const request = require('supertest');
const app = require('../server.js')
const User = require('../models/userModel.js');

 afterEach(() => {
        jest.clearAllMocks();
    });

describe('Checking login route', () => {
   
    test('Whether the credentials match in the databse or not ', async () => {
        const mockUser = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            pic: 'pic.jpg',
            matchPassword: jest.fn().mockResolvedValue(true),
        };

        User.findOne.mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            pic: 'pic.jpg',
            token: 'mocked-token',
        });
    })

})



describe('Checking registration', () => {
    
    test('Not Providing all credentials ', async () => {

        const res = await request(app)
            .post('/api/user/')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(400)


    })



    test('Providing credentials but user exists', async () => {

        User.findOne.mockResolvedValue({ email: 'test@example.com' });

        const res = await request(app)
            .post('/api/user/')
            .send({
                name: "Test",
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("User already Exists");
    })


    test('Providing all credentials but user does not exist , therefore creating', async () => {

        User.findOne = jest.fn().mockResolvedValue(null);

        const mockUser = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            pic: 'pic.jpg',
            token: 'mocked-token',
        };

        User.create.mockResolvedValue(mockUser);

        const res = await request(app)
            .post('/api/user/')
            .send({
                name: "Test",
                email: 'test@example.com',
                password: 'password123',
            });


        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            pic: 'pic.jpg',
            token: 'mocked-token',
        });
    })

})



describe('Getting all users ', () => {
    test('Getting all users except the user who has called the api', async () => {
        const mockUsers = [{
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            pic: 'pic.jpg',
        },
        {
            _id: '124',
            name: 'Test User1',
            email: 'tes1t@example.com',
            pic: 'pic.jpg',
        },
        {
            _id: '125',
            name: 'Test User2',
            email: 'test2@example.com',
            pic: 'pic.jpg',
        }
        ];

        const filteredUsers = mockUsers.filter(u => u._id !== '123')

        User.find = jest.fn().mockImplementation((query) => {
            return {
                find: jest.fn().mockResolvedValue(filteredUsers),
            };
        });

        const response = await request(app).get('/api/user?search=a')



        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual(filteredUsers)
    })
})









