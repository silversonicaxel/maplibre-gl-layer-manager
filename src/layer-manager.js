/**
 * MapLibre GL Layer Manager Plugin
 * Provides UI controls for managing layer visibility, opacity, and styles
 */
class LayerManager {
  constructor(options = {}) {
    this.map = null;
    this.container = null;
    this.layers = options.layers || [];
    this.position = options.position || 'top-left';
    this.collapsed = options.collapsed || false;
    this.hideReorder = options.hideReorder || false;
    this.styleEditors = new Map();
    this.layerConfigs = new Map();

    // Initialize layer configurations
    this.layers.forEach(layer => {
      this.layerConfigs.set(layer.id, {
        visible: layer.visible !== false,
        opacity: layer.opacity || 1.0,
        minzoom: layer.minzoom,
        maxzoom: layer.maxzoom
      });
    });
  }

  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group layer-manager';

    // Create the main panel
    this.panel = document.createElement('div');
    this.panel.className = 'layer-manager-panel';
    if (this.collapsed) {
      this.panel.style.display = 'none';
    }

    // Create header
    const header = this._createHeader();
    this.container.appendChild(header);

    // Create layers section
    const layersSection = this._createLayersSection();
    this.panel.appendChild(layersSection);

    this.container.appendChild(this.panel);

    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = null;
  }

  _createHeader() {
    const header = document.createElement('div');
    header.className = 'layer-manager-header';

    const icon = document.createElement('button');
    icon.className = 'layer-manager-toggle';
    // SVG layers icon
    icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg>`;
    icon.title = 'Toggle Layers';
    icon.onclick = () => this._togglePanel();

    header.appendChild(icon);
    return header;
  }

  _togglePanel() {
    if (this.panel.style.display === 'none') {
      this.panel.style.display = '';
      this.collapsed = false;
    } else {
      this.panel.style.display = 'none';
      this.collapsed = true;
    }
  }

  _createLayersSection() {
    const section = document.createElement('div');
    section.className = 'layer-manager-section';

    // Title
    const title = document.createElement('div');
    title.className = 'layer-manager-title';
    title.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;">
      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
      <polyline points="2 17 12 22 22 17"></polyline>
      <polyline points="2 12 12 17 22 12"></polyline>
    </svg><span style="vertical-align: middle;">Layers</span>`;

    const toggleAllBtn = document.createElement('button');
    toggleAllBtn.className = 'layer-manager-btn-toggle-all';
    // Check if all layers are visible
    const allVisible = Array.from(this.layerConfigs.values()).every(config => config.visible);
    toggleAllBtn.innerHTML = allVisible ?
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>` :
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>`;
    toggleAllBtn.title = allVisible ? 'Hide all layers' : 'Show all layers';
    toggleAllBtn.onclick = () => this._toggleAllLayers(toggleAllBtn);
    title.appendChild(toggleAllBtn);

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'layer-manager-btn-collapse';
    collapseBtn.innerHTML = '&#x25B2;';
    collapseBtn.onclick = (e) => {
      const list = section.querySelector('.layer-manager-list');
      if (list.style.display === 'none') {
        list.style.display = '';
        e.target.innerHTML = '&#x25B2;';
      } else {
        list.style.display = 'none';
        e.target.innerHTML = '&#x25BC;';
      }
    };
    title.appendChild(collapseBtn);

    section.appendChild(title);

    // Layers list
    const list = document.createElement('div');
    list.className = 'layer-manager-list';

    this.layers.forEach(layer => {
      const layerItem = this._createLayerItem(layer);
      list.appendChild(layerItem);
    });

    section.appendChild(list);
    return section;
  }

  _createLayerItem(layer) {
    const item = document.createElement('div');
    item.className = 'layer-manager-item';
    item.dataset.layerId = layer.id;

    // Create reorder controls container
    const reorderControls = document.createElement('div');
    reorderControls.className = 'layer-manager-reorder-controls';

    // Create drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'layer-manager-drag-handle';
    dragHandle.innerHTML = '&#8942;&#8942;'; // Vertical dots
    dragHandle.title = 'Drag to reorder';
    dragHandle.draggable = true;

    // Drag and drop event handlers on the handle
    dragHandle.ondragstart = (e) => this._handleDragStart(e);
    item.ondragover = (e) => this._handleDragOver(e);
    item.ondrop = (e) => this._handleDrop(e);
    item.ondragend = (e) => this._handleDragEnd(e);
    item.ondragenter = (e) => this._handleDragEnter(e);
    item.ondragleave = (e) => this._handleDragLeave(e);

    // Up arrow button
    const upBtn = document.createElement('button');
    upBtn.className = 'layer-manager-btn-move-up';
    upBtn.innerHTML = '&#9650;'; // Up triangle
    upBtn.title = 'Move up';
    upBtn.onclick = () => this._moveLayerUp(layer.id);

    // Down arrow button
    const downBtn = document.createElement('button');
    downBtn.className = 'layer-manager-btn-move-down';
    downBtn.innerHTML = '&#9660;'; // Down triangle
    downBtn.title = 'Move down';
    downBtn.onclick = () => this._moveLayerDown(layer.id);

    reorderControls.appendChild(dragHandle);
    reorderControls.appendChild(upBtn);
    reorderControls.appendChild(downBtn);

    // Checkbox for visibility
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'layer-manager-checkbox';
    checkbox.checked = this.layerConfigs.get(layer.id).visible;
    checkbox.onchange = (e) => this._toggleLayerVisibility(layer.id, e.target.checked);

    const label = document.createElement('label');
    label.className = 'layer-manager-label';
    label.textContent = layer.name || layer.id;
    label.onclick = () => checkbox.click();

    // Controls container
    const controls = document.createElement('div');
    controls.className = 'layer-manager-controls';

    // Opacity slider
    const opacityControl = document.createElement('div');
    opacityControl.className = 'layer-manager-opacity';

    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '1';
    opacitySlider.step = '0.05';
    opacitySlider.value = this.layerConfigs.get(layer.id).opacity;
    opacitySlider.className = 'layer-manager-slider';
    opacitySlider.oninput = (e) => this._updateLayerOpacity(layer.id, parseFloat(e.target.value));

    opacityControl.appendChild(opacitySlider);

    // Style button
    const styleBtn = document.createElement('button');
    styleBtn.className = 'layer-manager-btn-style';
    styleBtn.innerHTML = '&#x2699;';
    styleBtn.title = 'Style layer';
    styleBtn.onclick = () => this._toggleStyleEditor(layer.id);

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'layer-manager-btn-remove';
    removeBtn.innerHTML = '&#x2715;';
    removeBtn.title = 'Remove layer';
    removeBtn.onclick = () => this._removeLayer(layer.id);

    controls.appendChild(opacityControl);
    controls.appendChild(styleBtn);
    controls.appendChild(removeBtn);

    !this.hideReorder && item.appendChild(reorderControls);
    item.appendChild(checkbox);
    item.appendChild(label);
    item.appendChild(controls);

    // Style editor panel (initially hidden)
    const styleEditor = this._createStyleEditor(layer);
    item.appendChild(styleEditor);

    return item;
  }

  _createStyleEditor(layer) {
    const editor = document.createElement('div');
    editor.className = 'layer-manager-style-editor';
    editor.style.display = 'none';
    editor.dataset.layerId = layer.id;

    // Get the current style from the map
    const mapLayer = this.map.getLayer(layer.id);
    if (!mapLayer) return editor;

    const layerType = mapLayer.type;
    const paint = mapLayer.paint || {};

    // Title
    const title = document.createElement('div');
    title.className = 'layer-manager-style-title';
    title.innerHTML = '<span>&#x1F3A8;</span> Style ' + (layer.name || layer.id);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'layer-manager-btn-close';
    closeBtn.innerHTML = '&#x2715;';
    closeBtn.onclick = () => this._toggleStyleEditor(layer.id);
    title.appendChild(closeBtn);

    editor.appendChild(title);

    // Style controls based on layer type
    if (layerType === 'circle') {
      editor.appendChild(this._createColorControl('Circle Color', layer.id, 'circle-color', paint['circle-color'] || '#3388ff'));
      editor.appendChild(this._createSliderControl('Circle Radius', layer.id, 'circle-radius', paint['circle-radius'] || 5, 0, 20, 0.5));
      editor.appendChild(this._createSliderControl('Circle Opacity', layer.id, 'circle-opacity', paint['circle-opacity'] || 1, 0, 1, 0.05));
      editor.appendChild(this._createSliderControl('Circle Blur', layer.id, 'circle-blur', paint['circle-blur'] || 0, 0, 5, 0.1));
      editor.appendChild(this._createColorControl('Circle Stroke Color', layer.id, 'circle-stroke-color', paint['circle-stroke-color'] || '#ffffff'));
      editor.appendChild(this._createSliderControl('Circle Stroke Width', layer.id, 'circle-stroke-width', paint['circle-stroke-width'] || 1, 0, 5, 0.1));
      editor.appendChild(this._createSliderControl('Circle Stroke Opacity', layer.id, 'circle-stroke-opacity', paint['circle-stroke-opacity'] || 1, 0, 1, 0.05));
    } else if (layerType === 'line') {
      editor.appendChild(this._createColorControl('Line Color', layer.id, 'line-color', paint['line-color'] || '#3388ff'));
      editor.appendChild(this._createSliderControl('Line Width', layer.id, 'line-width', paint['line-width'] || 2, 0, 20, 0.5));
      editor.appendChild(this._createSliderControl('Line Opacity', layer.id, 'line-opacity', paint['line-opacity'] || 1, 0, 1, 0.05));
      editor.appendChild(this._createSliderControl('Line Blur', layer.id, 'line-blur', paint['line-blur'] || 0, 0, 5, 0.1));
    } else if (layerType === 'fill') {
      editor.appendChild(this._createColorControl('Fill Color', layer.id, 'fill-color', paint['fill-color'] || '#3388ff'));
      editor.appendChild(this._createSliderControl('Fill Opacity', layer.id, 'fill-opacity', paint['fill-opacity'] || 0.5, 0, 1, 0.05));
      editor.appendChild(this._createColorControl('Fill Outline Color', layer.id, 'fill-outline-color', paint['fill-outline-color'] || '#3388ff'));
    } else if (layerType === 'raster') {
      editor.appendChild(this._createSliderControl('Raster Opacity', layer.id, 'raster-opacity', paint['raster-opacity'] || 1, 0, 1, 0.05));
      editor.appendChild(this._createSliderControl('Raster Brightness Min', layer.id, 'raster-brightness-min', paint['raster-brightness-min'] || 0, -1, 1, 0.05));
      editor.appendChild(this._createSliderControl('Raster Brightness Max', layer.id, 'raster-brightness-max', paint['raster-brightness-max'] || 1, -1, 1, 0.05));
      editor.appendChild(this._createSliderControl('Raster Saturation', layer.id, 'raster-saturation', paint['raster-saturation'] || 0, -1, 1, 0.05));
      editor.appendChild(this._createSliderControl('Raster Contrast', layer.id, 'raster-contrast', paint['raster-contrast'] || 0, -1, 1, 0.05));
    }

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'layer-manager-style-actions';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'layer-manager-btn-apply';
    applyBtn.textContent = 'Apply';
    applyBtn.onclick = () => this._applyStyles(layer.id);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'layer-manager-btn-reset';
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => this._resetStyles(layer.id);

    const closeBtn2 = document.createElement('button');
    closeBtn2.className = 'layer-manager-btn-close-bottom';
    closeBtn2.textContent = 'Close';
    closeBtn2.onclick = () => this._toggleStyleEditor(layer.id);

    actions.appendChild(applyBtn);
    actions.appendChild(resetBtn);
    actions.appendChild(closeBtn2);

    editor.appendChild(actions);

    return editor;
  }

  _createColorControl(label, layerId, property, value) {
    const control = document.createElement('div');
    control.className = 'layer-manager-style-control';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const inputContainer = document.createElement('div');
    inputContainer.className = 'layer-manager-color-input';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = this._rgbToHex(value);
    colorInput.dataset.property = property;

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = this._rgbToHex(value);
    textInput.readOnly = true;

    colorInput.oninput = (e) => {
      textInput.value = e.target.value;
    };

    inputContainer.appendChild(colorInput);
    inputContainer.appendChild(textInput);

    control.appendChild(labelEl);
    control.appendChild(inputContainer);

    return control;
  }

  _createSliderControl(label, layerId, property, value, min, max, step) {
    const control = document.createElement('div');
    control.className = 'layer-manager-style-control';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'layer-manager-slider-input';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;
    slider.dataset.property = property;
    slider.className = 'layer-manager-slider';

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'layer-manager-value';
    valueDisplay.textContent = value.toFixed(2);

    slider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      valueDisplay.textContent = val.toFixed(2);
      // Live update
      this.map.setPaintProperty(layerId, property, val);
    };

    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);

    control.appendChild(labelEl);
    control.appendChild(sliderContainer);

    return control;
  }

  _toggleLayerVisibility(layerId, visible) {
    const visibility = visible ? 'visible' : 'none';
    this.map.setLayoutProperty(layerId, 'visibility', visibility);
    this.layerConfigs.get(layerId).visible = visible;
  }

  _updateLayerOpacity(layerId, opacity) {
    this.layerConfigs.get(layerId).opacity = opacity;
    const layer = this.map.getLayer(layerId);
    if (layer) {
      const type = layer.type;
      let opacityProp = type + '-opacity';
      this.map.setPaintProperty(layerId, opacityProp, opacity);
    }
  }

  _toggleAllLayers(button) {
    const allVisible = Array.from(this.layerConfigs.values()).every(config => config.visible);
    const newVisibility = !allVisible;

    this.layers.forEach(layer => {
      this._toggleLayerVisibility(layer.id, newVisibility);
      const checkbox = this.container.querySelector(`[data-layer-id="${layer.id}"] .layer-manager-checkbox`);
      if (checkbox) {
        checkbox.checked = newVisibility;
      }
    });

    // Update the button icon
    if (button) {
      button.innerHTML = newVisibility ?
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>` :
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`;
      button.title = newVisibility ? 'Hide all layers' : 'Show all layers';
    }
  }

  _toggleStyleEditor(layerId) {
    const editor = this.container.querySelector(`.layer-manager-style-editor[data-layer-id="${layerId}"]`);
    if (editor) {
      if (editor.style.display === 'none') {
        // Close all other editors
        this.container.querySelectorAll('.layer-manager-style-editor').forEach(e => {
          e.style.display = 'none';
        });
        editor.style.display = 'block';
      } else {
        editor.style.display = 'none';
      }
    }
  }

  _applyStyles(layerId) {
    const editor = this.container.querySelector(`.layer-manager-style-editor[data-layer-id="${layerId}"]`);
    if (!editor) return;

    const inputs = editor.querySelectorAll('input[data-property]');
    inputs.forEach(input => {
      const property = input.dataset.property;
      let value = input.type === 'color' ? input.value : parseFloat(input.value);
      this.map.setPaintProperty(layerId, property, value);
    });
  }

  _resetStyles(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer || !layer.originalStyle) return;

    // Reset to original style
    Object.keys(layer.originalStyle).forEach(prop => {
      this.map.setPaintProperty(layerId, prop, layer.originalStyle[prop]);
    });

    // Refresh the editor but keep it open
    const item = this.container.querySelector(`.layer-manager-item[data-layer-id="${layerId}"]`);
    const oldEditor = item.querySelector('.layer-manager-style-editor');
    const wasOpen = oldEditor.style.display === 'block';
    const newEditor = this._createStyleEditor(layer);

    // Keep the editor open if it was open before
    if (wasOpen) {
      newEditor.style.display = 'block';
    }

    item.replaceChild(newEditor, oldEditor);
  }

  _removeLayer(layerId) {
    this.map.removeLayer(layerId);
    const item = this.container.querySelector(`.layer-manager-item[data-layer-id="${layerId}"]`);
    if (item) {
      item.remove();
    }
    this.layerConfigs.delete(layerId);
    this.layers = this.layers.filter(l => l.id !== layerId);
  }

  _rgbToHex(color) {
    if (!color) return '#000000';
    if (typeof color === 'string' && color.startsWith('#')) {
      return color;
    }
    if (typeof color === 'string' && color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match) {
        return '#' + match.slice(0, 3).map(x => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
      }
    }
    return '#000000';
  }

  addLayer(layer) {
    this.layers.push(layer);
    this.layerConfigs.set(layer.id, {
      visible: layer.visible !== false,
      opacity: layer.opacity || 1.0
    });

    const list = this.container.querySelector('.layer-manager-list');
    if (list) {
      const layerItem = this._createLayerItem(layer);
      list.appendChild(layerItem);
    }
  }

  removeLayer(layerId) {
    this._removeLayer(layerId);
  }

  getPosition() {
    return this.position;
  }

  _handleDragStart(e) {
    const item = e.target.closest('.layer-manager-item');
    if (!item) return;

    this.draggedElement = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.innerHTML);
  }

  _handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  _handleDragEnter(e) {
    const item = e.target.closest('.layer-manager-item');
    if (item && item !== this.draggedElement) {
      item.classList.add('drag-over');
    }
  }

  _handleDragLeave(e) {
    const item = e.target.closest('.layer-manager-item');
    if (item) {
      item.classList.remove('drag-over');
    }
  }

  _handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const targetItem = e.target.closest('.layer-manager-item');
    if (!targetItem || !this.draggedElement || targetItem === this.draggedElement) {
      return false;
    }

    // Get the layer IDs
    const draggedId = this.draggedElement.dataset.layerId;
    const targetId = targetItem.dataset.layerId;

    // Update the DOM
    const list = this.container.querySelector('.layer-manager-list');
    const allItems = Array.from(list.querySelectorAll('.layer-manager-item'));
    const draggedIndex = allItems.indexOf(this.draggedElement);
    const targetIndex = allItems.indexOf(targetItem);

    if (draggedIndex < targetIndex) {
      targetItem.parentNode.insertBefore(this.draggedElement, targetItem.nextSibling);
    } else {
      targetItem.parentNode.insertBefore(this.draggedElement, targetItem);
    }

    // Update the layers array
    const draggedLayer = this.layers.find(l => l.id === draggedId);
    this.layers = this.layers.filter(l => l.id !== draggedId);
    const newTargetIndex = this.layers.findIndex(l => l.id === targetId);

    if (draggedIndex < targetIndex) {
      this.layers.splice(newTargetIndex + 1, 0, draggedLayer);
    } else {
      this.layers.splice(newTargetIndex, 0, draggedLayer);
    }

    // Update map layer order - MapLibre layers are ordered bottom to top
    // so we need to reverse the order when moving layers
    this._updateMapLayerOrder();

    targetItem.classList.remove('drag-over');
    return false;
  }

  _handleDragEnd(e) {
    const item = e.target.closest('.layer-manager-item');
    if (item) {
      item.classList.remove('dragging');
    }

    // Remove all drag-over classes
    this.container.querySelectorAll('.layer-manager-item').forEach(item => {
      item.classList.remove('drag-over');
    });

    this.draggedElement = null;
  }

  _updateMapLayerOrder() {
    // Get all layer items in current DOM order (top to bottom in UI)
    const items = this.container.querySelectorAll('.layer-manager-item');
    const layerIds = Array.from(items).map(item => item.dataset.layerId).reverse();

    // MapLibre stacking order: first layer is on bottom, last is on top
    // UI order: first item should be on top in the map
    // Reverse the array so bottom UI item = bottom map layer
    // Then move layers from bottom to top, each one above the previous

    let previousLayerId = null;
    for (let i = 0; i < layerIds.length; i++) {
      const layerId = layerIds[i];

      try {
        if (this.map.getLayer(layerId)) {
          if (previousLayerId && this.map.getLayer(previousLayerId)) {
            // Move this layer before the previous one (which moves it above in render order)
            this.map.moveLayer(layerId, previousLayerId);
          } else {
            // First layer (bottom-most), move it to the very bottom
            // Find the first layer in the map that's not in our managed layers
            const allLayers = this.map.getStyle().layers;
            const firstNonManagedLayer = allLayers.find(l => !layerIds.includes(l.id));
            if (firstNonManagedLayer) {
              this.map.moveLayer(layerId, firstNonManagedLayer.id);
            }
          }
          previousLayerId = layerId;
        }
      } catch (e) {
        console.warn(`Could not move layer ${layerId}:`, e);
      }
    }
  }

  _moveLayerUp(layerId) {
    const list = this.container.querySelector('.layer-manager-list');
    const items = Array.from(list.querySelectorAll('.layer-manager-item'));
    const currentItem = items.find(item => item.dataset.layerId === layerId);
    const currentIndex = items.indexOf(currentItem);

    // Can't move up if already at the top
    if (currentIndex === 0) return;

    // Move in DOM
    const previousItem = items[currentIndex - 1];
    list.insertBefore(currentItem, previousItem);

    // Update layers array
    const layerIndex = this.layers.findIndex(l => l.id === layerId);
    const layer = this.layers[layerIndex];
    this.layers.splice(layerIndex, 1);
    this.layers.splice(layerIndex - 1, 0, layer);

    // Update map
    this._updateMapLayerOrder();
  }

  _moveLayerDown(layerId) {
    const list = this.container.querySelector('.layer-manager-list');
    const items = Array.from(list.querySelectorAll('.layer-manager-item'));
    const currentItem = items.find(item => item.dataset.layerId === layerId);
    const currentIndex = items.indexOf(currentItem);

    // Can't move down if already at the bottom
    if (currentIndex === items.length - 1) return;

    // Move in DOM
    const nextItem = items[currentIndex + 1];
    list.insertBefore(nextItem, currentItem);

    // Update layers array
    const layerIndex = this.layers.findIndex(l => l.id === layerId);
    const layer = this.layers[layerIndex];
    this.layers.splice(layerIndex, 1);
    this.layers.splice(layerIndex + 1, 0, layer);

    // Update map
    this._updateMapLayerOrder();
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LayerManager;
}
