import { Component, AfterViewInit, ElementRef, ViewChild, inject, output } from '@angular/core';
import * as L from 'leaflet';
import { WrappedService } from '../../../core/services/wrapped/wrapped.service';

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
  litres: number;
}

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainerRef!:
  ElementRef<HTMLDivElement>;
  @ViewChild('mapWrapper') mapWrapperRef!: ElementRef<HTMLDivElement>;

  fullscreenStatusChange = output<boolean>();

  private wrappedService = inject(WrappedService);

  map!: L.Map;
  heatCanvas!: HTMLCanvasElement;
  points: HeatPoint[] = [];
  isFullScreen = false;

  private fullscreenListener = () => this.handleFullscreenChange();

  ngAfterViewInit(): void {
    // Escoltem l'event natiu del navegador per detectar canvis (incloent la tecla ESC)
    document.addEventListener('fullscreenchange', this.fullscreenListener);

    setTimeout(() => this.initMap(), 200);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenListener);

    // Si el component es destrueix (l'usuari canvia de story mentre està en fullscreen),
    // ens assegurem que el pare torni a fer play.
    if (this.isFullScreen) {
       this.wrappedService.setFullscreenState(false);
    }
  }

  initMap(): void {
    const container = this.mapContainerRef.nativeElement;

    if (!container.offsetWidth || !container.offsetHeight) {
      setTimeout(() => this.initMap(), 200);
      return;
    }

    // DADES
    const locationData = this.wrappedService.getlocationData() ?? [];
    const maxlocationDataLiters = this.wrappedService.getMaxLocationLitres();

    this.points = locationData.map((l, index) => {
      const lat = +l.latitude;
      const lng = +l.longitude;
      const sameLocation = locationData.filter(other =>
        +other.latitude === lat && +other.longitude === lng
      ).length;
      const offset = sameLocation > 1 ? (index % sameLocation) * 0.0001 : 0;

      return {
        lat: lat + offset,
        lng: lng + offset,
        intensity: +l.total_litres / (maxlocationDataLiters || 1),
        litres: +l.total_litres
      };
    });

    console.log(`Loaded ${this.points.length} points for heatmap`);

    // Crear mapa
    const center: [number, number] = this.points.length
      ? [this.points[0].lat, this.points[0].lng]
      : [41.3851, 2.1734];

    this.map = L.map(container, {
      center: center,
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Crear canvas per heatmap
    this.createHeatmapCanvas();

    // Afegir markers invisibles per popup
    this.addInvisibleMarkers();

    // Redibuixar heatmap en moure/zoom
    this.map.on('moveend zoomend', () => {
      this.drawHeatmap();
    });

    setTimeout(() => {
      this.map.invalidateSize();
      if (this.points.length > 1) {
        const bounds = L.latLngBounds(this.points.map(p => [p.lat, p.lng]));
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
      this.drawHeatmap();
    }, 100);
  }

  createHeatmapCanvas(): void {
    const size = this.map.getSize();
    this.heatCanvas = document.createElement('canvas');
    this.heatCanvas.width = size.x;
    this.heatCanvas.height = size.y;
    this.heatCanvas.style.position = 'absolute';
    this.heatCanvas.style.top = '0';
    this.heatCanvas.style.left = '0';
    this.heatCanvas.style.pointerEvents = 'none';

    const pane = this.map.getPanes().overlayPane;
    pane.appendChild(this.heatCanvas);

    // Actualitzar mida del canvas quan canvia el mapa
    this.map.on('resize', () => {
      const newSize = this.map.getSize();
      this.heatCanvas.width = newSize.x;
      this.heatCanvas.height = newSize.y;
      this.drawHeatmap();
    });
  }

  drawHeatmap(): void {
    const ctx = this.heatCanvas.getContext('2d');
    if (!ctx) return;

    const size = this.map.getSize();

    // --- INICI CANVI ---
    // 1. Obtenir on és el punt 0,0 de la pantalla (container) respecte al pane (layer)
    const topLeft = this.map.containerPointToLayerPoint([0, 0]);

    // 2. Forçar la posició del canvas perquè s'alineï amb la pantalla
    L.DomUtil.setPosition(this.heatCanvas, topLeft);

    // 3. Assegurar que la mida del canvas és correcta
    this.heatCanvas.width = size.x;
    this.heatCanvas.height = size.y;
    // --- FI CANVI ---

    // Canvas temporal per aplicar blur (el teu codi original continua igual...)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size.x;
    tempCanvas.height = size.y;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const zoom = this.map.getZoom();
    const radius = this.getRadiusForZoom(zoom);

    // Dibuixar tots els punts al canvas temporal
    this.points.forEach(point => {
      const latLng = L.latLng(point.lat, point.lng);

      // Això ara funcionarà bé perquè hem alineat el canvas amb el container
      const pixelPoint = this.map.latLngToContainerPoint(latLng);

      // ... resta del codi igual ...
      const gradient = tempCtx.createRadialGradient(
        pixelPoint.x, pixelPoint.y, 0,
        pixelPoint.x, pixelPoint.y, radius
      );

      gradient.addColorStop(0, `rgba(0, 0, 0, ${point.intensity})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      tempCtx.fillStyle = gradient;
      tempCtx.fillRect(
        pixelPoint.x - radius,
        pixelPoint.y - radius,
        radius * 2,
        radius * 2
      );
    });

    // ... resta de la lògica de colors i blur ...
    const blurAmount = this.getBlurForZoom(zoom);
    tempCtx.filter = `blur(${blurAmount}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, size.x, size.y);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      if (alpha > 0) {
        const color = this.getColorForIntensity(alpha);
        const rgb = this.hexToRgb(color);
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
        data[i + 3] = Math.min(255, alpha * 180);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  addInvisibleMarkers(): void {
    this.points.forEach(point => {
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: 8,
        fillOpacity: 0,
        opacity: 0,
        interactive: true
      }).addTo(this.map);

      marker.bindPopup(`
        <div style="text-align: center;">
          <b>${point.litres.toFixed(2)} L</b><br>
          <small>Intensitat: ${(point.intensity * 100).toFixed(1)}%</small>
        </div>
      `);
    });
  }

  getColorForIntensity(intensity: number): string {
    if (intensity < 0.4) {
      return '#0000FF'; // Blue
    } else if (intensity < 0.45) {
      const t = (intensity - 0.4) / 0.05;
      return this.interpolateColor('#0000FF', '#00FF00', t);
    } else if (intensity < 0.70) {
      const t = (intensity - 0.45) / 0.25;
      return this.interpolateColor('#00FF00', '#FF0000', t);
    } else {
      const t = Math.min(1, (intensity - 0.70) / 0.30);
      return this.interpolateColor('#FF0000', '#800080', t);
    }
  }

  interpolateColor(color1: string, color2: string, t: number): string {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  hexToRgb(hex: string): { r: number, g: number, b: number } {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  getRadiusForZoom(zoom: number): number {
    if (zoom >= 17) return 10;
    if (zoom >= 15) return 15;
    if (zoom >= 13) return 20;
    return 30;
  }

  getBlurForZoom(zoom: number): number {
    if (zoom >= 17) return 10;
    if (zoom >= 15) return 15;
    return 20;
  }

  toggleFullScreen(): void {
    const elem = this.mapWrapperRef.nativeElement;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    // No cal emetre res aquí, l'event 'fullscreenchange' dispararà handleFullscreenChange
  }

  updateMapSize(): void {
    // Petit retard per donar temps al navegador a fer el canvi de mida
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.map.fire('resize'); // Força el redibuixat del canvas del heatmap
      }
    }, 100);
  }

  private handleFullscreenChange(): void {
    this.isFullScreen = !!document.fullscreenElement;

    // EN LLOC D'EMETRE, AVISEM AL SERVEI
    this.wrappedService.setFullscreenState(this.isFullScreen);

    this.updateMapSize();
  }
}
