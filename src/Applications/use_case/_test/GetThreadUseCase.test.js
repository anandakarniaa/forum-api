const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../../Domains/comments/entities/CommentDetails');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThreadUseCase = require('../GetThreadUseCase');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly when there are comments', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentIds = ['comment-123', 'comment-234'];

    const mockThreadData = {
      thread_id: 'thread-123',
      thread_title: 'a title',
      thread_body: 'lorem ipsum',
      thread_date: '01-10-2020',
      thread_username: 'dicoding',
      comment_ids: ['comment-123', 'comment-234'],
    };

    const mockCommentsData = [
      {
        comment_id: 'comment-123',
        comment_content: 'lorem ipsum',
        comment_username: 'dicoding',
        comment_deleted: false,
        comment_date: '01-10-2020',
      },
      {
        comment_id: 'comment-234',
        comment_content: 'lorem ipsum',
        comment_username: 'dicoding',
        comment_deleted: true,
        comment_date: '02-10-2020',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn().mockImplementation(() => Promise.resolve(mockThreadData));
    mockCommentRepository.getComments = jest.fn().mockImplementation(() => Promise.resolve(mockCommentsData));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetails = await getThreadUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(commentIds);
    expect(threadDetails).toEqual(
      new ThreadDetails({
        id: 'thread-123',
        title: 'a title',
        body: 'lorem ipsum',
        date: '01-10-2020',
        username: 'dicoding',
        comments: [
          new CommentDetails({
            id: 'comment-123',
            username: 'dicoding',
            date: '01-10-2020',
            content: 'lorem ipsum',
          }),
          new CommentDetails({
            id: 'comment-234',
            username: 'dicoding',
            date: '02-10-2020',
            content: '**komentar telah dihapus**',
          }),
        ]
      })
    );
  });

  it('should orchestrating the get thread action correctly when there are no comment', async () => {
    // Arrange
    const threadId = 'thread-123';
    const commentIds = [];

    const mockThreadData = {
      thread_id: 'thread-123',
      thread_title: 'a title',
      thread_body: 'lorem ipsum',
      thread_date: '01-10-2020',
      thread_username: 'dicoding',
      comment_ids: [],
    };

    const mockCommentsData = [];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn().mockImplementation(() => Promise.resolve(mockThreadData));
    mockCommentRepository.getComments = jest.fn().mockImplementation(() => Promise.resolve(mockCommentsData));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const threadDetails = await getThreadUseCase.execute(threadId);

    // Assert
    expect(mockThreadRepository.getThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getComments).toBeCalledWith(commentIds);
    expect(threadDetails).toEqual(
      new ThreadDetails({
        id: 'thread-123',
        title: 'a title',
        body: 'lorem ipsum',
        date: '01-10-2020',
        username: 'dicoding',
        comments: [],
      })
    );
  })
})