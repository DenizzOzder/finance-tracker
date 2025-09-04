import useMedia from "../../../hooks/useMedia";
import { ResponsiveContainer, Area, AreaChart } from "recharts";

const CustomDot = ({ cx, cy, index }) => {
  if (index !== 1 && index !== 3) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      stroke="#FF868D"
      strokeWidth={1}
      fill="#563EAF"
    />
  );
};

const CustomLabel = ({ x, y, value, index }) => {
  if (index !== 1 && index !== 3) return null;
  if (typeof y !== "number" || isNaN(y)) return null;
  const num = typeof value === "number" ? value : parseFloat(value);
  return (
    <text x={x} y={y - 10} fill="#FF868D" fontSize={12} textAnchor="middle">
      {num.toFixed(2)}
    </text>
  );
};

function Chart({ data, height, showLabel }) {
  return (
    <ResponsiveContainer width="100%" minHeight={height}>
      <AreaChart
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="white" />
            <stop offset="0.374892" stopColor="white" stopOpacity="0.536458" />
            <stop offset="0.6091" stopColor="white" stopOpacity="0.269957" />
            <stop offset="0.766012" stopColor="white" stopOpacity="0.151176" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="adjusted"
          stroke="none"
          fill="url(#gradient)"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#FF868D"
          strokeWidth={1}
          fill="none"
          dot={<CustomDot />}
          label={showLabel ? <CustomLabel /> : null}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function CustomChart({ data }) {
  const { isMobile, isTablet, isDesktop } = useMedia();

  const enhancedData = data.map((d) => ({
    ...d,
    adjusted: d.value - 5,
  }));

  if (isDesktop) return <Chart data={enhancedData} height={183} showLabel={true} />;
  if (isTablet) return <Chart data={enhancedData} height={90} showLabel={true} />;
  if (isMobile) return <Chart data={enhancedData} height={80} showLabel={false} />;

  return null;
}
