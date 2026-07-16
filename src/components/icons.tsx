import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Feather-style icon paths, matching the approved design prototype exactly (viewBox 0 0 24 24).
const PATHS: Record<string, string[]> = {
  home: ['M4 11.5 12 4l8 7.5', 'M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9'],
  users: ['M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6', 'M16 8.2a3 3 0 1 1 0 .2', 'M21.5 20c-.2-2.7-1.9-4.8-4.3-5.6'],
  chart: ['M4 20V10', 'M11 20V4', 'M18 20v-7'],
  user: ['M4.5 20c0-4 3.4-7 7.5-7s7.5 3 7.5 7'],
  receipt: ['M6 2.5h12v19l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-2.5-1.5z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  camera: ['M8 7l1.6-2.5h4.8L16 7'],
  lock: ['M8 10.5V7a4 4 0 0 1 8 0v3.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['M4 12.5l5 5L20 6.5'],
  chevronright: ['M9.5 4.5L17 12l-7.5 7.5'],
  chevronleft: ['M14.5 4.5L7 12l7.5 7.5'],
  chevrondown: ['M4.5 8.5L12 16l7.5-7.5'],
  arrowin: ['M6 18L18 6', 'M9 6h9v9'],
  arrowout: ['M6 6l12 12', 'M9 18H18V9'],
  coffee: ['M5 8h13v6a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z', 'M18 9.5h1.5a2.3 2.3 0 0 1 0 4.6H18'],
  building: ['M9 7h1.2', 'M14 7h1.2', 'M9 11h1.2', 'M14 11h1.2', 'M9 15h1.2', 'M14 15h1.2', 'M10.5 21v-4h3v4'],
  zap: ['M13 2 5 13h6l-1 9 8-11h-6z'],
  truck: ['M13.5 10.5H17l3 3V16h-6.5z'],
  logout: ['M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9', 'M15 16l4-4-4-4', 'M19 12H9'],
  search: ['M20 20l-4.8-4.8'],
  trash: ['M5 7h14', 'M9 7V4.5h6V7', 'M7 7l1 13h8l1-13'],
  warntri: ['M12 4l9 15.5H3z', 'M12 10v4', 'M12 17h.01'],
  share: ['M8.6 13.5l6.8 3.9', 'M15.4 6.6l-6.8 3.9'],
  x: ['M6 6l12 12', 'M18 6l-12 12'],
  image: ['M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.1 0L4 19'],
};

const CIRCLES: Record<string, { cx: number; cy: number; r: number }[]> = {
  user: [{ cx: 12, cy: 8, r: 3.5 }],
  users: [{ cx: 9, cy: 8, r: 3.2 }],
  camera: [{ cx: 12, cy: 13.5, r: 3.5 }],
  search: [{ cx: 10.5, cy: 10.5, r: 6.5 }],
  image: [{ cx: 8.5, cy: 8.5, r: 1.5 }],
  share: [
    { cx: 6.5, cy: 12, r: 2.5 },
    { cx: 18, cy: 5, r: 2.5 },
    { cx: 18, cy: 19, r: 2.5 },
  ],
};

const RECTS: Record<string, { x: number; y: number; width: number; height: number; rx: number }[]> = {
  camera: [{ x: 3, y: 7, width: 18, height: 13, rx: 2 }],
  lock: [{ x: 5, y: 10.5, width: 14, height: 9.5, rx: 2 }],
  building: [{ x: 5, y: 3, width: 14, height: 18, rx: 1 }],
  truck: [{ x: 2.5, y: 7, width: 11, height: 9, rx: 1 }],
  image: [{ x: 3, y: 3, width: 18, height: 18, rx: 2 }],
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24, color = '#FFFFFF' }: IconProps & { name: IconName }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {(RECTS[name] ?? []).map((r, i) => (
        <Rect
          key={`rect-${i}`}
          x={r.x}
          y={r.y}
          width={r.width}
          height={r.height}
          rx={r.rx}
          stroke={color}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {(CIRCLES[name] ?? []).map((c, i) => (
        <Circle key={`circle-${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={color} strokeWidth={1.7} />
      ))}
      {PATHS[name].map((d, i) => (
        <Path key={`path-${i}`} d={d} stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

// TK monogram — the app's chosen mark (T and K sharing one stem).
export function TabKeepMark({ size = 24, color = '#FFFFFF', accentColor = '#22C55E' }: IconProps & { accentColor?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 6H15" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 6V19" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 12.4L16.6 6" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 12.4L16.6 19" stroke={accentColor} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
