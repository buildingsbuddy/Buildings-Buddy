import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Cylinder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateConcreteMix } from '@/lib/calculatorEngine';
import {
  ALLOWANCE_OPTIONS,
  getExtraAllowancePercent,
  withExtraAllowance,
} from '@/lib/orderEnhancements';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function isConcreteOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('concrete volume') ||
    material.includes('cement') ||
    material.includes('sharp sand') ||
    material.includes('aggregate') ||
    material.includes('ready-mix')
  );
}

export default function ConcreteCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    depth: '',
    grade: 'C20',
    allowance: 'standard',
    ...prefillInputs,
  }));

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const calculateResults = () => {
    if (!inputs.length || !inputs.width || !inputs.depth) return null;

    const baseResults = calculateConcreteMix({
      length: parseFloat(inputs.length),
      width: parseFloat(inputs.width),
      depth: parseFloat(inputs.depth) / 1000,
      grade: inputs.grade,
    });

    return withExtraAllowance(baseResults, extraAllowancePercent, isConcreteOrderable);
  };

  return (
    <CalculatorWrapper
      title="Concrete Mix Calculator"
      icon={Cylinder}
      calcType="concrete_mix"
      onCalculate={calculateResults}
      getSavePayload={() => ({ inputs: { ...inputs, extraAllowancePercent } })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="concrete-length">Length (m)</Label>
          <Input
            id="concrete-length"
            type="number"
            min="0"
            step="0.01"
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
            step="0.01"
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
            step="1"
            placeholder="e.g. 150"
            value={inputs.depth}
            onChange={(e) => setInputs((p) => ({ ...p, depth: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Concrete Grade / Use</Label>
          <Select
            value={inputs.grade}
            onValueChange={(value) => setInputs((p) => ({ ...p, grade: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="C10">C10 — Blinding / Mass fill</SelectItem>
              <SelectItem value="C20">C20 — General purpose</SelectItem>
              <SelectItem value="C25">C25 — Foundations / slabs</SelectItem>
              <SelectItem value="C30">C30 — Structural / driveways</SelectItem>
              <SelectItem value="C35">C35 — Reinforced structures</SelectItem>
              <SelectItem value="C40">C40 — High strength / precast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Extra Ordering Allowance</Label>
          <Select
            value={inputs.allowance}
            onValueChange={(value) => setInputs((p) => ({ ...p, allowance: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {ALLOWANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}