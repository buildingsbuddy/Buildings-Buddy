import React, { useState } from 'react';
import { Cylinder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateConcreteMix } from '@/lib/calculatorEngine';

export default function ConcreteCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    depth: '',
    grade: 'C20',
  });

  const handleCalculate = () => {
    if (!inputs.length || !inputs.width || !inputs.depth) return null;

    const length = parseFloat(inputs.length);
    const width = parseFloat(inputs.width);
    const depth = parseFloat(inputs.depth) / 1000; // mm -> m

    if (Number.isNaN(length) || Number.isNaN(width) || Number.isNaN(depth)) {
      return null;
    }

    return calculateConcreteMix({
      length,
      width,
      depth,
      grade: inputs.grade,
    });
  };

  return (
    <CalculatorWrapper
      title="Concrete Mix Calculator"
      icon={Cylinder}
      calcType="concrete_mix"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="concrete-length">Length (m)</Label>
          <Input
            id="concrete-length"
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
          <Label htmlFor="concrete-width">Width (m)</Label>
          <Input
            id="concrete-width"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 3.0"
            value={inputs.width}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, width: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concrete-depth">Depth (mm)</Label>
          <Input
            id="concrete-depth"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 150"
            value={inputs.depth}
            onChange={(e) =>
              setInputs((prev) => ({ ...prev, depth: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Concrete Grade / Use</Label>
          <Select
            value={inputs.grade}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, grade: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select concrete grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="C10">C10 — Blinding / Mass fill</SelectItem>
              <SelectItem value="C20">C20 — General purpose</SelectItem>
              <SelectItem value="C25">C25 — Foundations / slabs</SelectItem>
              <SelectItem value="C30">C30 — Structural / driveways</SelectItem>
              <SelectItem value="C35">C35 — Reinforced structures</SelectItem>
              <SelectItem value="C40">C40 — High strength / precast</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}