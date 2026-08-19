import type { CSSProperties, ReactElement } from "react";

// Mesmos traços de public/brand/arvo-simbolo-*.svg — símbolo do Arvo (viewBox 0 0 100 100).
const SYMBOL_RECTS = [
  { x: 23.5, y: 5.5, width: 53, height: 9, rx: 4.5 },
  { x: 10.3, y: 18.5, width: 79.4, height: 9, rx: 4.5 },
  { x: 4.1, y: 31.5, width: 91.8, height: 9, rx: 4.5 },
  { x: 2, y: 45.5, width: 36, height: 9, rx: 4.5 },
  { x: 62, y: 45.5, width: 36, height: 9, rx: 4.5 },
  { x: 4.1, y: 58.5, width: 91.8, height: 9, rx: 4.5 },
  { x: 10.3, y: 71.5, width: 79.4, height: 9, rx: 4.5 },
  { x: 23.5, y: 84.5, width: 53, height: 9, rx: 4.5 },
];

/**
 * Ícone do Arvo pra ImageResponse (next/og): fundo terracota sólido + símbolo
 * off-white, no estilo dos ícones de apps (contraste com o preview do sistema,
 * sem depender de fundo transparente). `padding` é a folga entre o símbolo e
 * a borda do canvas — ícones maskable (Android) precisam de mais folga porque
 * o SO recorta o próprio formato por cima.
 */
export function ArvoAppIcon({
  size,
  padding,
}: {
  size: number;
  padding: number;
}): ReactElement {
  const innerSize = size - padding * 2;
  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#C4501C",
  };

  return (
    <div style={containerStyle}>
      <svg
        width={innerSize}
        height={innerSize}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#FAF6EF">
          {SYMBOL_RECTS.map((rect) => (
            <rect key={`${rect.x}-${rect.y}`} {...rect} />
          ))}
        </g>
      </svg>
    </div>
  );
}
