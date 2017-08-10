exports.command = function log(message) {
  return this.perform(() => {
    console.log(` # log: ${message}`);
  });
};
