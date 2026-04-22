import React, { useState } from 'react';
import { Columns3 } from 'lucide-react';
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
import { calculateStudWalls } from '@/lib/calculatorEngine';

export default function StudWallCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    height: '',
    spacing: '400',
  });

  const handleCalculate = () => {
    if (!inputs.length || !inputs.height) return null;

    const length = parseFloat(inputs.length);
    const height = parseFloat(inputs.height);
    const spacing = parseInt(inputs.spacing, 10);

    if (
      Number.isNaN(length) ||
      Number.isNaN(height) ||
      Number.isNaN(spacing)
    ) {
      return null;
    }

    return calculateStudWalls({
      length,
      height,
      spacing,
    });
  };

  return (
    <CalculatorWrapper
      title="Stud Wall Calculator"
      icon={Columns3}
      calcType="stud_walls"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stud-wall-length">Wall Length (m)</Label>
          <Input
            id="stud-wall-length"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 4.0"
            value={inputs.length}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, length: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stud-wall-height">Wall Height (m)</Label>
          <Input
            id="stud-wall-height"
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
          <Label>Stud Spacing</Label>
          <Select
            value={inputs.spacing}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, spacing: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select stud spacing" />
            </SelectTrigger>
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