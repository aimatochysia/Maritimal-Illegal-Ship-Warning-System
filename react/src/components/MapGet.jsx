// components/MapGet.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import JSZip from 'jszip';
import Papa from 'papaparse';
import axios from 'axios';

const MapGet = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3388ff');//

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
          weight={4}//
        />
      );
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.map((polygon, index) => (
        <Polygon
          key={index}
          positions={polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))}
          color={randomColor()}
          weight={4}//
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
  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://gateway.api.globalfishingwatch.org/v2/4wings/report';
      const params = {
        'spatial-resolution': 'low',
        'temporal-resolution': 'monthly',
        'group-by': 'gearType',
        'datasets[0]': 'public-global-fishing-effort:latest',
        'date-range': '2022-01-01,2022-05-01',
        'format': 'csv'
      };
      const headers = {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX', // Replace with your actual token
        'Content-Type': 'application/json'
      };
      const data = {
        "region": {
          "dataset": "public-eez-areas",
          "id": 8492 // Replace with Indonesia region EEZ ID
        }
      };

      const maxRetries = 5; // Maximum number of retries
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await axios.post(url, data, { params, headers, responseType: 'arraybuffer' });
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(response.data);

          zipContent.forEach(async (relativePath, file) => {
            if (file.name.endsWith('.csv')) {
              const csvContent = await file.async('text');
              Papa.parse(csvContent, {
                complete: function (results) {
                  const data = results.data;
                  for (let i = 1; i < data.length; i++) { // Assuming the first row is the header
                    console.log(`${data[i][0]},${data[i][1]}`);
                  }
                }
              });
            }
          });
          break; // Exit the retry loop if the request is successful
        } catch (error) {
          if (error.response && error.response.status === 429 && attempt < maxRetries) {
            // If status code is 429, wait and retry
            const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.warn(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`);
            await delay(waitTime);
          } else if (error.response && error.response.status === 401) {
            // Handle unauthorized error
            console.error('Unauthorized: Please check your API token.');
            break; // Stop retrying on unauthorized error
          } else {
            console.error('Error fetching and processing data', error);
            break; // Exit the loop if another error occurs or max retries reached
          }
        }
      }
    };

    fetchData();
  }, []);
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
      <div className="input-form" >
        <h1>Daily Ship Watch</h1>
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
        <input className="input-color"
          type="color"z
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={handleAddMarker}>Add Marker</button>
      </div>
      <MapContainer center={[-2.5, 117]} zoom={5} style={{ height: '100vh', width: '100%' }}>
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
            radius={5}
          >
            <Popup>{marker.title}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapGet;
