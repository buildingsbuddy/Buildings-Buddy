import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePlasterboard } from '@/lib/calculatorEngine';
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

function isPlasterboardOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('plasterboard') ||
    material.includes('drywall screws') ||
    material.includes('joint tape') ||
    material.includes('jointing compound') ||
    material.includes('corner bead')
  );
}

export default function PlasterboardCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    height: '',
    layers: '1',
    allowance: 'standard',
    ...prefillInputs,
  }));

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const calculateResults = () => {
    if (!inputs.length || !inputs.height) return null;

    const baseResults = calculatePlasterboard({
      length: parseFloat(inputs.length),
      height: parseFloat(inputs.height),
      layers: parseInt(inputs.layers, 10),
    });

    return withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isPlasterboardOrderable
    );
  };

  return (
    <CalculatorWrapper
      title="Plasterboard Calculator"
      icon={Square}
      calcType="plasterboard"
      onCalculate={calculateResults}
      getSavePayload={() => ({ inputs: { ...inputs, extraAllowancePercent } })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plasterboard-length">Wall Length (m)</Label>
          <Input
            id="plasterboard-length"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plasterboard-height">Wall Height (m)</Label>
          <Input
            id="plasterboard-height"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Layers</Label>
          <Select
            value={inputs.layers}
            onValueChange={(value) => setInputs((p) => ({ ...p, layers: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="1">1 Layer</SelectItem>
              <SelectItem value="2">2 Layers (fire / sound)</SelectItem>
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