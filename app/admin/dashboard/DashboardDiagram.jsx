"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

export const AreaDiagram = React.memo(function AreaDiagram({ title, description, data, series }) {
  const seriesToUse = series ?? [{ key: "value", color: "#4f46e5", label: "Value" }];

  const chartMargin = { top: 10, right: 20, left: 0, bottom: 0 };

  const tooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "0.5rem",
    fontSize: "14px",
    color: "#45556c",
  };

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

            <CartesianGrid strokeDasharray="3 3" stroke="#c4c4c495" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 8, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={tooltipStyle}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "#6b7280" }} />
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
