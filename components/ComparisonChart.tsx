import React, { useRef } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { Tool } from '../types';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface ComparisonChartProps {
  tools: Tool[];
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ tools }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (tools.length === 0) return (
    <div className="h-96 flex items-center justify-center bg-dark-900 rounded-none border-4 border-dashed border-dark-600 text-surface-muted font-mono uppercase tracking-widest">
        Select tools to compare specs
    </div>
  );

  // Dynamically map tool specs to chart data keys
  // Note: For simplicity in this demo, strictly handling up to 2 tools visual override, 
  // but logically extending to N tools.
  const chartData = [
    { subject: 'Ease of Use', fullMark: 100 },
    { subject: 'Power', fullMark: 100 },
    { subject: 'Community', fullMark: 100 },
    { subject: 'Cost Efficiency', fullMark: 100 },
    { subject: 'Integration', fullMark: 100 },
  ].map(dim => {
    const entry: any = { subject: dim.subject, fullMark: 100 };
    tools.forEach((tool) => {
        let val = 0;
        if(dim.subject === 'Ease of Use') val = tool.specs.easeOfUse;
        if(dim.subject === 'Power') val = tool.specs.power;
        if(dim.subject === 'Community') val = tool.specs.community;
        if(dim.subject === 'Cost Efficiency') val = tool.specs.costEfficiency;
        if(dim.subject === 'Integration') val = tool.specs.integration;
        entry[tool.id] = val;
    });
    return entry;
  });

  const colors = ['#FFD100', '#FF8C00', '#38BDF8', '#4ADE80', '#F43F5E']; // High-contrast brutalist palette

  return (
    <motion.div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="h-[400px] w-full bg-dark-900 rounded-none p-4 border-4 border-dark-600"
    >
      <div style={{ transform: "translateZ(30px)", height: "100%", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#2A2A2A" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#A48C7A', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            
            {tools.map((tool, index) => (
              <Radar
                key={tool.id}
                name={tool.name}
                dataKey={tool.id}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
            
            <Legend wrapperStyle={{ color: '#E2E2E2', fontFamily: 'monospace', fontWeight: 'bold' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0E0E0E', borderColor: '#2A2A2A', color: '#E2E2E2', borderRadius: '0px', borderWidth: '4px' }}
              itemStyle={{ color: '#E2E2E2', fontFamily: 'monospace', fontWeight: 'bold' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};