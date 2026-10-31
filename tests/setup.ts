// Registers toBeInTheDocument, toHaveAccessibleName, toBeDisabled and friends on Vitest's expect.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// RTL auto-cleans when globals are on; calling it explicitly keeps the intent obvious.
afterEach(() => {
  cleanup();
});
