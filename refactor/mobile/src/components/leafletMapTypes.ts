import { MapMarker } from './mapHtml';

export interface PickedPoint {
  lat: number;
  lng: number;
}

export interface LeafletMapProps {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom?: number;
  editable?: boolean;
  selected?: { lat: number; lng: number } | null;
  officerPos?: { lat: number; lng: number } | null;
  onPick?: (p: PickedPoint) => void;
}
