import React, { useState } from 'react';
import { Cylinder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateConcreteMix } from '@/lib/calculatorEngine';

export default function ConcreteCalculator() {
  const [inputs, setInputs] = useState({ length: '', width: '', depth: '', grade: 'C20' });

  return (
    <CalculatorWrapper
      title="Concrete Mix Calculator"
      icon={Cylinder}
      calcType="concrete_mix"
      onCalculate={() => {
        if (!inputs.length || !inputs.width || !inputs.depth) return null;
        return calculateConcreteMix({
          length: parseFloat(inputs.length),
          width: parseFloat(inputs.width),
          depth: parseFloat(inputs.depth) / 1000, // mm → m
          grade: inputs.grade,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Length (m)</Label>
          <Input type="number" min="0" placeholder="e.g. 5.0" value={inputs.length}
            onChange={e => setInputs(p => ({ ...p, length: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Width (m)</Label>
          <Input type="number" min="0" placeholder="e.g. 3.0" value={inputs.width}
            onChange={e => setInputs(p => ({ ...p, width: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Depth (mm)</Label>
          <Input type="number" min="0" placeholder="e.g. 150" value={inputs.depth}
            onChange={e => setInputs(p => ({ ...p, depth: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Concrete Grade / Use</Label>
         <select
  className="w-full border rounded p-2"
  value={inputs.grade}
  onChange={(e) =>
    setInputs((p) => ({ ...p, grade: e.target.value }))
  }
>
  <option value="C10">C10 — Blinding / Mass fill</option>
  <option value="C20">C20 — General purpose</option>
  <option value="C25">C25 — Foundations / slabs</option>
  <option value="C30">C30 — Structural / driveways</option>
  <option value="C35">C35 — Reinforced structures</option>
  <option value="C40">C40 — High strength / precast</option>
</select>       
 </div>
      </div>
    </CalculatorWrapper>
  );
}