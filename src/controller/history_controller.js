module.exports = class HistoryController {
  constructor(history) {
    this.history = history;
  }

  async getAll(ctx) {
    ctx.body = this.history.serialize();
    ctx.status = 200;
  }
};
