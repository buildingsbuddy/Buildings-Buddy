import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Columns3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateStudWalls } from '@/lib/calculatorEngine';
import {
  ALLOWANCE_OPTIONS,
  getExtraAllowancePercent,
  withExtraAllowance,
  addLengthOrderRow,
} from '@/lib/orderEnhancements';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STOCK_LENGTHS = ['2.4', '3.0', '3.6', '4.2', '4.8', '5.4', '6.0'];

function getDefaultInputs(prefillInputs = {}) {
  return {
    length: '',
    height: '',
    spacing: '400',
    allowance: 'standard',
    timberStockLength: '2.4',
    ...prefillInputs,
  };
}

function getFreshInputs() {
  return {
    length: '',
    height: '',
    spacing: '400',
    allowance: 'standard',
    timberStockLength: '2.4',
  };
}

function isStudWallOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('timber') ||
    material.includes('noggins') ||
    material.includes('head') ||
    material.includes('sole') ||
    material.includes('plasterboard') ||
    material.includes('drywall screws') ||
    material.includes('insulation')
  );
}

export default function StudWallCalculator() {
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

    const baseResults = calculateStudWalls({
      length: parseFloat(inputs.length),
      height: parseFloat(inputs.height),
      spacing: parseFloat(inputs.spacing),
    });

    let results = withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isStudWallOrderable
    );

    results = addLengthOrderRow(
      results,
      'Total Timber Required',
      inputs.timberStockLength,
      'Recommended CLS Timber Order'
    );

    return results;
  };

  return (
    <CalculatorWrapper
      title="Stud Wall Calculator"
      icon={Columns3}
      calcType="stud_walls"
      onCalculate={calculateResults}
      getSavePayload={() => ({
        inputs: { ...inputs, extraAllowancePercent },
        resetInputs,
      })}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stud-wall-length">Wall Length (m)</Label>
            <Input
              id="stud-wall-length"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 4.8"
              value={inputs.length}
              onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stud-wall-height">Wall Height (m)</Label>
            <Input
              id="stud-wall-height"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2.4"
              value={inputs.height}
              onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Stud Spacing</Label>
            <Select
              value={inputs.spacing}
              onValueChange={(value) => setInputs((p) => ({ ...p, spacing: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">400mm centres</SelectItem>
                <SelectItem value="450">450mm centres</SelectItem>
                <SelectItem value="600">600mm centres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CLS Stock Length</Label>
            <Select
              value={inputs.timberStockLength}
              onValueChange={(value) =>
                setInputs((p) => ({ ...p, timberStockLength: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOCK_LENGTHS.map((length) => (
                  <SelectItem key={length} value={length}>
                    {length}m lengths
                  </SelectItem>
                ))}
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
      </div>
    </CalculatorWrapper>
  );
}