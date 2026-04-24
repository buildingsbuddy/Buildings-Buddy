import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MoveUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateStaircase } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StaircaseCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    totalRise: '',
    width: '',
    material: 'timber',
    ...prefillInputs,
  }));

  return (
    <CalculatorWrapper
      title="Staircase Calculator"
      icon={MoveUp}
      calcType="staircase"
      onCalculate={() => {
        if (!inputs.totalRise || !inputs.width) return null;

        return calculateStaircase({
          totalRise: parseFloat(inputs.totalRise) / 1000,
          width: parseFloat(inputs.width),
          material: inputs.material,
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="staircase-rise">Total Rise — floor to floor (mm)</Label>
          <Input
            id="staircase-rise"
            type="number"
            min="0"
            placeholder="e.g. 2600"
            value={inputs.totalRise}
            onChange={(e) => setInputs((p) => ({ ...p, totalRise: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staircase-width">Staircase Width (m)</Label>
          <Input
            id="staircase-width"
            type="number"
            min="0"
            placeholder="e.g. 0.9"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Material</Label>
          <Select
            value={inputs.material}
            onValueChange={(v) => setInputs((p) => ({ ...p, material: v }))}
          >
            <SelectTrigger>
              <SelectValue />
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