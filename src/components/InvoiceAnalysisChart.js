"use client";
import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const CustomPill = (props) => {
  const { cx, cy, payload, onMouseEnter, onMouseLeave, onMouseMove } = props;
  const height = Math.max(40, (payload.amount / 50000) * 20);
  const width = 12;

  return (
    <rect
      x={cx - width / 2}
      y={cy - height / 2}
      width={width}
      height={height}
      fill="#ffffff"
      rx={width / 2}
      className="transition-all duration-300 hover:fill-blue-700 dark:hover:fill-[#008235] cursor-pointer"
      style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    />
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-xl min-w-50">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">
          {data.date}
        </p>
        <p className="text-lg font-bold text-[#071f18] mb-1">{data.client}</p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5">
          <p className="text-sm font-medium text-black/60">Amount</p>
          <p className="text-sm font-bold">৳ {data.amount.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm font-medium text-black/60">Status</p>
          <p className="text-xs font-bold uppercase tracking-widest text-green-500">
            {data.status}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function InvoiceAnalysisChart({ data }) {

  const paidOnlyData = data?.filter((item) => item.status === "paid") || [];

  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return "0";
    return `${(tickItem / 1000).toFixed(0)}K`;
  };

  return (
    <div className="w-full h-125 bg-[#061e18] dark:bg-[#0d0d0d] rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 dark:text-white mb-8 ml-2">
        Individual Paid Invoice Analysis
      </h3>

      <ResponsiveContainer width="100%" height="85%">
        <ScatterChart margin={{ top: 20, right: 10, bottom: 20, left: -30 }}>
          <CartesianGrid
            vertical={false}
            stroke="#000000"
            strokeOpacity={0.05}
          />
          <XAxis
            dataKey="date"
            axisLine={true}
            tickLine={true}
            tick={{
              fill: "#ffffff",
              opacity: 0.5,
              fontSize: 11,
              fontWeight: "500",
            }}
            tickMargin={15}
          />
          <YAxis
            dataKey="amount"
            axisLine={false}
            tickLine={false}
            tickFormatter={formatYAxis}
            tick={{
              fill: "#ffffff",
              opacity: 0.5,
              fontSize: 11,
              fontWeight: "500",
            }}
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Scatter
            name="Invoices"
            data={paidOnlyData}
            shape={<CustomPill />}
            animationDuration={1500}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
