import React, { useState } from 'react';
import { Columns3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateStudWalls } from '@/lib/calculatorEngine';

export default function StudWallCalculator() {
  const [inputs, setInputs] = useState({ length: '', height: '', spacing: '400' });

  return (
    <CalculatorWrapper
      title="Stud Wall Calculator"
      icon={Columns3}
      onCalculate={() => {
        if (!inputs.length || !inputs.height) return null;
        return calculateStudWalls({
          length: parseFloat(inputs.length),
          height: parseFloat(inputs.height),
          spacing: parseInt(inputs.spacing),
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Wall Length (m)</Label>
          <Input type="number" placeholder="e.g. 4.0" value={inputs.length} onChange={e => setInputs(p => ({ ...p, length: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Wall Height (m)</Label>
          <Input type="number" placeholder="e.g. 2.4" value={inputs.height} onChange={e => setInputs(p => ({ ...p, height: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Stud Spacing</Label>
          <Select value={inputs.spacing} onValueChange={v => setInputs(p => ({ ...p, spacing: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="400">400mm (standard)</SelectItem>
              <SelectItem value="600">600mm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}