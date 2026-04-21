import React, { useState } from 'react';
import { Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateFlooring } from '@/lib/calculatorEngine';

export default function FlooringCalculator() {
  const [inputs, setInputs] = useState({ length: '', width: '', materialType: 'concrete_slab' });

  return (
    <CalculatorWrapper
      title="Flooring Calculator"
      icon={Grid3X3}
      onCalculate={() => {
        if (!inputs.length || !inputs.width) return null;
        return calculateFlooring({
          length: parseFloat(inputs.length),
          width: parseFloat(inputs.width),
          materialType: inputs.materialType,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Room Length (m)</Label>
          <Input type="number" placeholder="e.g. 5.0" value={inputs.length} onChange={e => setInputs(p => ({ ...p, length: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Room Width (m)</Label>
          <Input type="number" placeholder="e.g. 4.0" value={inputs.width} onChange={e => setInputs(p => ({ ...p, width: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Floor Type</Label>
          <Select value={inputs.materialType} onValueChange={v => setInputs(p => ({ ...p, materialType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="concrete_slab">Concrete Slab</SelectItem>
              <SelectItem value="timber">Timber Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}