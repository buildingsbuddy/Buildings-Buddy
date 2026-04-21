import React, { useState } from 'react';
import { Thermometer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateInsulation } from '@/lib/calculatorEngine';

export default function InsulationCalculator() {
  const [inputs, setInputs] = useState({ length: '', width: '', area_type: 'wall', insType: 'mineral_wool' });

  return (
    <CalculatorWrapper
      title="Insulation Calculator"
      icon={Thermometer}
      calcType="insulation"
      onCalculate={() => {
        if (!inputs.length || !inputs.width) return null;
        return calculateInsulation({
          length: parseFloat(inputs.length),
          width: parseFloat(inputs.width),
          areaType: inputs.area_type,
          insType: inputs.insType,
        });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Length / Run (m)</Label>
          <Input type="number" min="0" placeholder="e.g. 8.0" value={inputs.length}
            onChange={e => setInputs(p => ({ ...p, length: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Width / Height (m)</Label>
          <Input type="number" min="0" placeholder="e.g. 2.4" value={inputs.width}
            onChange={e => setInputs(p => ({ ...p, width: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Application</Label>
          <Select value={inputs.area_type} onValueChange={v => setInputs(p => ({ ...p, area_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Select value={inputs.insType} onValueChange={v => setInputs(p => ({ ...p, insType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mineral_wool">Mineral Wool (rolls)</SelectItem>
              <SelectItem value="rigid_pir">Rigid PIR Board (Celotex/Kingspan)</SelectItem>
              <SelectItem value="eps">EPS (Polystyrene) Board</SelectItem>
              <SelectItem value="spray_foam">Spray Foam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}