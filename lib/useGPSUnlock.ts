import { useState, useEffect, useRef } from 'react';
import { Coordinates } from './types';
import { getDistanceInMeters, isMockMode, getMockPosition } from './gps';

interface GPSUnlockState {
  isWithinRadius: boolean;
  distance: number | null; // meters
  currentPosition: Coordinates | null;
  error: string | null;
  watching: boolean;
}

export function useGPSUnlock(
  target: Coordinates,
  radiusMeters: number
): GPSUnlockState {
  const [state, setState] = useState<GPSUnlockState>({
    isWithinRadius: false,
    distance: null,
    currentPosition: null,
    error: null,
    watching: false,
  });

  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Mock mode: immediately use mock position or treat as within radius
    if (isMockMode()) {
      const mockPos = getMockPosition();
      if (mockPos) {
        const dist = getDistanceInMeters(mockPos.lat, mockPos.lng, target.lat, target.lng);
        setState({
          isWithinRadius: dist <= radiusMeters,
          distance: Math.round(dist),
          currentPosition: mockPos,
          error: null,
          watching: true,
        });
      } else {
        // No specific mock position -> auto-unlock
        setTimeout(() => {
          setState({
            isWithinRadius: true,
            distance: 0,
            currentPosition: target,
            error: null,
            watching: true,
          });
        }, 0);
      }
      return;
    }

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
        watching: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, watching: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const current: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const dist = getDistanceInMeters(current.lat, current.lng, target.lat, target.lng);
        setState({
          isWithinRadius: dist <= radiusMeters,
          distance: Math.round(dist),
          currentPosition: current,
          error: null,
          watching: true,
        });
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          error: err.message,
          watching: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.lat, target.lng, radiusMeters]);

  return state;
}
