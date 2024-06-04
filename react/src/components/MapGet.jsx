// components/MapGet.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapGet = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3388ff'); // Default color

  useEffect(() => {
    fetch('/res/geometry.geojson')
      .then((response) => response.json())
      .then((data) => setGeoJsonData(data));
  }, []);

  const renderPolygons = (geometry) => {
    if (geometry.type === 'Polygon') {
      return (
        <Polygon 
          positions={geometry.coordinates.map(ring => ring.map(coord => [coord[1], coord[0]]))}
          color={randomColor()}
          weight={4}  // Thicker border
        />
      );
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.map((polygon, index) => (
        <Polygon
          key={index}
          positions={polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))}
          color={randomColor()}
          weight={4}  // Thicker border
        />
      ));
    } else {
      console.error("Unsupported geometry type:", geometry.type);
      return null;
    }
  };

  const randomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const handleAddMarker = () => {
    if (!lat || !lon || !title || !color) return;
    const newMarker = { lat: parseFloat(lat), lon: parseFloat(lon), title, color };
    setMarkers([...markers, newMarker]);
    setLat('');
    setLon('');
    setTitle('');
    setColor('#3388ff'); // Reset to default color
  };

  return (
    <div>
      <div className="input-form">
        <input
          type="text"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={handleAddMarker}>Add Marker</button>
      </div>
      <MapContainer center={[-2.5, 117]} zoom={5} style={{ height: '90vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoJsonData && geoJsonData.features && geoJsonData.features.map((feature, index) => (
          <React.Fragment key={index}>
            {renderPolygons(feature.geometry)}
          </React.Fragment>
        ))}
        {markers.map((marker, index) => (
          <CircleMarker
            key={index}
            center={[marker.lat, marker.lon]}
            color={marker.color}
            radius={10}
          >
            <Popup>{marker.title}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapGet;
