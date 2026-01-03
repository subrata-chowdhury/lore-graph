type Props = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  cornerSize?: number;
  paddingLeft: number;
};

const Edge = ({ from, to, cornerSize = 10, paddingLeft = 0 }: Props) => {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  if (y1 === y2) {
    return (
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(255,255,255,0.4)`} strokeWidth="2" />
    );
  }
  // Determine direction
  const horizontalDir = x2 > x1 ? 1 : -1;
  const verticalDir = y2 > y1 ? 1 : -1;

  // Horizontal end before 1st corner
  const hEndX = x1 + paddingLeft + horizontalDir * cornerSize;

  // Vertical end before 2nd corner
  const vEndY = y2 - verticalDir * cornerSize;

  // Curve 1 control and end points
  const c1x = hEndX + horizontalDir * cornerSize;
  const c1y = y1;
  const c1EndX = c1x;
  const c1EndY = y1 + verticalDir * cornerSize;

  // Curve 2 control and end points
  const c2x = c1EndX;
  const c2y = vEndY + verticalDir * cornerSize;
  const c2EndX = c2x + horizontalDir * cornerSize;
  const c2EndY = vEndY + verticalDir * cornerSize;

  const path = `
        M ${x1} ${y1}
        H ${hEndX}

        Q ${c1x} ${c1y} ${c1EndX} ${c1EndY}

        V ${vEndY}

        Q ${c2x} ${c2y} ${c2EndX} ${c2EndY}

        H ${x2}
    `;

  return <path d={path} stroke={`rgba(255,255,255,0.4)`} strokeWidth="2" fill="none" />;
};

export default Edge;
