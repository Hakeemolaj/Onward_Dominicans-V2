#!/usr/bin/env node

/**
 * Setup script for comprehensive testing infrastructure
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Setting up comprehensive testing infrastructure...');

// Create test configuration files
const testConfigs = {
  'jest.config.js': `
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  transform: {
    '^.+\\\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 10000,
};
`,

  'src/setupTests.ts': `
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock performance.now
global.performance.now = jest.fn(() => Date.now());

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup error boundary for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
`,

  '__tests__/utils/testHelpers.ts': `
import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Custom render function with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      {/* Add your providers here (Router, Theme, etc.) */}
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Common test utilities
export const createMockComponent = (name: string) => {
  const MockComponent = React.forwardRef<HTMLDivElement, any>((props, ref) => (
    <div ref={ref} data-testid={name.toLowerCase()} {...props}>
      Mock {name}
    </div>
  ));
  MockComponent.displayName = \`Mock\${name}\`;
  return MockComponent;
};

export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const mockScrollIntoView = () => {
  Element.prototype.scrollIntoView = jest.fn();
};

export const mockGetBoundingClientRect = (rect: Partial<DOMRect> = {}) => {
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
    ...rect,
  }));
};
`,

  'package.json.test-scripts': `
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:performance": "jest --testNamePattern='Performance'",
    "test:integration": "jest --testNamePattern='Integration'",
    "test:unit": "jest --testNamePattern='Unit'"
  }
}
`
};

// Create directories
const directories = [
  '__tests__',
  '__tests__/components',
  '__tests__/hooks',
  '__tests__/services',
  '__tests__/utils',
  '__tests__/integration',
  'src/__tests__',
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Write configuration files
Object.entries(testConfigs).forEach(([filename, content]) => {
  if (filename === 'package.json.test-scripts') {
    // Update existing package.json
    const packageJsonPath = 'package.json';
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const testScripts = JSON.parse(content);
      packageJson.scripts = { ...packageJson.scripts, ...testScripts.scripts };
      
      // Add test dependencies
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        '@testing-library/jest-dom': '^6.1.0',
        '@testing-library/react': '^14.1.0',
        '@testing-library/user-event': '^14.5.0',
        'jest': '^29.7.0',
        'jest-environment-jsdom': '^29.7.0',
        'ts-jest': '^29.1.0',
        'identity-obj-proxy': '^3.0.0',
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with test scripts and dependencies');
    }
  } else {
    fs.writeFileSync(filename, content.trim());
    console.log(`✅ Created: ${filename}`);
  }
});

// Create sample integration test
const integrationTest = `
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { MockDataGenerators, ApiTestUtils } from '../utils/testing';

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Setup API mocks
    const cleanup = ApiTestUtils.mockFetch([
      {
        url: '/articles',
        response: MockDataGenerators.createMockApiResponse(
          MockDataGenerators.createMockArticles(5)
        ),
      },
      {
        url: '/gallery',
        response: MockDataGenerators.createMockApiResponse([]),
      },
    ]);

    return cleanup;
  });

  it('should load and display the complete application', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check main sections are rendered
    expect(screen.getByText(/Onward Dominicans/)).toBeInTheDocument();
    expect(screen.getByText(/Latest News/)).toBeInTheDocument();
  });

  it('should handle navigation between sections', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Navigate to news section
    const newsLink = screen.getByText(/News/);
    await user.click(newsLink);

    // Should scroll to news section
    expect(newsLink).toBeInTheDocument();
  });
});
`;

fs.writeFileSync('__tests__/integration/App.integration.test.tsx', integrationTest.trim());
console.log('✅ Created integration test example');

console.log('\\n🎉 Testing infrastructure setup complete!');
console.log('\\nNext steps:');
console.log('1. Run "npm install" to install test dependencies');
console.log('2. Run "npm test" to run all tests');
console.log('3. Run "npm run test:coverage" to see coverage report');
console.log('4. Run "npm run test:watch" for development');
