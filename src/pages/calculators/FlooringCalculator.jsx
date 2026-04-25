import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateFlooring } from '@/lib/calculatorEngine';
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

function isFlooringOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('concrete') ||
    material.includes('dpm') ||
    material.includes('sand') ||
    material.includes('mesh') ||
    material.includes('insulation') ||
    material.includes('joists') ||
    material.includes('chipboard') ||
    material.includes('hangers') ||
    material.includes('noggins')
  );
}

export default function FlooringCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    materialType: 'concrete_slab',
    allowance: 'standard',
    ...prefillInputs,
  }));

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const calculateResults = () => {
    if (!inputs.length || !inputs.width) return null;

    const baseResults = calculateFlooring({
      length: parseFloat(inputs.length),
      width: parseFloat(inputs.width),
      materialType: inputs.materialType,
    });

    return withExtraAllowance(baseResults, extraAllowancePercent, isFlooringOrderable);
  };

  return (
    <CalculatorWrapper
      title="Flooring Calculator"
      icon={Grid3X3}
      calcType="flooring"
      onCalculate={calculateResults}
      getSavePayload={() => ({ inputs: { ...inputs, extraAllowancePercent } })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flooring-length">Room Length (m)</Label>
          <Input
            id="flooring-length"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="flooring-width">Room Width (m)</Label>
          <Input
            id="flooring-width"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 4.0"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Floor Type</Label>
          <Select
            value={inputs.materialType}
            onValueChange={(value) =>
              setInputs((p) => ({ ...p, materialType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="concrete_slab">Concrete Slab</SelectItem>
              <SelectItem value="timber">Timber Suspended</SelectItem>
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