import "@testing-library/jest-dom";

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),            // legacy
    removeListener: jest.fn(),         // legacy
    addEventListener: jest.fn(),       // modern
    removeEventListener: jest.fn(),    // modern
    dispatchEvent: jest.fn(),
  }),
});