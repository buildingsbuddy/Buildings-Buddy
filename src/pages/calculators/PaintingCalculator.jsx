import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Brush } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePainting } from '@/lib/calculatorEngine';
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

function isPaintingOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('total volume') ||
    material.includes('primer') ||
    material.includes('mist coat') ||
    material.includes('roller') ||
    material.includes('masking tape') ||
    material.includes('dust sheets')
  );
}

export default function PaintingCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    height: '',
    coats: '2',
    surface: 'plaster',
    paintType: 'emulsion',
    allowance: 'standard',
    ...prefillInputs,
  }));

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const calculateResults = () => {
    if (!inputs.length || !inputs.height) return null;

    const baseResults = calculatePainting({
      length: parseFloat(inputs.length),
      height: parseFloat(inputs.height),
      coats: parseInt(inputs.coats, 10),
      surface: inputs.surface,
      paintType: inputs.paintType,
    });

    return withExtraAllowance(baseResults, extraAllowancePercent, isPaintingOrderable);
  };

  return (
    <CalculatorWrapper
      title="Painting & Decorating Calculator"
      icon={Brush}
      calcType="painting"
      onCalculate={calculateResults}
      getSavePayload={() => ({ inputs: { ...inputs, extraAllowancePercent } })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="painting-length">Wall / Ceiling Length (m)</Label>
          <Input
            id="painting-length"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="painting-height">Height / Width (m)</Label>
          <Input
            id="painting-height"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Surface Type</Label>
          <Select
            value={inputs.surface}
            onValueChange={(value) => setInputs((p) => ({ ...p, surface: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="plaster">New Plaster / Skim</SelectItem>
              <SelectItem value="existing">Previously Painted</SelectItem>
              <SelectItem value="bare_brick">Bare Brick / Block</SelectItem>
              <SelectItem value="wood">Bare Timber / MDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Paint Type</Label>
          <Select
            value={inputs.paintType}
            onValueChange={(value) => setInputs((p) => ({ ...p, paintType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="emulsion">Emulsion (walls/ceilings)</SelectItem>
              <SelectItem value="satinwood">Satinwood / Gloss (woodwork)</SelectItem>
              <SelectItem value="masonry">Masonry Paint (exterior)</SelectItem>
              <SelectItem value="primer">Primer / Undercoat</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="3">3 Coats (new plaster / dark colour)</SelectItem>
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