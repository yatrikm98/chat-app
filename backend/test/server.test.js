const request = require("supertest") ;
const app =require('../server.js')


describe('Testing different routes from Server.js files', () => {
    test('GET / should return  welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.text).toBe("App is running perfectly");
    });

})