/* istanbul ignore file */
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const ThreadsRequestTestHelper = {
  async addThread({
    title = 'a title',
    body = 'lorem ipsum',
  } = {}, accessToken) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title,
        body,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    const {
      data: {
        addedThread: { id: threadId },
      }
    } = JSON.parse(response.payload);
  
    return threadId;
  }
};

module.exports = ThreadsRequestTestHelper;