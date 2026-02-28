"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

const CustomCursor = ({ points, stroke, seriesColors }) => {
  if (!points || !points.length) return null;

  const { x } = points[0];

  const color = seriesColors?.[0] ?? stroke ?? "#000000";

  return (
    <line
      x1={x}
      y1={0}
      x2={x}
      y2="88%"
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray="3 3"
    />
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-sm"
    >
      <p className="mb-2 font-medium text-slate-700">{label}</p>

      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


export const DashboardDiagram = React.memo(function DashboardDiagram({ title, description, data, series }) {
  const seriesToUse = series ?? [{ key: "value", color: "#4f46e5", label: "Value" }];

  const chartMargin = { top: 10, right: 20, left: 0, bottom: 0 };

  return (
    <Card className="border-transparent shadow-none rounded-2xl">
      <CardHeader className="border-transparent">
        {title && (
          <CardTitle className="text-slate-700 font-semibold">{title}</CardTitle>
        )}
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </CardHeader>
      <CardContent className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={chartMargin}>
            <defs>
              {seriesToUse.map((s, idx) => (
                <linearGradient key={s.key} id={`gradient-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="2 2" stroke="#c4c4c495" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
            <YAxis width={20} interval={0} tick={{ fontSize: 8, fill: "#6b7280" }} />
            <Tooltip content={<CustomTooltip />} cursor={<CustomCursor seriesColors={seriesToUse.map(s => s.color)} />} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#0f5fff" }} />
            {seriesToUse.map((s, idx) => (
              <Area
                key={s.key}
                type="linear"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={1.5}
                fill={`url(#gradient-${s.key}-${idx})`}
                fillOpacity={1}
                dot={false}
                name={s.label || s.key}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
})
