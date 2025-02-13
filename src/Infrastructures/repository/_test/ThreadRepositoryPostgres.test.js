/* eslint-disable camelcase */
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    const userId = 'user-123';
    await UsersTableTestHelper.addUser({ id: userId });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const addThread = new AddThread({
        title: 'a title',
        body: 'lorem ipsum',
      });
      const fakeIdGenerator = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread, userId);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const addThread = new AddThread({
        title: 'a title',
        body: 'lorem ipsum',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, userId);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'a title',
        body: 'lorem ipsum',
        owner: 'user-123',
      }));
    });
  });

  describe('checkThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThread('')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when thread found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const userId = 'user-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, userId: userId });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.checkThread(threadId)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThread function', () => {
    it('should return thread details correctly', async () => {
      // Arrange
      const commentId = 'comment-123'
      const threadId = 'thread-123';
      const userId = 'user-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, userId: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, userId: userId});

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThread('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        thread_id: 'thread-123',
        thread_title: 'a title',
        thread_body: 'lorem ipsum',
        thread_date: expect.any(String),
        thread_username: 'dicoding',
        comment_ids: ['comment-123'],
      });
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThread('')).rejects.toThrowError(NotFoundError);
    });
  });
});

