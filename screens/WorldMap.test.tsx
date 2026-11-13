import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import WorldMap from './WorldMap';
import { GameProvider } from '../lib/GameContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the Google Maps Loader
const mocks = vi.hoisted(() => ({
    importLibrary: vi.fn(),
    setOptions: vi.fn(),
}));

vi.mock('@googlemaps/js-api-loader', () => ({
    importLibrary: mocks.importLibrary,
    setOptions: mocks.setOptions,
}));

// Mock navigator.geolocation
Object.defineProperty(global.navigator, 'geolocation', {
    value: {
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
    },
    writable: true
});

describe('WorldMap', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        const googleMock = {
            maps: {
                Marker: vi.fn().mockImplementation(function () {
                    return {
                        addListener: vi.fn(),
                        setMap: vi.fn(),
                        setPosition: vi.fn(),
                    };
                }),
                InfoWindow: vi.fn().mockImplementation(function () {
                    return {
                        open: vi.fn(),
                        close: vi.fn(),
                        setContent: vi.fn(),
                        setPosition: vi.fn(),
                    };
                }),
                OverlayView: class {
                    setMap() { }
                    getPanes() { return { overlayMouseTarget: document.createElement('div') }; }
                    getProjection() { return { fromLatLngToDivPixel: () => ({ x: 0, y: 0 }) }; }
                    addListener() { return { remove: vi.fn() }; }
                },
                SymbolPath: { CIRCLE: 'CIRCLE' },
                event: { trigger: vi.fn() },
            }
        };

        vi.stubGlobal('google', googleMock);
        // @ts-expect-error: mocking window object for tests
        window.google = googleMock;

        // Return a mock Map class
        const MockMap = vi.fn().mockImplementation(function (this: unknown) {
            return {
                setCenter: vi.fn(),
                setZoom: vi.fn(),
            };
        });

        mocks.importLibrary.mockResolvedValue({
            Map: MockMap
        });
    });

    it('initializes map using importLibrary', async () => {
        render(
            <MemoryRouter>
                <GameProvider>
                    <WorldMap />
                </GameProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mocks.importLibrary).toHaveBeenCalledWith('maps');
        });
    });
});
