import * as L from 'leaflet';

declare module 'leaflet' {
  export interface HeatMapOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
    gradient?: { [key: number]: string };
    minOpacity?: number;
  }

  export interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: L.LatLngExpression[]): this;
    addLatLng(latlng: L.LatLngExpression): this;
    setOptions(options: HeatMapOptions): this;
  }

  export function heatLayer(
    latlngs: L.LatLngExpression[] | [number, number, number][],
    options?: HeatMapOptions
  ): HeatLayer;
}
