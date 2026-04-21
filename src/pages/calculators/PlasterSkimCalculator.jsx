import React, { useState } from 'react';
import { PaintBucket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePlasterSkim } from '@/lib/calculatorEngine';

export default function PlasterSkimCalculator() {
  const [inputs, setInputs] = useState({ length: '', height: '', coats: '2' });

  return (
    <CalculatorWrapper
      title="Plaster Skim Calculator"
      icon={PaintBucket}
      onCalculate={() => {
        if (!inputs.length || !inputs.height) return null;
        return calculatePlasterSkim({
          length: parseFloat(inputs.length),
          height: parseFloat(inputs.height),
          coats: parseInt(inputs.coats),
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Wall Length (m)</Label>
          <Input type="number" placeholder="e.g. 5.0" value={inputs.length} onChange={e => setInputs(p => ({ ...p, length: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Wall Height (m)</Label>
          <Input type="number" placeholder="e.g. 2.4" value={inputs.height} onChange={e => setInputs(p => ({ ...p, height: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Number of Coats</Label>
          <Select value={inputs.coats} onValueChange={v => setInputs(p => ({ ...p, coats: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Coat</SelectItem>
              <SelectItem value="2">2 Coats (standard)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}