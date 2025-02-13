const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    await UsersTableTestHelper.addUser({ id: userId });
    await ThreadsTableTestHelper.addThread({ id: threadId, userId: userId });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const addComment = new AddComment({
        content: 'lorem ipsum',
      });
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, threadId, userId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const addComment = new AddComment({
        content: 'lorem ipsum',
      });
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment, threadId, userId);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'lorem ipsum',
        owner: 'user-123',
      }));
    });
  });

  describe('checkComment function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkComment('')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when comment found', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, userId: userId, threadId: threadId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkComment(commentId)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('checkOwner function', () => {
    it('should throw AuthorizationError when not the owner of the comment', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, userId: userId, threadId: threadId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkOwner(commentId, '')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when comment found', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, userId: userId, threadId: threadId });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkOwner(commentId, userId)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getComments function', () => {
    it('should return comments data correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: threadId, userId: userId});
      await CommentsTableTestHelper.addComment({ id: 'comment-234', threadId: threadId, userId: userId});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getComments(['comment-123', 'comment-234']);

      // Assert
      expect(comment).toEqual([
        {
          comment_id: 'comment-123',
          comment_date: expect.any(String),
          comment_deleted: false,
          comment_content: 'lorem ipsum',
          comment_username: 'dicoding',
        },
        {
          comment_id: 'comment-234',
          comment_date: expect.any(String),
          comment_deleted: false,
          comment_content: 'lorem ipsum',
          comment_username: 'dicoding',
        }
      ]);
    });

    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getComments([])).rejects.toThrowError(NotFoundError);
    });
  });

  describe('deleteComment function', () => {
    it('should update content from comments', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const content = 'lorem ipsum'
      const deletedComment = true;

      await CommentsTableTestHelper.addComment({ id: commentId, content: content, threadId: threadId , userId: userId});

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(commentId, deletedComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comment[0]).toStrictEqual({
        id: 'comment-123',
        content: 'lorem ipsum',
        owner: 'user-123',
        thread_id: 'thread-123',
        deleted: true,
        date: expect.any(String),
      });
    });
  });
});