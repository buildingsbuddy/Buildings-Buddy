import React, { useState } from 'react';
import { MoveUp } from 'lucide-react';
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
import { calculateStaircase } from '@/lib/calculatorEngine';

export default function StaircaseCalculator() {
  const [inputs, setInputs] = useState({
    totalRise: '',
    width: '',
    material: 'timber',
  });

  const handleCalculate = () => {
    if (!inputs.totalRise || !inputs.width) return null;

    const totalRise = parseFloat(inputs.totalRise) / 1000; // mm -> m
    const width = parseFloat(inputs.width);

    if (Number.isNaN(totalRise) || Number.isNaN(width)) {
      return null;
    }

    return calculateStaircase({
      totalRise,
      width,
      material: inputs.material,
    });
  };

  return (
    <CalculatorWrapper
      title="Staircase Calculator"
      icon={MoveUp}
      calcType="staircase"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="staircase-rise">Total Rise — floor to floor (mm)</Label>
          <Input
            id="staircase-rise"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 2600"
            value={inputs.totalRise}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, totalRise: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staircase-width">Staircase Width (m)</Label>
          <Input
            id="staircase-width"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 0.9"
            value={inputs.width}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, width: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Material</Label>
          <Select
            value={inputs.material}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, material: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
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