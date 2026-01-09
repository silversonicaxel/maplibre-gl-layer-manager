# MapLibre GL Layer Manager

A powerful and user-friendly layer management plugin for MapLibre GL JS that provides comprehensive controls for managing layer visibility, opacity, and styles.

![Layer Manager Screenshot](https://github.com/user-attachments/assets/1638ddcd-c084-46b1-abc6-159e1cd911a3)

## Features

- **Layer Visibility Control**: Toggle individual layers or all layers at once
- **Opacity Adjustment**: Fine-tune layer opacity with intuitive sliders
- **Style Editor**: Modify layer paint properties in real-time:
  - Circle layers: color, radius, opacity, blur, stroke properties
  - Line layers: color, width, opacity, blur
  - Fill layers: color, opacity, outline color
  - Raster layers: opacity, brightness, saturation, contrast
- **Layer Management**: Remove unwanted layers from the map
- **Collapsible Interface**: Clean, space-saving design
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### NPM

```bash
npm install maplibre-gl-layer-manager
```

### CDN

Include the CSS and JS files from unpkg in your HTML:

```html
<!-- MapLibre GL JS -->
<script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script>
<link
  href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css"
  rel="stylesheet"
/>

<!-- Layer Manager Plugin -->
<link href="https://unpkg.com/maplibre-gl-layer-manager@latest/src/layer-manager.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl-layer-manager@latest/src/layer-manager.js"></script>
```

## Usage

### Basic Example

```javascript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import LayerManager from 'maplibre-gl-layer-manager';
import 'maplibre-gl-layer-manager/src/layer-manager.css';

// Initialize your MapLibre GL map
const map = new maplibregl.Map({
  container: "map",
  style: "your-map-style.json",
  center: [-98.5795, 39.8283],
  zoom: 4,
});

// Wait for the map to load
map.on("load", function () {
  // Create the layer manager
  const layerManager = new LayerManager({
    title: "Panel",
    layers: [
      {
        id: "background",
        name: "Background",
        visible: true,
        opacity: 1.0,
      },
      {
        id: "cities",
        name: "World Cities",
        visible: true,
        opacity: 0.8,
        originalStyle: {
          "circle-radius": 5,
          "circle-color": "#3388ff",
          "circle-opacity": 0.8,
        },
      },
    ],
    position: "top-left",
    collapsed: false,
  });

  // Add the control to the map
  map.addControl(layerManager, "top-left");
});
```

#### Using CDN (without npm)

If you're using the CDN version, the `LayerManager` class is available globally:

```html
<!DOCTYPE html>
<html>
<head>
  <link href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" rel="stylesheet" />
  <link href="https://unpkg.com/maplibre-gl-layer-manager@latest/src/layer-manager.css" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script>
  <script src="https://unpkg.com/maplibre-gl-layer-manager@latest/src/layer-manager.js"></script>
  <script>
    const map = new maplibregl.Map({
      container: "map",
      style: "your-map-style.json",
      center: [-98.5795, 39.8283],
      zoom: 4,
    });

    map.on("load", function () {
      const layerManager = new LayerManager({
        layers: [
          { id: "background", name: "Background", visible: true },
          { id: "cities", name: "World Cities", visible: true }
        ],
        position: "top-left",
        collapsed: false,
      });

      map.addControl(layerManager, "top-left");
    });
  </script>
</body>
</html>
```

### Configuration Options

#### LayerManager Constructor Options

| Option      | Type    | Default      | Description                          |
| ----------- | ------- | ------------ | ------------------------------------ |
| `title`     | String  | `Layers`     | Title of the layer manager panel     |
| `layers`    | Array   | `[]`         | Array of layer configuration objects |
| `position`  | String  | `'top-left'` | Position of the control on the map   |
| `collapsed` | Boolean | `false`      | Whether the panel starts collapsed   |

#### Layer Configuration Object

| Property        | Type    | Required | Description                                          |
| --------------- | ------- | -------- | ---------------------------------------------------- |
| `id`            | String  | Yes      | Layer ID (must match the layer ID in your map style) |
| `name`          | String  | No       | Display name for the layer (defaults to id)          |
| `visible`       | Boolean | No       | Initial visibility state (default: true)             |
| `opacity`       | Number  | No       | Initial opacity (0-1, default: 1.0)                  |
| `originalStyle` | Object  | No       | Original paint properties for the Reset function     |
| `minzoom`       | Number  | No       | Minimum zoom level for the layer                     |
| `maxzoom`       | Number  | No       | Maximum zoom level for the layer                     |

### Methods

#### `addLayer(layer)`

Add a new layer to the layer manager.

```javascript
layerManager.addLayer({
  id: "new-layer",
  name: "New Layer",
  visible: true,
  opacity: 1.0,
});
```

#### `removeLayer(layerId)`

Remove a layer from the layer manager.

```javascript
layerManager.removeLayer("layer-id");
```

#### `getPosition()`

Get the current position of the control.

```javascript
const position = layerManager.getPosition();
```

## Supported Layer Types

The Layer Manager supports styling for the following MapLibre GL layer types:

- **Circle**: Point features rendered as circles
- **Line**: Linear features
- **Fill**: Polygon features
- **Raster**: Raster tile layers (imagery, terrain)

## Style Editor Properties

### Circle Layers

- Circle Color
- Circle Radius (0-20)
- Circle Opacity (0-1)
- Circle Blur (0-5)
- Circle Stroke Color
- Circle Stroke Width (0-5)
- Circle Stroke Opacity (0-1)

### Line Layers

- Line Color
- Line Width (0-20)
- Line Opacity (0-1)
- Line Blur (0-5)

### Fill Layers

- Fill Color
- Fill Opacity (0-1)
- Fill Outline Color

### Raster Layers

- Raster Opacity (0-1)
- Raster Brightness Min (-1 to 1)
- Raster Brightness Max (-1 to 1)
- Raster Saturation (-1 to 1)
- Raster Contrast (-1 to 1)

## Demo

To run the demo:

1. Clone this repository
2. Open `demo/index.html` in your web browser
3. Interact with the layer manager in the top-left corner

The demo showcases:

- Base map background layer
- USGS satellite imagery layer
- US States polygon layer
- World Cities point layer

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Project Structure

```
maplibre-gl-layer-manager/
├── src/
│   ├── layer-manager.js    # Main plugin code
│   └── layer-manager.css   # Styles
├── demo/
│   └── index.html          # Demo page
├── package.json
└── README.md
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Credits

Built with [MapLibre GL JS](https://maplibre.org/)

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

Future enhancements planned:

- [ ] Layer grouping
- [ ] Search/filter layers
- [ ] Export layer configurations
- [ ] Import layer configurations
- [ ] Layer reordering
- [ ] Symbol layer styling support
- [ ] Custom style templates
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (ARIA labels)

## Examples

### Advanced Configuration

```javascript
const layerManager = new LayerManager({
  layers: [
    {
      id: "satellite",
      name: "Satellite Imagery",
      visible: false,
      opacity: 0.8,
      originalStyle: {
        "raster-opacity": 0.8,
        "raster-brightness-min": 0,
        "raster-brightness-max": 1,
      },
    },
    {
      id: "boundaries",
      name: "State Boundaries",
      visible: true,
      opacity: 0.6,
      originalStyle: {
        "fill-color": "#627BC1",
        "fill-opacity": 0.6,
        "fill-outline-color": "#ffffff",
      },
    },
  ],
  position: "top-right",
  collapsed: true,
});

map.addControl(layerManager, "top-right");
```

### Dynamically Adding Layers

```javascript
// Add a new GeoJSON source to the map
map.addSource("earthquakes", {
  type: "geojson",
  data: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
});

// Add the layer to the map
map.addLayer({
  id: "earthquakes",
  type: "circle",
  source: "earthquakes",
  paint: {
    "circle-radius": 8,
    "circle-color": "#ff0000",
    "circle-opacity": 0.6,
  },
});

// Add it to the layer manager
layerManager.addLayer({
  id: "earthquakes",
  name: "Recent Earthquakes",
  visible: true,
  opacity: 0.6,
});
```

## FAQ

**Q: Can I use this with Mapbox GL JS?**
A: This plugin is designed for MapLibre GL JS, but it may work with Mapbox GL JS v1.x with minor modifications.

**Q: How do I save the user's layer configuration?**
A: You can access the layer configurations through the `layerConfigs` Map property and save it to localStorage or a backend.

**Q: Can I customize the colors and styling?**
A: Yes! Override the CSS variables and classes in `layer-manager.css` to match your design.

**Q: Does it support 3D layers?**
A: Currently, the plugin supports 2D layers (circle, line, fill, raster). 3D layer support is planned for future releases.

## Changelog

### Version 1.0.0 (2025-10-11)

- Initial release
- Layer visibility controls
- Opacity adjustment
- Style editor for circle, line, fill, and raster layers
- Layer removal
- Collapsible interface
