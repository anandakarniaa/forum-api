class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(userId, threadId, commentId) {
    await this._threadRepository.checkThread(threadId);
    await this._commentRepository.checkComment(commentId);
    await this._commentRepository.checkOwner(commentId, userId);

    const deletedComment = true
    await this._commentRepository.deleteComment(commentId, deletedComment);
  }
}

module.exports = DeleteCommentUseCase;
