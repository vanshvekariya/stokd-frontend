import React from 'react';
import { render } from '@testing-library/react';

/**
 * Custom render function that includes the providers used in the app
 * This is a simplified version that doesn't use actual providers
 * but instead mock components that represent them
 */
export function renderWithProviders(ui, options = {}) {
  return render(ui, options);
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { renderWithProviders as render };
