import React, { useState } from 'react';
import { PaintBucket } from 'lucide-react';
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
import { calculatePlasterSkim } from '@/lib/calculatorEngine';

export default function PlasterSkimCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    height: '',
    coats: '2',
  });

  const handleCalculate = () => {
    if (!inputs.length || !inputs.height) return null;

    const length = parseFloat(inputs.length);
    const height = parseFloat(inputs.height);
    const coats = parseInt(inputs.coats, 10);

    if (
      Number.isNaN(length) ||
      Number.isNaN(height) ||
      Number.isNaN(coats)
    ) {
      return null;
    }

    return calculatePlasterSkim({
      length,
      height,
      coats,
    });
  };

  return (
    <CalculatorWrapper
      title="Plaster Skim Calculator"
      icon={PaintBucket}
      calcType="plaster_skim"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plaster-skim-length">Wall Length (m)</Label>
          <Input
            id="plaster-skim-length"
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
          <Label htmlFor="plaster-skim-height">Wall Height (m)</Label>
          <Input
            id="plaster-skim-height"
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
          <Label>Number of Coats</Label>
          <Select
            value={inputs.coats}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, coats: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of coats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Coat</SelectItem>
              <SelectItem value="2">2 Coats (standard)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}