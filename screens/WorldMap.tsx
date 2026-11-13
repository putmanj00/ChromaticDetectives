/// <reference types="@types/google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../lib/GameContext';
import { STAGES } from '../lib/stages';
import { getDistanceInMeters } from '../lib/gps';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

// Configure the loader once
setOptions({
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    v: "weekly",
});

const WorldMap: React.FC = () => {
    const navigate = useNavigate();
    const { getStageStatus, devMode } = useGame();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    // Use any because Array<Marker | OverlayView> is tricky with specific methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersRef = useRef<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMarkerRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const htmlMarkerClassRef = useRef<any>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current) return;

        const initMap = async () => {
            const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;

            // Default to Cincinnati
            const center = { lat: 39.1031, lng: -84.5120 };

            const mapInstance = new Map(mapRef.current!, {
                center,
                zoom: 13,
                disableDefaultUI: true,
                clickableIcons: false,
                styles: [
                    {
                        featureType: "poi",
                        stylers: [{ visibility: "off" }],
                    },
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#d59563" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{ color: "#38414e" }],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{ color: "#212a37" }],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{ color: "#17263c" }],
                    },
                ],
            });

            // Define Custom Overlay Class
            // Define Custom Overlay Class
            const createHTMLMapMarker = (OverlayView: typeof google.maps.OverlayView) => {
                return class HTMLMapMarker extends OverlayView {
                    position: google.maps.LatLngLiteral;
                    html: string;
                    div: HTMLDivElement | null = null;

                    constructor(position: google.maps.LatLngLiteral, html: string) {
                        super();
                        this.position = position;
                        this.html = html;
                    }

                    onAdd() {
                        this.div = document.createElement('div');
                        this.div.style.position = 'absolute';
                        this.div.style.cursor = 'pointer';
                        this.div.innerHTML = this.html;
                        const panes = this.getPanes();
                        panes?.overlayMouseTarget.appendChild(this.div);
                        this.div.addEventListener('click', (e) => {
                            google.maps.event.trigger(this, 'click', e);
                            e.stopPropagation();
                        });
                    }

                    draw() {
                        if (!this.div) return;
                        const overlayProjection = this.getProjection();
                        const point = overlayProjection.fromLatLngToDivPixel(this.position);
                        if (point) {
                            this.div.style.left = point.x + 'px';
                            this.div.style.top = point.y + 'px';
                        }
                    }

                    onRemove() {
                        if (this.div) {
                            this.div.parentNode?.removeChild(this.div);
                            this.div = null;
                        }
                    }
                };
            };

            htmlMarkerClassRef.current = createHTMLMapMarker(google.maps.OverlayView);
            setMap(mapInstance);
        };

        initMap().catch(console.error);
    }, []);

    // Track User Location
    useEffect(() => {
        if (!map) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(pos);
            },
            (error) => {
                console.error("Error watching position:", error);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [map]);

    // Update Markers
    useEffect(() => {
        if (!map || !htmlMarkerClassRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        STAGES.forEach((stage) => {
            const status = getStageStatus(stage.id);
            if (status === 'locked') return;

            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const color = isCompleted ? '#ae3efe' : isActive ? '#f53fe8' : '#ccff00';

            let distanceText = '';
            let distanceInMeters = Infinity;
            if (userLocation) {
                distanceInMeters = getDistanceInMeters(userLocation.lat, userLocation.lng, stage.coordinates.lat, stage.coordinates.lng);
                distanceText = `${Math.round(distanceInMeters)}m`;
            }

            const isProximityLocked = isActive && distanceInMeters > 100 && !devMode;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let marker: any;

            if (isActive) {
                // Use Custom HTML Marker for Active Stage
                const htmlContent = `
                    <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
                        <div class="absolute w-32 h-32 rounded-full border border-[#f53fe8]/30 animate-ping opacity-20"></div>
                        <div class="absolute w-16 h-16 rounded-full bg-[#f53fe8]/20 backdrop-blur-sm border border-[#f53fe8]/50"></div>
                        <div class="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] z-10 relative flex items-center justify-center">
                            <span style="font-size: 8px; font-weight: bold; color: black;">${stage.id}</span>
                        </div>
                    </div>
                `;
                marker = new htmlMarkerClassRef.current(stage.coordinates, htmlContent);
                marker.setMap(map);
            } else {
                // Standard Marker for others
                marker = new google.maps.Marker({
                    position: stage.coordinates,
                    map: map,
                    title: stage.title,
                    label: {
                        text: `${stage.id}`,
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: color,
                        fillOpacity: 0.9,
                        strokeColor: 'white',
                        strokeWeight: 2,
                    },
                });
            }

            const buttonText = isCompleted ? 'Review' :
                isActive ? (isProximityLocked ? `Locked (${distanceText})` : 'Go to Stage') :
                    'Locked';

            const buttonStyle = isProximityLocked
                ? "margin-top: 5px; padding: 5px 10px; background: #555; color: #aaa; border: none; border-radius: 4px; cursor: not-allowed;"
                : `margin-top: 5px; padding: 5px 10px; background: ${color}; color: white; border: none; border-radius: 4px; cursor: pointer;`;

            const infoWindow = new google.maps.InfoWindow({
                content: `
          <div style="color: black; padding: 5px;">
            <h3 style="margin: 0; font-weight: bold;">${stage.title}</h3>
            <p style="margin: 5px 0;">${stage.subtitle}</p>
            ${distanceText ? `<p style="margin: 0; font-size: 12px; color: #666;">Distance: ${distanceText}</p>` : ''}
            <button id="nav-btn-${stage.id}" ${isProximityLocked ? 'disabled' : ''} style="${buttonStyle}">
              ${buttonText}
            </button>
            ${isProximityLocked ? '<p style="margin: 5px 0 0 0; font-size: 10px; color: red; font-weight: bold;">Get within 100m to unlock</p>' : ''}
          </div>
        `,
            });

            marker.addListener('click', () => {
                // Open infoWindow logic
                // Note: OverlayView trigger('click') passes event, but we just need to open window
                // For custom marker, position needs to be passed explicitly if marker is not a standard Marker
                if (isActive) {
                    infoWindow.setPosition(stage.coordinates);
                    infoWindow.open(map);
                } else {
                    infoWindow.open(map, marker);
                }

                setTimeout(() => {
                    const btn = document.getElementById(`nav-btn-${stage.id}`);
                    if (btn && !isProximityLocked) {
                        btn.addEventListener('click', () => {
                            navigate(stage.route);
                        });
                    }
                }, 100);
            });

            markersRef.current.push(marker);
        });

        // Add User Location Marker (Custom)
        if (userLocation) {
            if (userMarkerRef.current) {
                userMarkerRef.current.setMap(null); // Remove old one to re-render with fresh class/style if needed 
                // Actually OverlayView is harder to update position efficiently without impl, so simple remove/add is safer
            }

            const userHtml = `
                    <div style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
                        <div class="absolute w-24 h-24 rounded-full border border-white/30 animate-ping opacity-20"></div>
                        <div class="absolute w-12 h-12 rounded-full bg-[#4285F4]/30 backdrop-blur-sm border border-[#4285F4]/50"></div>
                        <div class="w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] z-10 relative"></div>
                    </div>
            `;
            const userMarker = new htmlMarkerClassRef.current(userLocation, userHtml);
            userMarker.setMap(map);
            userMarkerRef.current = userMarker;
        }

    }, [map, getStageStatus, userLocation, navigate, devMode]);

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark/90 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="material-symbols-outlined text-white/80 hover:text-white transition-colors">arrow_back</button>
                    <h1 className="text-lg font-bold tracking-widest text-white">PROTOCOL MAP</h1>
                </div>
                <div className="text-xs font-mono text-acid">
                    {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'LOCATING...'}
                </div>
            </header>

            <div ref={mapRef} className="flex-1 w-full h-full mt-14 pb-20" />

            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background-dark/90 backdrop-blur border-t border-white/10">
                <p className="text-center text-xs text-white/60 font-mono">
                    Navigate to markers to unlock stages.
                </p>
            </div>
        </div>
    );
};

export default WorldMap;
