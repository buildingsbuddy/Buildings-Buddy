import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateDrainage } from '@/lib/calculatorEngine';
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

const PEA_GRAVEL_TONNES_PER_M3 = 1.6;

function getDefaultInputs(prefillInputs = {}) {
  return {
    length: '',
    pipeDiameter: '110',
    gradient: '1',
    allowance: 'standard',
    pipeStockLength: '3',
    ...prefillInputs,
  };
}

function getFreshInputs() {
  return {
    length: '',
    pipeDiameter: '110',
    gradient: '1',
    allowance: 'standard',
    pipeStockLength: '3',
  };
}

function isDrainageOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('drainage pipe') ||
    material.includes('couplers') ||
    material.includes('pea gravel') ||
    material.includes('geotextile') ||
    material.includes('inspection chamber')
  );
}

function addPeaGravelTonnesRow(results) {
  const peaGravelRow = results.find((row) => {
    const material = String(row.material || '').toLowerCase();
    const unit = String(row.unit || '').toLowerCase();

    return material.includes('pea gravel') && unit.includes('m³');
  });

  if (!peaGravelRow) return results;

  const volumeM3 = Number(peaGravelRow.quantity);

  if (!Number.isFinite(volumeM3)) return results;

  const tonnes = volumeM3 * PEA_GRAVEL_TONNES_PER_M3;

  return [
    ...results,
    {
      material: 'Pea Gravel — Estimated Weight',
      quantity: Number(tonnes.toFixed(2)),
      unit: 'tonnes',
      notes: 'Based on approx. 1.6 tonnes per m³. Check supplier bulk density before ordering.',
    },
  ];
}

export default function DrainageCalculator() {
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
    if (!inputs.length) return null;

    const baseResults = calculateDrainage({
      length: parseFloat(inputs.length),
      pipeDiameter: parseInt(inputs.pipeDiameter, 10),
      gradient: parseFloat(inputs.gradient),
    });

    let results = withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isDrainageOrderable
    );

    results = addPeaGravelTonnesRow(results);

    results = addLengthOrderRow(
      results,
      'Drainage Pipe',
      inputs.pipeStockLength,
      'Recommended Pipe Order'
    );

    return results;
  };

  return (
    <CalculatorWrapper
      title="Drainage Calculator"
      icon={Waves}
      calcType="drainage"
      onCalculate={calculateResults}
      getSavePayload={() => ({
        inputs: { ...inputs, extraAllowancePercent },
        resetInputs,
      })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="drainage-length">Run Length (m)</Label>
          <Input
            id="drainage-length"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 15.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Pipe Diameter</Label>
          <Select
            value={inputs.pipeDiameter}
            onValueChange={(value) => setInputs((p) => ({ ...p, pipeDiameter: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="100">100mm</SelectItem>
              <SelectItem value="110">110mm (standard)</SelectItem>
              <SelectItem value="150">150mm</SelectItem>
              <SelectItem value="160">160mm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Gradient (%)</Label>
          <Select
            value={inputs.gradient}
            onValueChange={(value) => setInputs((p) => ({ ...p, gradient: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="0.83">1:120 (0.83% - min for 100mm)</SelectItem>
              <SelectItem value="1">1:100 (1% - standard)</SelectItem>
              <SelectItem value="1.25">1:80 (1.25%)</SelectItem>
              <SelectItem value="2">1:50 (2%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pipe Stock Length</Label>
          <Select
            value={inputs.pipeStockLength}
            onValueChange={(value) =>
              setInputs((p) => ({ ...p, pipeStockLength: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="3">3m lengths</SelectItem>
              <SelectItem value="6">6m lengths</SelectItem>
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