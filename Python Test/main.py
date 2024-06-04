import json
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np

with open('res/geometry.geojson', 'r') as f:
    data = json.load(f)
def plot_coordinates(ax, geometry):
    if geometry['type'] == 'Polygon':
        for ring in geometry['coordinates']:
            x, y = zip(*ring)
            ax.plot(x, y, color=np.random.rand(3,), linestyle='-', linewidth=2)
    elif geometry['type'] == 'MultiPolygon':
        for polygon in geometry['coordinates']:
            for ring in polygon:
                x, y = zip(*ring)
                ax.plot(x, y, color=np.random.rand(3,), linestyle='-', linewidth=2)
    else:
        print("Unsupported geometry type:", geometry['type'])

fig, ax = plt.subplots(figsize=(12, 8))
if data['type'] == 'FeatureCollection':
    for feature in data['features']:
        geometry = feature.get('geometry')
        if geometry:
            plot_coordinates(ax, geometry)
elif data['type'] == 'Feature':
    geometry = data.get('geometry')
    if geometry:
        plot_coordinates(ax, geometry)
elif data['type'] == 'GeometryCollection':
    for geometry in data['geometries']:
        plot_coordinates(ax, geometry)
else:
    print("Unsupported GeoJSON type:", data['type'])


plt.title("Indonesian EEZ's Fishing Effort")
ax.set_aspect('equal')
ax.set_xticklabels([])
ax.set_yticklabels([])
plt.show()
