// Jest setup file to mock localStorage
// Provide safe no-op mock functions if `jest.fn` is not available
const safeFn = (typeof jest !== "undefined" && typeof jest.fn === "function")
  ? jest.fn
  : () => () => {};

global.localStorage = {
  getItem: safeFn(),
  setItem: safeFn(),
  removeItem: safeFn(),
  clear: safeFn(),
};
