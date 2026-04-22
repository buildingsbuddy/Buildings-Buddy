import React, { useState } from 'react';
import { Waves } from 'lucide-react';
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
import { calculateDrainage } from '@/lib/calculatorEngine';

export default function DrainageCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    pipeDiameter: '110',
    gradient: '1',
  });

  const handleCalculate = () => {
    if (!inputs.length) return null;

    const length = parseFloat(inputs.length);
    const pipeDiameter = parseInt(inputs.pipeDiameter, 10);
    const gradient = parseFloat(inputs.gradient);

    if (
      Number.isNaN(length) ||
      Number.isNaN(pipeDiameter) ||
      Number.isNaN(gradient)
    ) {
      return null;
    }

    return calculateDrainage({
      length,
      pipeDiameter,
      gradient,
    });
  };

  return (
    <CalculatorWrapper
      title="Drainage Calculator"
      icon={Waves}
      calcType="drainage"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="drainage-length">Run Length (m)</Label>
          <Input
            id="drainage-length"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 15.0"
            value={inputs.length}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, length: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Pipe Diameter</Label>
          <Select
            value={inputs.pipeDiameter}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, pipeDiameter: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select pipe diameter" />
            </SelectTrigger>
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
          <Select
            value={inputs.gradient}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, gradient: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gradient" />
            </SelectTrigger>
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