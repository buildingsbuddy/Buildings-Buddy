import React, { useState } from 'react';
import { Thermometer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateInsulation } from '@/lib/calculatorEngine';

export default function InsulationCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    area_type: 'wall',
    insType: 'mineral_wool',
  });

  const handleCalculate = () => {
    if (!inputs.length || !inputs.width) return null;

    const length = parseFloat(inputs.length);
    const width = parseFloat(inputs.width);

    if (Number.isNaN(length) || Number.isNaN(width)) {
      return null;
    }

    return calculateInsulation({
      length,
      width,
      areaType: inputs.area_type,
      insType: inputs.insType,
    });
  };

  return (
    <CalculatorWrapper
      title="Insulation Calculator"
      icon={Thermometer}
      calcType="insulation"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="insulation-length">Length / Run (m)</Label>
          <Input
            id="insulation-length"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 8.0"
            value={inputs.length}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, length: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insulation-width">Width / Height (m)</Label>
          <Input
            id="insulation-width"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 2.4"
            value={inputs.width}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, width: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Application</Label>
          <Select
            value={inputs.area_type}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, area_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select application" />
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
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, insType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select insulation type" />
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