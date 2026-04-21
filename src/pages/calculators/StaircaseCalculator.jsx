import React, { useState } from 'react';
import { MoveUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateStaircase } from '@/lib/calculatorEngine';

export default function StaircaseCalculator() {
  const [inputs, setInputs] = useState({ totalRise: '', width: '', material: 'timber' });

  return (
    <CalculatorWrapper
      title="Staircase Calculator"
      icon={MoveUp}
      calcType="staircase"
      onCalculate={() => {
        if (!inputs.totalRise || !inputs.width) return null;
        return calculateStaircase({
          totalRise: parseFloat(inputs.totalRise) / 1000, // mm → m
          width: parseFloat(inputs.width),
          material: inputs.material,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Total Rise — floor to floor (mm)</Label>
          <Input type="number" min="0" placeholder="e.g. 2600" value={inputs.totalRise}
            onChange={e => setInputs(p => ({ ...p, totalRise: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Staircase Width (m)</Label>
          <Input type="number" min="0" placeholder="e.g. 0.9" value={inputs.width}
            onChange={e => setInputs(p => ({ ...p, width: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Material</Label>
          <Select value={inputs.material} onValueChange={v => setInputs(p => ({ ...p, material: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="timber">Softwood Timber</SelectItem>
              <SelectItem value="oak">Solid Oak</SelectItem>
              <SelectItem value="steel">Steel (open riser)</SelectItem>
              <SelectItem value="concrete">In-situ Concrete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}