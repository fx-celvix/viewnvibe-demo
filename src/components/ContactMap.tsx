'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default icon issue in React-Leaflet
const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.webp',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.webp',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.webp',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export function ContactMap() {
    // McLeod Ganj, Dharamshala coordinates
    const position: [number, number] = [32.2426, 76.3213];

    return (
        <MapContainer center={position} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.webp"
            />
            <Marker position={position} icon={markerIcon}>
                <Popup>
                    <b>View N Vibe Café</b><br />
                    Temple Road, McLeod Ganj<br />
                    Dharamshala, HP
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default ContactMap;
