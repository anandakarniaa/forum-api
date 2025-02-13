const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, userId) {
    const addComment = new AddComment(useCasePayload);

    await this._threadRepository.checkThread(threadId);
    return this._commentRepository.addComment(addComment, threadId, userId);
  }
}

module.exports = AddCommentUseCase;
