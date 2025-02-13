/* istanbul ignore file */
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const AuthenticationRequestTestHelper = {
  async login({
    username = 'usertest',
    password = 'secret',
    fullname = 'user test',
  } = {}) {
    const server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });

    // login and get access token
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password,
      },
    });

    const {
      data: { accessToken }
    } = JSON.parse(response.payload);

    return accessToken;
  },
};

module.exports = AuthenticationRequestTestHelper;