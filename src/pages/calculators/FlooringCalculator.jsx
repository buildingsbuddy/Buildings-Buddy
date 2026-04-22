import React, { useState } from 'react';
import { Grid3X3 } from 'lucide-react';
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
import { calculateFlooring } from '@/lib/calculatorEngine';

export default function FlooringCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    materialType: 'concrete_slab',
  });

  const handleCalculate = () => {
    if (!inputs.length || !inputs.width) return null;

    const length = parseFloat(inputs.length);
    const width = parseFloat(inputs.width);

    if (Number.isNaN(length) || Number.isNaN(width)) {
      return null;
    }

    return calculateFlooring({
      length,
      width,
      materialType: inputs.materialType,
    });
  };

  return (
    <CalculatorWrapper
      title="Flooring Calculator"
      icon={Grid3X3}
      calcType="flooring"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flooring-length">Room Length (m)</Label>
          <Input
            id="flooring-length"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, length: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="flooring-width">Room Width (m)</Label>
          <Input
            id="flooring-width"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 4.0"
            value={inputs.width}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, width: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Floor Type</Label>
          <Select
            value={inputs.materialType}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, materialType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select floor type" />
            </SelectTrigger>
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