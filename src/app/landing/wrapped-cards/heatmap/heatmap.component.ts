import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements AfterViewInit {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef<HTMLDivElement>;
  map!: L.Map;
  heatLayer!: L.HeatLayer;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 50);
  }

  initMap(): void {
    const container = this.mapContainerRef.nativeElement;

    if (!container.offsetWidth || !container.offsetHeight) {
      setTimeout(() => this.initMap(), 100);
      return;
    }

    this.map = L.map(container, {
      center: [41.3851, 2.1734],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Dades de prova amb intensitat
    const points: HeatPoint[] = [
      { lat: 41.564473, lng: 2.023137, intensity: 0.5 },
      { lat: 41.564471, lng: 2.023138, intensity: 0.5 },
      { lat: 41.628467, lng: 0.642253, intensity: 0.5 },
      { lat: 41.564426, lng: 2.023180, intensity: 0.5 },
      { lat: 41.399091, lng: 2.136474, intensity: 0.5 },
      { lat: 41.399091, lng: 2.136474, intensity: 0.5 },
      { lat: 41.375172, lng: 2.127525, intensity: 0.5 },
      { lat: 41.389261, lng: 2.136474, intensity: 0.5 },
      { lat: 41.389261, lng: 2.136474, intensity: 0.5 },
      { lat: 41.389261, lng: 2.136474, intensity: 0.5 },
      { lat: 41.563230, lng: 2.023370, intensity: 0.5 },
      { lat: 41.563230, lng: 2.023370, intensity: 0.5 },
      { lat: 41.563235, lng: 2.022057, intensity: 0.5 },
      { lat: 41.377480, lng: 2.119916, intensity: 0.5 },
      { lat: 41.114552, lng: 1.147387, intensity: 0.5 },
      { lat: 41.563054, lng: 2.023296, intensity: 0.5 },
      { lat: 41.562999, lng: 2.023308, intensity: 0.5 },
      { lat: 41.563704, lng: 2.021804, intensity: 0.5 },
      { lat: 41.563655, lng: 2.021831, intensity: 0.5 },
      { lat: 41.398663, lng: 2.194180, intensity: 0.5 },
      { lat: 41.398700, lng: 2.194183, intensity: 0.5 },
      { lat: 41.400280, lng: 2.192386, intensity: 0.5 },
      { lat: 41.406058, lng: 2.221367, intensity: 0.5 },
      { lat: 41.410363, lng: 2.226276, intensity: 0.5 },
      { lat: 41.407394, lng: 2.223186, intensity: 0.5 },
      { lat: 41.563398, lng: 2.021945, intensity: 0.5 },
      { lat: 41.546260, lng: 2.024837, intensity: 0.5 },
      { lat: 41.490176, lng: 2.029944, intensity: 0.5 },
      { lat: 41.476644, lng: 2.084394, intensity: 0.5 },
      { lat: 41.375842, lng: 2.122062, intensity: 0.5 },
      { lat: 41.401311, lng: 2.146878, intensity: 0.5 },
      { lat: 41.789061, lng: 0.804713, intensity: 0.5 },
      { lat: 41.788926, lng: 0.804747, intensity: 0.5 },
      { lat: 41.789511, lng: 0.809081, intensity: 0.5 },
      { lat: 41.789442, lng: 0.809082, intensity: 0.5 },
      { lat: 41.796016, lng: 0.525543, intensity: 0.5 },
      { lat: 41.795968, lng: 0.525591, intensity: 0.5 },
      { lat: 41.382707, lng: 2.152858, intensity: 0.5 },
      { lat: 39.945081, lng: 4.051037, intensity: 0.5 },
      { lat: 39.946752, lng: 4.050193, intensity: 0.5 },
      { lat: 41.820803, lng: 0.728634, intensity: 0.5 },
      { lat: 41.817766, lng: 0.730980, intensity: 0.5 },
      { lat: 41.400151, lng: 2.157880, intensity: 0.5 },
      { lat: 41.818305, lng: 0.727763, intensity: 0.5 },
      { lat: 41.818099, lng: 0.727643, intensity: 0.5 },
      { lat: 41.185454, lng: 0.568081, intensity: 0.5 },
      { lat: 41.618244, lng: 0.619910, intensity: 0.5 },
      { lat: 41.928758, lng: 0.800043, intensity: 0.5 },
      { lat: 41.551230, lng: 2.098045, intensity: 0.5 },
      { lat: 41.550941, lng: 2.098024, intensity: 0.5 },
      { lat: 41.544842, lng: 2.103732, intensity: 0.5 },
      { lat: 41.392538, lng: 2.136474, intensity: 0.5 },
      { lat: 41.392538, lng: 2.136474, intensity: 0.5 },
      { lat: 41.392538, lng: 2.136474, intensity: 0.5 },
      { lat: 41.392538, lng: 2.136474, intensity: 0.5 },
      { lat: 41.392538, lng: 2.136474, intensity: 0.5 },
      { lat: 41.563634, lng: 2.021984, intensity: 0.5 },
      { lat: 41.396480, lng: 2.192381, intensity: 0.5 },
      { lat: 41.397701, lng: 2.191172, intensity: 0.5 },
      { lat: 41.927970, lng: 2.253415, intensity: 0.5 },
      { lat: 41.927374, lng: 2.247444, intensity: 0.5 },
      { lat: 41.388026, lng: 2.112782, intensity: 0.5 },
      { lat: 41.893191, lng: 2.801631, intensity: 0.5 },
      { lat: 41.893023, lng: 2.802498, intensity: 0.5 },
      { lat: 41.375734, lng: 2.170260, intensity: 0.5 },
      { lat: 41.375364, lng: 2.169379, intensity: 0.5 }
    ];


    // Afegir heatmap
    const heatCoords: [number, number, number][] = points.map(p => [p.lat, p.lng, p.intensity]);
    this.heatLayer = L.heatLayer(heatCoords, {
      radius: this.getRadiusForZoom(this.map.getZoom()),
      blur: this.getBlurForZoom(this.map.getZoom()),
      maxZoom: 18,
      minOpacity: 0.6, // sempre visible
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(this.map);

    // Actualitzar radius i blur al fer zoom
    this.map.on('zoomend', () => {
      const zoom = this.map.getZoom();
      // @ts-ignore
      this.heatLayer.setOptions({
        radius: this.getRadiusForZoom(zoom),
        blur: this.getBlurForZoom(zoom)
      });
    });

    setTimeout(() => this.map.invalidateSize(), 100);
  }

  getRadiusForZoom(zoom: number): number {
    // Radius més petit a zoom alt, més gran a zoom baix
    if (zoom >= 17) return 12;
    if (zoom >= 15) return 18;
    if (zoom >= 13) return 25;
    return 35;
  }

  getBlurForZoom(zoom: number): number {
    // Blur més petit a zoom alt per definir millor el punt
    if (zoom >= 17) return 6;
    if (zoom >= 15) return 10;
    return 15;
  }

  toggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
