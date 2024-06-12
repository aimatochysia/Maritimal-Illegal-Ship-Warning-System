import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import JSZip from 'jszip';
import Papa from 'papaparse';
import axios from 'axios';

const MapGet = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [markers, setMarkers] = useState([]);

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
          weight={4}
        />
      );
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.map((polygon, index) => (
        <Polygon
          key={index}
          positions={polygon.map(ring => ring.map(coord => [coord[1], coord[0]]))}
          color={randomColor()}
          weight={4}
        />
      ));
    } else {
      console.error("Unsupported geometry type:", geometry.type);
      return null;
    }
  };

  const randomColor = () => {
    return `#${Math.floor(Math.random() * 5).toString(16)}`;
  };

  const calculateColor = (value) => {
    const blue = 255 - Math.min(Math.max(parseInt(value), 0), 255);
    const red = Math.min(Math.max(parseInt(value), 0), 255);
    return `rgb(${red}, 0, ${blue})`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://gateway.api.globalfishingwatch.org/v2/4wings/report';
    
      // Calculate the dates for 7 days - 6 days ago
      const today = new Date();
      const firstdate = new Date(today);
      firstdate.setDate(today.getDate() - 7);
      const seconddate = new Date(today);
      seconddate.setDate(today.getDate() - 6);
    
      const formatDate = (date) => date.toISOString().split('T')[0];
    
      const params = {
        'spatial-resolution': 'high',
        'temporal-resolution': 'hourly',
        'group-by': 'mmsi',
        'datasets[0]': 'public-global-fishing-effort:latest',
        'date-range': `${formatDate(firstdate)},${formatDate(seconddate)}`,
        'format': 'csv'
      };
    
      const headers = {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX', // Replace with your actual token
        'Content-Type': 'application/json'
      };
      const data = {
        "region": {
          "dataset": "public-eez-areas",
          "id": 8492
        }
      };
    
      const maxRetries = 5;
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await axios.post(url, data, { params, headers, responseType: 'arraybuffer' });
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(response.data);
    
          const newMarkers = [];
    
          zipContent.forEach(async (relativePath, file) => {
            if (file.name.endsWith('.csv')) {
              const csvContent = await file.async('text');
              Papa.parse(csvContent, {
                complete: async function (results) {
                  const data = results.data;
                  for (let i = 1; i < data.length; i++) {
                    const lat = parseFloat(data[i][0]);
                    const lon = parseFloat(data[i][1]);
                    const mmsi = data[i][3];
                    if (lat && lon) {
                      let flag = 'NaN';
                      let shipname = 'Unidentified';
                      let shipinit = 'Unidentified';
                      let callsign = 'Empty';
                      let geartype = 'Unknown';
                      let title = `${flag}, ${shipname}, ${callsign}, ${geartype}`;
                      let missingvalue = 0;
                      if (mmsi) {
                        try {
                          const vesselInfoResponse = await axios.get(`https://gateway.api.globalfishingwatch.org/v3/vessels/search?query=${mmsi}&datasets[0]=public-global-vessel-identity:latest&includes[0]=MATCH_CRITERIA&includes[1]=OWNERSHIP&includes[2]=AUTHORIZATIONS`, {
                            headers: {
                              'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtpZEtleSJ9.eyJkYXRhIjp7Im5hbWUiOiJJbGxlZ2FsIEZpc2hpbmcgQm9hdCBBbmFseXNlciIsInVzZXJJZCI6MzE3NDcsImFwcGxpY2F0aW9uTmFtZSI6IklsbGVnYWwgRmlzaGluZyBCb2F0IEFuYWx5c2VyIiwiaWQiOjEzNDMsInR5cGUiOiJ1c2VyLWFwcGxpY2F0aW9uIn0sImlhdCI6MTcxMDMwNTM1NywiZXhwIjoyMDI1NjY1MzU3LCJhdWQiOiJnZnciLCJpc3MiOiJnZncifQ.hjAzx39Mt1wIZunhRN6LgJ386Z1rZwcoazHpSnoRYF_oESeoREelVFS22GaXfqeoaI4VaQ_qorf6uHJyUPR4m7Mm7KIl1N6AuVQ8VLcaCRxg0RDLGGCmkBXRv15vVqXkDikIsa9Y3ctslkW3s1AmhinDSZgDCIbDJDHG4-j-iUovroNTRy1YY_wMSfY2lBSqoJdcWxmS3uR8ao5Z7Ag6fwoI_FRXRW59wEghq06M3v5poREs0t8lXuM7yAByg3OYwwHnFU9pGTY2ofbd4stPOqADisqeTkCwG2n68H7kZgCliTX4UYWAgFZWObR_Xn3sC4ZqGI2Oo9Y43Kvn8YWCEqEH75_Ii_eOCX75S-bNKdKeYAuM2u8yHjYNTynAyi4DqNpuAvJo4YLy4PpIQPCNFyy7g72xFUiVoyH0WIXSWH3s9PD3cp_6fquJWmSsGp60LEu3HK7sepovQqn4Z5D9gtLra3UnQSMuzcM6eK-RaruHqb1syvHBOPHkKCghrJRX', // Replace with your actual token
                              'Content-Type': 'application/json'
                            }
                          });
                          const vesselInfo = vesselInfoResponse.data.entries[0];
                          if (vesselInfo && vesselInfo.registryInfo && vesselInfo.registryInfo[0]) {
                            flag = vesselInfo.registryInfo[0].flag || flag;
                            shipname = vesselInfo.registryInfo[0].shipname || shipname;
                            callsign = vesselInfo.registryInfo[0].callsign || callsign;
                            geartype = vesselInfo.combinedSourcesInfo[0]?.geartypes[0]?.name || geartype;
                            // Handling the cases based on the available data
                            if (flag==='NaN') {
                              if (shipname === 'Unidentified') {
                                if (callsign === 'Empty') {
                                  title = `${geartype}`;
                                } else {
                                  title = `${callsign}, ${geartype}`;
                                }
                              } else {
                                title = `${shipname}, ${callsign}, ${geartype}`;
                              }
                            } else {
                              title = `${flag}, ${shipname}, ${callsign}, ${geartype}`;
                            }
                          }
                          if (shipname !== shipinit) {
                            missingvalue+=1;
                          }
                        } catch (error) {
                          console.error('Error fetching vessel information:', error);
                          title = `${mmsi}`;
                        }
                      }
                      let colorValue = 1;
                      colorValue = colorValue + missingvalue*255;
                      const color = calculateColor(colorValue);
                        newMarkers.push({ lat, lon, title, color });
                    }
                  }
                  setMarkers(newMarkers);
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

  return (
    <div>
      <div className="input-form" >
        <h1>Ship Watch</h1>
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
            radius={2}
          >
            <Popup>{marker.title}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapGet;