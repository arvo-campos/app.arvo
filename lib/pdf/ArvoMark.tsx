import { Svg, Rect } from "@react-pdf/renderer";
import { PDF_COLORS } from "./fonts";

const BARS = [
  { x: 23.5, y: 5.5, width: 53, height: 9 },
  { x: 10.3, y: 18.5, width: 79.4, height: 9 },
  { x: 4.1, y: 31.5, width: 91.8, height: 9 },
  { x: 2, y: 45.5, width: 36, height: 9 },
  { x: 62, y: 45.5, width: 36, height: 9 },
  { x: 4.1, y: 58.5, width: 91.8, height: 9 },
  { x: 10.3, y: 71.5, width: 79.4, height: 9 },
  { x: 23.5, y: 84.5, width: 53, height: 9 },
];

export function ArvoMark({
  size = 20,
  color = PDF_COLORS.terracota,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {BARS.map((bar, i) => (
        <Rect
          key={i}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={4.5}
          fill={color}
        />
      ))}
    </Svg>
  );
}
