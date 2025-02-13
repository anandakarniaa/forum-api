const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread, userId) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, owner',
      values: [id, title, body, userId, date],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async checkThread(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    };
  }

  async getThread(threadId) {
    const query = {
      text:
        `SELECT
          t.id AS thread_id,
          t.title AS thread_title,
          t.body AS thread_body,
          t.date AS thread_date,
          tu.username AS thread_username,
          COALESCE(array_agg(c.id) FILTER (WHERE c.id IS NOT NULL), '{}') AS comment_ids
        FROM
          threads t
        LEFT JOIN
          users tu ON t.owner = tu.id
        LEFT JOIN
          comments c ON t.id = c.thread_id
        WHERE
          t.id = $1
        GROUP BY
          t.id, t.title, t.body, t.date, tu.username`,
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
