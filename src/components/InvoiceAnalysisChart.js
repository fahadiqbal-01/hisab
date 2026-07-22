"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.isReal) return null; // Ignore dummy padding points
    return (
      <div className="bg-white dark:bg-[#111614] p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-xl min-w-[200px] transition-colors duration-300">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-1">
          {data.date}
        </p>
        <p className="text-base font-bold text-[#082019] dark:text-white mb-1 truncate max-w-[180px]">
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
            PAID
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Render solid white knobs only on real invoices
const RenderDot = (props) => {
  const { cx, cy, payload, dataKey, index, value, ...rest } = props;
  if (payload && payload.isReal) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        stroke="#10B981"
        strokeWidth={2.5}
        fill="#ffffff"
        className="cursor-pointer transition-all duration-300 hover:r-6"
        {...rest}
      />
    );
  }
  return null;
};

// Render matching hover-state active knobs
const RenderActiveDot = (props) => {
  const { cx, cy, payload, dataKey, index, value, ...rest } = props;
  if (payload && payload.isReal) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={7}
        stroke="#ffffff"
        strokeWidth={2}
        fill="#10B981"
        className="cursor-pointer"
        {...rest}
      />
    );
  }
  return null;
};

export default function InvoiceAnalysisChart({ data }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Map individual paid invoices and generate wave guides if points are few
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const paidInvoices = data.filter((item) => item.status === "paid");
    
    // Sort chronologically
    const sorted = [...paidInvoices].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (sorted.length === 0) return [];

    const counts = {};
    const realPoints = sorted.map((item) => {
      const baseLabel = `${item.client} (${item.date})`;
      counts[baseLabel] = (counts[baseLabel] || 0) + 1;
      
      const displayName = counts[baseLabel] > 1 
        ? `${item.client} (${item.date}) #${counts[baseLabel]}` 
        : baseLabel;

      return {
        ...item,
        displayName,
        isReal: true,
      };
    });

    const totalPaid = realPoints.reduce((acc, item) => acc + item.amount, 0);
    const average = totalPaid / realPoints.length;

    // Generate virtual start/end padding points to anchor the wave curves
    const startPadding = {
      displayName: " ",
      amount: average * 0.35,
      isReal: false,
    };
    
    const endPadding = {
      displayName: "  ",
      amount: average * 0.45,
      isReal: false,
    };

    // If there are exactly 2 paid invoices, insert a center dip to force a wavy equalizer look
    if (realPoints.length === 2) {
      const dipPoint = {
        displayName: "   ",
        amount: Math.min(realPoints[0].amount, realPoints[1].amount) * 0.5,
        isReal: false,
      };
      return [startPadding, realPoints[0], dipPoint, realPoints[1], endPadding];
    }

    return [startPadding, ...realPoints, endPadding];
  }, [data]);

  // Compute average of real paid invoices for the center horizontal baseline
  const averageAmount = useMemo(() => {
    const realPoints = chartData.filter(d => d.isReal);
    if (realPoints.length === 0) return 0;
    const sum = realPoints.reduce((acc, item) => acc + item.amount, 0);
    return sum / realPoints.length;
  }, [chartData]);

  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return "0";
    if (tickItem >= 1000) {
      const value = tickItem / 1000;
      return value % 1 === 0 ? `${value.toFixed(0)}K` : `${value.toFixed(1)}K`;
    }
    return tickItem.toLocaleString();
  };

  return (
    <div className="w-full h-[500px] bg-white dark:bg-white/5 rounded-[2.5rem] p-6 md:p-8 border border-black/5 dark:border-white/5 shadow-sm transition-colors duration-300">
      <div className="flex flex-col mb-8 ml-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 dark:text-white/30">
          Individual Paid Invoice Analysis
        </h3>
        <p className="text-xs text-black/50 dark:text-white/40 mt-1">
          Smooth transaction curve with details triggered on target nodes
        </p>
      </div>

      {mounted && (
        <ResponsiveContainer
          key="analysis-chart-container"
          width="100%"
          height="80%"
          minWidth={0}
          minHeight={0}
        >
          <AreaChart
            key="analysis-area-chart"
            data={chartData}
            margin={{ top: 20, right: 10, bottom: 20, left: -25 }}
          >
            <defs>
              <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            
            {/* Vertical grid lines only, matching the EQ reference screenshot */}
            <CartesianGrid
              horizontal={false}
              vertical={true}
              stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
            />
            
            <XAxis
              dataKey="displayName"
              axisLine={false}
              tickLine={false}
              stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
              tickFormatter={(value) => {
                // Ticks with space characters are virtual guides; render them blank to keep X-Axis clean
                if (value.trim() === "") return "";
                return value.split(" (")[0];
              }}
              tick={{
                fill: isDark ? "#ffffff" : "#082019",
                opacity: 0.5,
                fontSize: 10,
                fontWeight: "600",
              }}
              tickMargin={15}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              tick={{
                fill: isDark ? "#ffffff" : "#082019",
                opacity: 0.5,
                fontSize: 10,
                fontWeight: "500",
              }}
            />
            
            <Tooltip
              trigger="item"
              cursor={false}
              content={<CustomTooltip />}
            />
            
            {/* Horizontal baseline representing the average invoice amount */}
            {chartData.length > 0 && averageAmount > 0 && (
              <ReferenceLine
                y={averageAmount}
                stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}
                strokeWidth={1}
              />
            )}
            
            <Area
              key="eq-area"
              type="monotone"
              dataKey="amount"
              stroke="#10B981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorEq)"
              dot={<RenderDot />}
              activeDot={<RenderActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
