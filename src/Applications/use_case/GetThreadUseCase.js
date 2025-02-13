
const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');
const CommentDetails = require('../../Domains/comments/entities/CommentDetails');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThread(threadId);
    const { comment_ids: commentIds } = thread
    const comments = await this._commentRepository.getComments(commentIds);

    const commentDetails = comments.length >= 1 
      ? comments.map((row) => new CommentDetails({
        id: row.comment_id,
        username: row.comment_username,
        date: row.comment_date,
        content: row.comment_deleted ? '**komentar telah dihapus**' : row.comment_content
      }))
      : [];

    const threadDetails = new ThreadDetails({
      id: thread.thread_id,
      title: thread.thread_title,
      body: thread.thread_body,
      date: thread.thread_date,
      username: thread.thread_username,
      comments: commentDetails,
    });
    
    return threadDetails;
  }
}

module.exports = GetThreadUseCase;
