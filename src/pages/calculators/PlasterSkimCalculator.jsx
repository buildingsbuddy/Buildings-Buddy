import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PaintBucket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePlasterSkim } from '@/lib/calculatorEngine';
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
    length: '',
    height: '',
    coats: '2',
    allowance: 'standard',
    ...prefillInputs,
  };
}

function getFreshInputs() {
  return {
    length: '',
    height: '',
    coats: '2',
    allowance: 'standard',
  };
}

function isPlasterSkimOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('plaster') ||
    material.includes('pva') ||
    material.includes('angle bead')
  );
}

export default function PlasterSkimCalculator() {
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
    if (!inputs.length || !inputs.height) return null;

    const baseResults = calculatePlasterSkim({
      length: parseFloat(inputs.length),
      height: parseFloat(inputs.height),
      coats: parseInt(inputs.coats, 10),
    });

    return withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isPlasterSkimOrderable
    );
  };

  return (
    <CalculatorWrapper
      title="Plaster Skim Calculator"
      icon={PaintBucket}
      calcType="plaster_skim"
      onCalculate={calculateResults}
      getSavePayload={() => ({
        inputs: { ...inputs, extraAllowancePercent },
        resetInputs,
      })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plaster-skim-length">Wall Length (m)</Label>
          <Input
            id="plaster-skim-length"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plaster-skim-height">Wall Height (m)</Label>
          <Input
            id="plaster-skim-height"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Coats</Label>
          <Select
            value={inputs.coats}
            onValueChange={(value) => setInputs((p) => ({ ...p, coats: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="1">1 Coat</SelectItem>
              <SelectItem value="2">2 Coats (standard)</SelectItem>
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