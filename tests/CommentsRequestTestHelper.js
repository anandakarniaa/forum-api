/* istanbul ignore file */
const container = require('../src/Infrastructures/container');
const createServer = require('../src/Infrastructures/http/createServer');

const CommentsRequestTestHelper = {
  async addComment({
    content = 'a comment',
  } = {}, accessToken, threadId) {
    const server = await createServer(container);
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {
        content,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    const {
      data: {
        addedComment: { id: commentId },
      }
    } = JSON.parse(response.payload);
  
    return commentId;
  }
};

module.exports = CommentsRequestTestHelper;
