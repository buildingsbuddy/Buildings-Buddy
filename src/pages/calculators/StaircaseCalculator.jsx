import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MoveUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateStaircase } from '@/lib/calculatorEngine';
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

function getDefaultInputs(prefillInputs = {}) {
  return {
    totalRise: '',
    width: '',
    material: 'timber',
    allowance: 'standard',
    ...prefillInputs,
  };
}

function getFreshInputs() {
  return {
    totalRise: '',
    width: '',
    material: 'timber',
    allowance: 'standard',
  };
}

function isStaircaseOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('timber') ||
    material.includes('oak') ||
    material.includes('steel') ||
    material.includes('concrete') ||
    material.includes('rebar') ||
    material.includes('formwork') ||
    material.includes('handrail') ||
    material.includes('balusters') ||
    material.includes('newel')
  );
}

export default function StaircaseCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => getDefaultInputs(prefillInputs));

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const resetInputs = () => {
    setInputs(getFreshInputs());
  };

  const calculateResults = () => {
    if (!inputs.totalRise || !inputs.width) return null;

    const baseResults = calculateStaircase({
      totalRise: parseFloat(inputs.totalRise) / 1000,
      width: parseFloat(inputs.width),
      material: inputs.material,
    });

    return withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isStaircaseOrderable
    );
  };

  return (
    <CalculatorWrapper
      title="Staircase Calculator"
      icon={MoveUp}
      calcType="staircase"
      onCalculate={calculateResults}
      getSavePayload={() => ({
        inputs: { ...inputs, extraAllowancePercent },
        resetInputs,
      })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="staircase-rise">Total Rise — floor to floor (mm)</Label>
          <Input
            id="staircase-rise"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 2600"
            value={inputs.totalRise}
            onChange={(e) => setInputs((p) => ({ ...p, totalRise: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staircase-width">Staircase Width (m)</Label>
          <Input
            id="staircase-width"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 0.9"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Material</Label>
          <Select
            value={inputs.material}
            onValueChange={(value) => setInputs((p) => ({ ...p, material: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="timber">Softwood Timber</SelectItem>
              <SelectItem value="oak">Solid Oak</SelectItem>
              <SelectItem value="steel">Steel (open riser)</SelectItem>
              <SelectItem value="concrete">In-situ Concrete</SelectItem>
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