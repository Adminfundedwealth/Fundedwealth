module.exports = {
  trace: {
    getSpan: () => undefined,
  },
  context: {
    active: () => undefined,
  },
  propagation: {
    fields: () => [],
    inject: () => {},
    extract: () => undefined,
  },
  diag: {
    logger: undefined,
    setLogger: () => {},
    debug: () => {},
    error: () => {},
    info: () => {},
    warn: () => {},
    verbose: () => {},
  },
  createContextKey: () => undefined,
};
