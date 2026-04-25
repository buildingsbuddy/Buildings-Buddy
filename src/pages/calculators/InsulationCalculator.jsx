import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Thermometer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateInsulation } from '@/lib/calculatorEngine';
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

function isInsulationOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('mineral wool') ||
    material.includes('pir board') ||
    material.includes('eps board') ||
    material.includes('spray foam') ||
    material.includes('vapour control') ||
    material.includes('tape') ||
    material.includes('fixings')
  );
}

export default function InsulationCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    area_type: 'wall',
    insType: 'mineral_wool',
    allowance: 'standard',
    ...prefillInputs,
  }));

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const calculateResults = () => {
    if (!inputs.length || !inputs.width) return null;

    const baseResults = calculateInsulation({
      length: parseFloat(inputs.length),
      width: parseFloat(inputs.width),
      areaType: inputs.area_type,
      insType: inputs.insType,
    });

    return withExtraAllowance(baseResults, extraAllowancePercent, isInsulationOrderable);
  };

  return (
    <CalculatorWrapper
      title="Insulation Calculator"
      icon={Thermometer}
      calcType="insulation"
      onCalculate={calculateResults}
      getSavePayload={() => ({ inputs: { ...inputs, extraAllowancePercent } })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="insulation-length">Length / Run (m)</Label>
          <Input
            id="insulation-length"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 8.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insulation-width">Width / Height (m)</Label>
          <Input
            id="insulation-width"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 2.4"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Application</Label>
          <Select
            value={inputs.area_type}
            onValueChange={(value) => setInputs((p) => ({ ...p, area_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="wall">External / Cavity Wall</SelectItem>
              <SelectItem value="loft">Loft (between joists)</SelectItem>
              <SelectItem value="floor">Under Floor</SelectItem>
              <SelectItem value="roof">Pitched Roof (between rafters)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Insulation Type</Label>
          <Select
            value={inputs.insType}
            onValueChange={(value) => setInputs((p) => ({ ...p, insType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="mineral_wool">Mineral Wool (rolls)</SelectItem>
              <SelectItem value="rigid_pir">Rigid PIR Board (Celotex/Kingspan)</SelectItem>
              <SelectItem value="eps">EPS (Polystyrene) Board</SelectItem>
              <SelectItem value="spray_foam">Spray Foam</SelectItem>
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