import { Component, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';
import { WrappedService } from '../../../core/services/wrapped/wrapped.service';

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

  private wrappedService = inject(WrappedService);

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

    //DADES
    const locationData = this.wrappedService.getlocationData() ?? [];
    const maxlocationDataLiters = this.wrappedService.getMaxLocationLitres();
    const points: HeatPoint[] = locationData.map(l => ({
      lat: l.latitude, lng: l.longitude, intensity: l.total_litres / (maxlocationDataLiters || 1),
    }));

    // Centrar mapa a primera dada o a Barcelona si no hi ha dades
    if (points.length) {
      const firstPoint = points[0];
      this.map = L.map(container, {
        center: [firstPoint.lat, firstPoint.lng],
        zoom: 13
      });
    } else {
      this.map = L.map(container, {
        center: [41.3851, 2.1734],
        zoom: 13
      });
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);


    // Afegir heatmap
    const heatCoords: [number, number, number][] = points.map(p => [p.lat, p.lng, p.intensity]);
    this.heatLayer = L.heatLayer(heatCoords, {
      radius: this.getRadiusForZoom(this.map.getZoom()),
      blur: this.getBlurForZoom(this.map.getZoom()),
      maxZoom: 18,
      minOpacity: 0.6, // sempre visible
      gradient: { 0.4: 'blue', 0.45: 'lime', 0.70: 'red', 1: 'purple' }
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
