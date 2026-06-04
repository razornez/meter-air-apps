import React from 'react';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';

// Exclusive hand-drawn line icons (no emoji). Consistent 24px grid, round joints.
export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
});
const stroke = (color = '#0B2A2E', strokeWidth = 1.8) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function DropletIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 2.8C12 2.8 5 10.4 5 15a7 7 0 0 0 14 0c0-4.6-7-12.2-7-12.2z" {...stroke(color, strokeWidth)} />
      <Path d="M9 15a3 3 0 0 0 3 3" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function UsersIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="9" cy="8" r="3.2" {...stroke(color, strokeWidth)} />
      <Path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...stroke(color, strokeWidth)} />
      <Path d="M16 5.2a3 3 0 0 1 0 5.6" {...stroke(color, strokeWidth)} />
      <Path d="M17 14.2c2.2.5 3.8 2.3 3.8 4.8" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function InvoiceIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M6 3h12v16.5l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3V3z"
        {...stroke(color, strokeWidth)}
      />
      <Line x1="9" y1="8" x2="15" y2="8" {...stroke(color, strokeWidth)} />
      <Line x1="9" y1="11.5" x2="15" y2="11.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function ChartIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 20h16" {...stroke(color, strokeWidth)} />
      <Rect x="5" y="11" width="3.2" height="6" rx="1.2" {...stroke(color, strokeWidth)} />
      <Rect x="10.4" y="7" width="3.2" height="10" rx="1.2" {...stroke(color, strokeWidth)} />
      <Rect x="15.8" y="13" width="3.2" height="4" rx="1.2" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function MapPinIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 21c4-4 7-7.2 7-11a7 7 0 1 0-14 0c0 3.8 3 7 7 11z" {...stroke(color, strokeWidth)} />
      <Circle cx="12" cy="10" r="2.4" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function ScanIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 8V6a2 2 0 0 1 2-2h2" {...stroke(color, strokeWidth)} />
      <Path d="M16 4h2a2 2 0 0 1 2 2v2" {...stroke(color, strokeWidth)} />
      <Path d="M20 16v2a2 2 0 0 1-2 2h-2" {...stroke(color, strokeWidth)} />
      <Path d="M8 20H6a2 2 0 0 1-2-2v-2" {...stroke(color, strokeWidth)} />
      <Line x1="4" y1="12" x2="20" y2="12" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function AlertIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 3.5 21 19H3L12 3.5z" {...stroke(color, strokeWidth)} />
      <Line x1="12" y1="9.5" x2="12" y2="13.5" {...stroke(color, strokeWidth)} />
      <Circle cx="12" cy="16.2" r="0.6" fill={color ?? '#0B2A2E'} stroke={color ?? '#0B2A2E'} />
    </Svg>
  );
}

export function CashIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x="3" y="6" width="18" height="12" rx="2.4" {...stroke(color, strokeWidth)} />
      <Circle cx="12" cy="12" r="2.6" {...stroke(color, strokeWidth)} />
      <Line x1="6" y1="9.5" x2="6" y2="9.5" {...stroke(color, strokeWidth)} />
      <Line x1="18" y1="14.5" x2="18" y2="14.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function GridIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Rect x="4" y="4" width="6.5" height="6.5" rx="2" {...stroke(color, strokeWidth)} />
      <Rect x="13.5" y="4" width="6.5" height="6.5" rx="2" {...stroke(color, strokeWidth)} />
      <Rect x="4" y="13.5" width="6.5" height="6.5" rx="2" {...stroke(color, strokeWidth)} />
      <Rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function SyncIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" {...stroke(color, strokeWidth)} />
      <Path d="M20 4v4h-4" {...stroke(color, strokeWidth)} />
      <Path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" {...stroke(color, strokeWidth)} />
      <Path d="M4 20v-4h4" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function ListCheckIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 7l1.6 1.6L8 6" {...stroke(color, strokeWidth)} />
      <Path d="M4 16l1.6 1.6L8 15" {...stroke(color, strokeWidth)} />
      <Line x1="11" y1="7.5" x2="20" y2="7.5" {...stroke(color, strokeWidth)} />
      <Line x1="11" y1="16.5" x2="20" y2="16.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function PowerIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 5.5A7 7 0 1 0 15 5.5" {...stroke(color, strokeWidth)} />
      <Line x1="12" y1="3" x2="12" y2="11" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function SearchIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="11" cy="11" r="6.5" {...stroke(color, strokeWidth)} />
      <Line x1="16" y1="16" x2="20" y2="20" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function ChevronIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M9 6l6 6-6 6" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function ArrowLeftIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M15 5l-7 7 7 7" {...stroke(color, strokeWidth)} />
      <Path d="M8 12h12" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function CheckIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M5 12.5l4.2 4.3L19 7" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function CameraIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M4 8.5h3l1.6-2.2h6.8L17 8.5h3v10.5H4z" {...stroke(color, strokeWidth)} />
      <Circle cx="12" cy="13.5" r="3.4" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

export function SunIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="12" r="4" {...stroke(color, strokeWidth)} />
      <Path
        d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"
        {...stroke(color, strokeWidth)}
      />
    </Svg>
  );
}

export function MoonIcon({ size, color, strokeWidth }: IconProps) {
  return (
    <Svg {...base(size)}>
      <Path d="M20 13.5A8 8 0 1 1 10.5 4a6.3 6.3 0 0 0 9.5 9.5z" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

// Decorative water-drop logo mark with inner highlight (for hero/login).
export function DropMark({ size = 48, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5C12 2.5 4.5 10.5 4.5 15.3a7.5 7.5 0 0 0 15 0C19.5 10.5 12 2.5 12 2.5z"
        fill={color}
        opacity={0.95}
      />
      <Path d="M9 14.5a3.2 3.2 0 0 0 1.6 2.7" stroke="#0A4A54" strokeWidth={1.6} strokeLinecap="round" opacity={0.25} />
    </Svg>
  );
}
