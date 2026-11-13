import '@testing-library/jest-dom/vitest';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (index: number) => Object.keys(store)[index] ?? null,
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock Google GenAI
import { vi } from 'vitest';

vi.mock('@google/genai', () => {
  const GoogleGenAI = vi.fn();
  GoogleGenAI.prototype.getGenerativeModel = vi.fn().mockReturnValue({
    generateContent: vi.fn().mockResolvedValue({
      response: { text: () => 'Mocked response' },
    }),
  });
  GoogleGenAI.prototype.models = {
    generateVideos: vi.fn().mockResolvedValue({
        name: 'mock-operation',
        done: true,
        result: { generatedVideos: [{ video: { uri: 'mock-video-url' } }] }
    })
  };
  GoogleGenAI.prototype.operations = {
    getVideosOperation: vi.fn().mockResolvedValue({
        name: 'mock-operation',
        done: true,
        result: { generatedVideos: [{ video: { uri: 'mock-video-url' } }] }
    })
  };
  
  return { GoogleGenAI };
});

// Mock Google Maps
global.google = {
  maps: {
    Map: vi.fn().mockImplementation(() => ({
        setCenter: vi.fn(),
        setZoom: vi.fn(),
        addListener: vi.fn(),
    })),
    Marker: vi.fn().mockImplementation(() => ({
        setMap: vi.fn(),
        setPosition: vi.fn(),
        addListener: vi.fn(),
    })),
    InfoWindow: vi.fn().mockImplementation(() => ({
        open: vi.fn(),
        close: vi.fn(),
        setContent: vi.fn(),
    })),
    Circle: vi.fn().mockImplementation(() => ({
        setMap: vi.fn(),
    })),
    LatLngBounds: vi.fn(),
    places: {
        Autocomplete: vi.fn(),
    },
    event: {
        clearInstanceListeners: vi.fn(),
        addListener: vi.fn(),
    },
  },
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any

// Enable mock mode for GPS bypass in all tests
window.location.hash = '#/?mock=true';

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
global.URL.revokeObjectURL = vi.fn();

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob(['mock-video-content'], { type: 'video/mp4' })),
  })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;
