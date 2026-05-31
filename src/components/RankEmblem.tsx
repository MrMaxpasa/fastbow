import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle, Line, Path, Polygon, G,
} from 'react-native-svg';

interface Props {
  rankId: number;
  color: string;
  size?: number;
}

export default function RankEmblem({ rankId, color, size = 64 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size;

  const emblems: Record<number, JSX.Element> = {

    1: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Line x1={cx} y1={s * 0.8} x2={cx} y2={s * 0.15} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <Polygon
          points={`${cx},${s * 0.08} ${cx - s * 0.1},${s * 0.28} ${cx + s * 0.1},${s * 0.28}`}
          fill={color}
        />
        <Line x1={cx} y1={s * 0.72} x2={cx - s * 0.12} y2={s * 0.82} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={cx} y1={s * 0.72} x2={cx + s * 0.12} y2={s * 0.82} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={cx} y1={s * 0.65} x2={cx - s * 0.1} y2={s * 0.74} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={cx} y1={s * 0.65} x2={cx + s * 0.1} y2={s * 0.74} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),

    2: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <G transform={`rotate(45, ${cx}, ${cy})`}>
          {/* Flecha vertical */}
          <G transform={`rotate(0, ${cx}, ${cy})`}>
            <Line x1={cx} y1={s*0.8} x2={cx} y2={s*0.15} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <Polygon points={`${cx},${s*0.08} ${cx-s*0.1},${s*0.28} ${cx+s*0.1},${s*0.28}`} fill={color} />
            <Line x1={cx} y1={s*0.72} x2={cx-s*0.12} y2={s*0.82} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <Line x1={cx} y1={s*0.72} x2={cx+s*0.12} y2={s*0.82} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <Line x1={cx} y1={s*0.65} x2={cx-s*0.1} y2={s*0.74} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={cx} y1={s*0.65} x2={cx+s*0.1} y2={s*0.74} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
          </G>
          {/* Misma flecha rotada 90° */}
          <G transform={`rotate(90, ${cx}, ${cy})`}>
            <Line x1={cx} y1={s*0.8} x2={cx} y2={s*0.15} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <Polygon points={`${cx},${s*0.08} ${cx-s*0.1},${s*0.28} ${cx+s*0.1},${s*0.28}`} fill={color} />
            <Line x1={cx} y1={s*0.72} x2={cx-s*0.12} y2={s*0.82} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <Line x1={cx} y1={s*0.72} x2={cx+s*0.12} y2={s*0.82} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <Line x1={cx} y1={s*0.65} x2={cx-s*0.1} y2={s*0.74} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
            <Line x1={cx} y1={s*0.65} x2={cx+s*0.1} y2={s*0.74} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
          </G>
        </G>
      </Svg>
    ),

    3: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Circle cx={cx} cy={cy} r={s*0.42} fill="none" stroke={color} strokeWidth={5} opacity={0.9} />
        <Circle cx={cx} cy={cy} r={s*0.28} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
        <Circle cx={cx} cy={cy} r={s*0.14} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
        <Circle cx={cx} cy={cy} r={s*0.05} fill={color} opacity={0.5} />
        <Line x1={cx - s*0.12} y1={cy} x2={cx + s*0.12} y2={cy} stroke={color} strokeWidth={1} opacity={0.4} />
        <Line x1={cx} y1={cy - s*0.12} x2={cx} y2={cy + s*0.12} stroke={color} strokeWidth={1} opacity={0.4} />
      </Svg>
    ),

    4: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Circle cx={cx} cy={cy} r={s*0.42} fill="none" stroke={color} strokeWidth={4} opacity={0.6} />
        <Circle cx={cx} cy={cy} r={s*0.28} fill="none" stroke={color} strokeWidth={4} opacity={0.85} />
        <Circle cx={cx} cy={cy} r={s*0.14} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
        <Circle cx={cx} cy={cy} r={s*0.05} fill={color} opacity={0.5} />
        <Line x1={cx - s*0.12} y1={cy} x2={cx + s*0.12} y2={cy} stroke={color} strokeWidth={1} opacity={0.4} />
        <Line x1={cx} y1={cy - s*0.12} x2={cx} y2={cy + s*0.12} stroke={color} strokeWidth={1} opacity={0.4} />
      </Svg>
    ),

    5: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Arco curvado — desplazado a la derecha */}
        <Path
          d={`M ${s*0.58} ${s*0.08} Q ${s*0.28} ${s*0.5} ${s*0.58} ${s*0.92}`}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* Cuerda tensa — toca las plumas en s*0.68 */}
        <Line x1={s*0.58} y1={s*0.08} x2={s*0.68} y2={s*0.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        <Line x1={s*0.58} y1={s*0.92} x2={s*0.68} y2={s*0.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        {/* Palo de la flecha — no se mueve */}
        <Line x1={s*0.18} y1={s*0.5} x2={s*0.75} y2={s*0.5} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {/* Punta */}
        <Polygon
          points={`${s*0.1},${s*0.5} ${s*0.22},${s*0.43} ${s*0.22},${s*0.57}`}
          fill={color}
        />
        {/* Plumas cerca de la cuerda */}
        <Line x1={s*0.72} y1={s*0.5} x2={s*0.8} y2={s*0.42} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={s*0.72} y1={s*0.5} x2={s*0.8} y2={s*0.58} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={s*0.66} y1={s*0.5} x2={s*0.73} y2={s*0.43} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={s*0.66} y1={s*0.5} x2={s*0.73} y2={s*0.57} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),

    6: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Diana — lado izquierdo */}
        <Circle cx={s*0.2} cy={s*0.5} r={s*0.16} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
        <Circle cx={s*0.2} cy={s*0.5} r={s*0.10} fill="none" stroke={color} strokeWidth={1.5} opacity={0.75} />
        <Circle cx={s*0.2} cy={s*0.5} r={s*0.04} fill={color} opacity={1} />
        {/* Arco curvado — lado derecho, mismo estilo que rango 5 escalado */}
        <Path
          d={`M ${s*0.72} ${s*0.18} Q ${s*0.46} ${s*0.5} ${s*0.72} ${s*0.82}`}
          fill="none"
          stroke={color}
          strokeWidth={3.5}
          strokeLinecap="round"
        />
        {/* Cuerda tensa — toca las plumas */}
        <Line x1={s*0.72} y1={s*0.18} x2={s*0.82} y2={s*0.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        <Line x1={s*0.72} y1={s*0.82} x2={s*0.82} y2={s*0.5} stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.7} />
        {/* Palo de la flecha apuntando a la izquierda hacia la diana */}
        <Line x1={s*0.36} y1={s*0.5} x2={s*0.82} y2={s*0.5} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        {/* Punta apuntando a la izquierda */}
        <Polygon
          points={`${s*0.28},${s*0.5} ${s*0.4},${s*0.43} ${s*0.4},${s*0.57}`}
          fill={color}
        />
        {/* Plumas cerca de la cuerda */}
        <Line x1={s*0.78} y1={s*0.5} x2={s*0.86} y2={s*0.42} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={s*0.78} y1={s*0.5} x2={s*0.86} y2={s*0.58} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={s*0.72} y1={s*0.5} x2={s*0.79} y2={s*0.43} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={s*0.72} y1={s*0.5} x2={s*0.79} y2={s*0.57} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),

    7: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Path
          d={`M ${s*0.18} ${s*0.32} L ${s*0.18} ${s*0.18} L ${s*0.35} ${s*0.26} L ${s*0.5} ${s*0.12} L ${s*0.65} ${s*0.26} L ${s*0.82} ${s*0.18} L ${s*0.82} ${s*0.32} Z`}
          fill={color}
          opacity={0.9}
        />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.35} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.22} fill="none" stroke={color} strokeWidth={2} opacity={0.75} />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.1} fill="none" stroke={color} strokeWidth={2.5} opacity={0.9} />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.04} fill={color} />
      </Svg>
    ),

    8: (
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        {/* Corona */}
        <Path
          d={`M ${s*0.18} ${s*0.32} L ${s*0.18} ${s*0.18} L ${s*0.35} ${s*0.26} L ${s*0.5} ${s*0.12} L ${s*0.65} ${s*0.26} L ${s*0.82} ${s*0.18} L ${s*0.82} ${s*0.32} Z`}
          fill={color}
          opacity={0.9}
        />
        {/* Diana */}
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.35} fill="none" stroke={color} strokeWidth={1.5} opacity={0.5} />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.22} fill="none" stroke={color} strokeWidth={2} opacity={0.75} />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.10} fill="none" stroke={color} strokeWidth={2.5} opacity={0.9} />
        <Circle cx={cx} cy={cy + s*0.08} r={s*0.04} fill={color} />
        {/* Palo de la flecha — extremo izquierdo en el centro exacto de la diana */}
        <Line
          x1={cx + s*0.42}
          y1={cy + s*0.08}
          x2={cx}
          y2={cy + s*0.08}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Plumas en el extremo derecho */}
        <Line x1={cx + s*0.42} y1={cy + s*0.08} x2={cx + s*0.52} y2={cy} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={cx + s*0.42} y1={cy + s*0.08} x2={cx + s*0.52} y2={cy + s*0.16} stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Line x1={cx + s*0.35} y1={cy + s*0.08} x2={cx + s*0.44} y2={cy + s*0.01} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <Line x1={cx + s*0.35} y1={cy + s*0.08} x2={cx + s*0.44} y2={cy + s*0.15} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    ),
  };

  return (
    <View style={{ width: size, height: size }}>
      {emblems[rankId] ?? emblems[1]}
    </View>
  );
}
