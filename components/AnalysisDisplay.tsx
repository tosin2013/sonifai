
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnalysisResult } from '../types';
import Card from './shared/Card';

interface AnalysisDisplayProps {
  result: AnalysisResult;
}

const COLORS = ['#58A6FF', '#3FB950', '#F7B731', '#E64759', '#9750DD'];

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result }) => {
  const { title, analysis } = result;

  const renderInfoPill = (label: string, value: string | number) => (
    <div className="bg-brand-bg/50 border border-brand-border/50 rounded-full px-4 py-2 text-center">
      <div className="text-xs text-brand-text-secondary uppercase tracking-wider">{label}</div>
      <div className="text-lg font-semibold text-brand-text-primary">{value}</div>
    </div>
  );

  return (
    <Card title={`Analysis of "${title}"`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {renderInfoPill('Genre', analysis.genre)}
        {renderInfoPill('Key', `${analysis.key} ${analysis.mode}`)}
        {renderInfoPill('Tempo', `${analysis.tempo} BPM`)}
        {renderInfoPill('Energy', `${(analysis.energy * 100).toFixed(0)}%`)}
        {renderInfoPill('Mood', analysis.mood.split(',')[0])}
      </div>

      <div className="mb-6">
        <h4 className="font-semibold mb-2 text-brand-text-secondary">Chord Progression</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.chordProgression.map((chord, index) => (
            <span key={index} className="bg-brand-bg border border-brand-border text-brand-primary font-mono px-3 py-1 rounded-md text-sm">
              {chord}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 text-brand-text-secondary">Timbre Profile</h4>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={analysis.timbre} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#8B949E" tickLine={false} axisLine={false} width={80} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                contentStyle={{
                  background: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#C9D1D9' }}
              />
              <Bar dataKey="value" barSize={20} >
                 {analysis.timbre.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default AnalysisDisplay;
