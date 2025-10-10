import * as L from 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    fullscreenControl?: boolean;
    fullscreenControlOptions?: any;
  }
}
