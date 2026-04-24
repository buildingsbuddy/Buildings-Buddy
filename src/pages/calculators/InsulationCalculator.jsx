import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Thermometer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateInsulation } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function InsulationCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    area_type: 'wall',
    insType: 'mineral_wool',
    ...prefillInputs,
  }));

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
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="insulation-length">Length / Run (m)</Label>
          <Input
            id="insulation-length"
            type="number"
            min="0"
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
            placeholder="e.g. 2.4"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Application</Label>
          <Select
            value={inputs.area_type}
            onValueChange={(v) => setInputs((p) => ({ ...p, area_type: v }))}
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
            onValueChange={(v) => setInputs((p) => ({ ...p, insType: v }))}
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
      </div>
    </CalculatorWrapper>
  );
}