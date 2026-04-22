import React, { useState } from 'react';
import { Square } from 'lucide-react';
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
import { calculatePlasterboard } from '@/lib/calculatorEngine';

export default function PlasterboardCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    height: '',
    layers: '1',
  });

  const handleCalculate = () => {
    if (!inputs.length || !inputs.height) return null;

    const length = parseFloat(inputs.length);
    const height = parseFloat(inputs.height);
    const layers = parseInt(inputs.layers, 10);

    if (
      Number.isNaN(length) ||
      Number.isNaN(height) ||
      Number.isNaN(layers)
    ) {
      return null;
    }

    return calculatePlasterboard({
      length,
      height,
      layers,
    });
  };

  return (
    <CalculatorWrapper
      title="Plasterboard Calculator"
      icon={Square}
      calcType="plasterboard"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plasterboard-length">Wall Length (m)</Label>
          <Input
            id="plasterboard-length"
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
          <Label htmlFor="plasterboard-height">Wall Height (m)</Label>
          <Input
            id="plasterboard-height"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, height: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Layers</Label>
          <Select
            value={inputs.layers}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, layers: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of layers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Layer</SelectItem>
              <SelectItem value="2">2 Layers (fire / sound)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}