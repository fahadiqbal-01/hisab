"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
  const {
    cx,
    cy,
    payload,
    isActive,
    tooltipPayload,
    tooltipPosition,
    xAxis,
    yAxis,
    active,
    index,
    isDark,
    ...rest
  } = props;
  const height = Math.max(40, (payload.amount / 50000) * 20);
  const width = 12;
  const touchWidth = 30;

  return (
    <g {...rest} className="group cursor-pointer">
      {/* Invisible larger touch/hover target */}
      <rect
        x={cx - touchWidth / 2}
        y={cy - height / 2}
        width={touchWidth}
        height={height}
        fill="black"
        fillOpacity={0}
      />
      {/* Visible styled rect */}
      <rect
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        fill={isDark ? "#ffffff" : "#082019"}
        rx={width / 2}
        className="transition-all duration-300 group-hover:fill-emerald-500 dark:group-hover:fill-emerald-400"
        style={{
          filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.15))",
          ...rest.style,
        }}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#111614] p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl min-w-[200px] transition-colors duration-300">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-1">
          {data.date}
        </p>
        <p className="text-base font-bold text-[#082019] dark:text-white mb-1">
          {data.client}
        </p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5 dark:border-white/5">
          <p className="text-xs font-medium text-black/60 dark:text-white/60">Amount</p>
          <p className="text-sm font-bold text-[#082019] dark:text-white">
            ৳ {data.amount.toLocaleString()}
          </p>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs font-medium text-black/60 dark:text-white/60">Status</p>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            {data.status}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function InvoiceAnalysisChart({ data }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(
        window.matchMedia("(max-width: 768px)").matches ||
        "ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)
      );
    };
    checkMobile();
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const paidOnlyData = data?.filter((item) => item.status === "paid") || [];

  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return "0";
    return `${(tickItem / 1000).toFixed(0)}K`;
  };

  return (
    <div className="w-full h-125 bg-white dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/30 mb-8 ml-2">
        Individual Paid Invoice Analysis
      </h3>

      {mounted && (
        <ResponsiveContainer
          width="100%"
          height="85%"
          minWidth={0}
          minHeight={0}
        >
          <ScatterChart margin={{ top: 20, right: 10, bottom: 20, left: -30 }}>
            <CartesianGrid
              vertical={false}
              stroke={isDark ? "#ffffff" : "#000000"}
              strokeOpacity={0.04}
            />
            <XAxis
              dataKey="date"
              axisLine={true}
              tickLine={true}
              stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
              tick={{
                fill: isDark ? "#ffffff" : "#082019",
                opacity: 0.5,
                fontSize: 10,
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
                fill: isDark ? "#ffffff" : "#082019",
                opacity: 0.5,
                fontSize: 10,
                fontWeight: "500",
              }}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              trigger={isMobile ? "click" : "hover"}
            />
            <Scatter
              name="Invoices"
              data={paidOnlyData}
              shape={<CustomPill isDark={isDark} />}
              animationDuration={1500}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

