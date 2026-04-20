import React, { useState } from 'react';
import { Waves } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateDrainage } from '@/lib/calculatorEngine';

export default function DrainageCalculator() {
  const [inputs, setInputs] = useState({ length: '', pipeDiameter: '110', gradient: '1' });

  return (
    <CalculatorWrapper
      title="Drainage Calculator"
      icon={Waves}
      onCalculate={() => {
        if (!inputs.length) return null;
        return calculateDrainage({
          length: parseFloat(inputs.length),
          pipeDiameter: parseInt(inputs.pipeDiameter),
          gradient: parseFloat(inputs.gradient),
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Run Length (m)</Label>
          <Input type="number" placeholder="e.g. 15.0" value={inputs.length} onChange={e => setInputs(p => ({ ...p, length: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Pipe Diameter</Label>
          <Select value={inputs.pipeDiameter} onValueChange={v => setInputs(p => ({ ...p, pipeDiameter: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Select value={inputs.gradient} onValueChange={v => setInputs(p => ({ ...p, gradient: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0.83">1:120 (0.83% - min for 100mm)</SelectItem>
              <SelectItem value="1">1:100 (1% - standard)</SelectItem>
              <SelectItem value="1.25">1:80 (1.25%)</SelectItem>
              <SelectItem value="2">1:50 (2%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}