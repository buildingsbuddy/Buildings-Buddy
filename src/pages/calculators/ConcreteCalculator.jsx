import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Cylinder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateConcreteMix } from '@/lib/calculatorEngine';

export default function ConcreteCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    depth: '',
    grade: 'C20',
    ...prefillInputs,
  }));

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
          depth: parseFloat(inputs.depth) / 1000,
          grade: inputs.grade,
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="concrete-length">Length (m)</Label>
          <Input
            id="concrete-length"
            type="number"
            min="0"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concrete-width">Width (m)</Label>
          <Input
            id="concrete-width"
            type="number"
            min="0"
            placeholder="e.g. 3.0"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concrete-depth">Depth (mm)</Label>
          <Input
            id="concrete-depth"
            type="number"
            min="0"
            placeholder="e.g. 150"
            value={inputs.depth}
            onChange={(e) => setInputs((p) => ({ ...p, depth: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concrete-grade">Concrete Grade / Use</Label>
          <select
            id="concrete-grade"
            className="w-full border rounded p-2"
            value={inputs.grade}
            onChange={(e) => setInputs((p) => ({ ...p, grade: e.target.value }))}
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