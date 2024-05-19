from gfw import GFWAPI

# Initialize the GFW API client
gfw_api = GFWAPI()

# Define query parameters
query_params = {
    "date_range": "2024-02-01,2024-01-02",  # Start date comes first, then end date
    "geojson": {"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [[[95.2930, 5.4799], [141.0197, 5.4799], [141.0197, -11.0104], [95.2930, -11.0104], [95.2930, 5.4799]]]}},  # EEZ region of Indonesia polygon coordinates
    "datasets": ["public-vessel-tracking:latest"]
}

# Query vessel data
vessel_data = gfw_api.query_vessels(**query_params)

# Print the response
print(vessel_data)
