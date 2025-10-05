
import React from 'react';
import { VariationParams } from '../types';
import Card from './shared/Card';

interface VariationControlsProps {
  params: VariationParams;
  onParamChange: (newParams: VariationParams) => void;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-medium text-brand-text-secondary">{label}</label>
        <span className="text-brand-primary font-semibold text-sm">
          {value > 0 ? '+' : ''}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-brand-bg rounded-lg appearance-none cursor-pointer"
        style={{
            background: `linear-gradient(to right, #58A6FF 0%, #58A6FF ${((value - min) / (max - min)) * 100}%, #30363D ${((value - min) / (max - min)) * 100}%, #30363D 100%)`,
        }}
      />
    </div>
  );
};

const VariationControls: React.FC<VariationControlsProps> = ({ params, onParamChange }) => {
  return (
    <Card title="Variation Engine">
      <div className="space-y-6 p-2">
        <SliderControl
          label="Tempo Shift"
          value={params.tempo}
          min={-20}
          max={20}
          step={1}
          unit="%"
          onChange={(val) => onParamChange({ ...params, tempo: val })}
        />
        <SliderControl
          label="Key Shift (Semitones)"
          value={params.key}
          min={-6}
          max={6}
          step={1}
          unit=""
          onChange={(val) => onParamChange({ ...params, key: val })}
        />
        <SliderControl
          label="Energy Shift"
          value={params.energy}
          min={-25}
          max={25}
          step={1}
          unit="%"
          onChange={(val) => onParamChange({ ...params, energy: val })}
        />
      </div>
    </Card>
  );
};

export default VariationControls;
