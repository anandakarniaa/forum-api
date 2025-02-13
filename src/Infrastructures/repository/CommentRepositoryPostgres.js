const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, threadId, userId) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const deletedComment = false

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, userId, threadId, deletedComment, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async checkComment(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('komentar tidak ditemukan');
    };
  }

  async checkOwner(commentId, userId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    };
  }

  async getComments(commentIds) {
    const query = {
      text: `
        SELECT
          c.id AS comment_id,
          c.content AS comment_content,
          cu.username AS comment_username,
          c.deleted AS comment_deleted,
          c.date AS comment_date
        FROM
          comments c
        LEFT JOIN
          users cu ON c.owner = cu.id
        WHERE
          c.id = ANY($1)
        ORDER BY
          c.date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    return result.rows;
  }

  async deleteComment(commentId, deletedComment) {
    const query = {
      text: `UPDATE comments SET deleted = $1 WHERE id = $2 RETURNING *`,
      values: [deletedComment, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
