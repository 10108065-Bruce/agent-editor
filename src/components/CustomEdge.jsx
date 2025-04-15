import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  label
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const getEdgeStyle = () => {
    const baseStyle = {
      stroke: selected ? '#4299e1' : '#9ca3af', // Grey color when not selected
      strokeWidth: selected ? 3 : 2,
      strokeDasharray: '5,5', // Dashed line
      transition: 'all 0.3s ease'
    };

    // Merge with any additional styles, ensuring no undefined values
    return Object.entries(style).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, baseStyle);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={getEdgeStyle()}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          {/* 在連結線的中間顯示文字 */}
          {/* <div style={labelStyle}>{label}</div> */}
        </EdgeLabelRenderer>
      )}
    </>
  );
}
