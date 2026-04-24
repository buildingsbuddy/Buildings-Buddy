import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid3X3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateFlooring } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FlooringCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    materialType: 'concrete_slab',
    ...prefillInputs,
  }));

  return (
    <CalculatorWrapper
      title="Flooring Calculator"
      icon={Grid3X3}
      calcType="flooring"
      onCalculate={() => {
        if (!inputs.length || !inputs.width) return null;

        return calculateFlooring({
          length: parseFloat(inputs.length),
          width: parseFloat(inputs.width),
          materialType: inputs.materialType,
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flooring-length">Room Length (m)</Label>
          <Input
            id="flooring-length"
            type="number"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="flooring-width">Room Width (m)</Label>
          <Input
            id="flooring-width"
            type="number"
            placeholder="e.g. 4.0"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Floor Type</Label>
          <Select
            value={inputs.materialType}
            onValueChange={(v) => setInputs((p) => ({ ...p, materialType: v }))}
          >
            <SelectTrigger>
              <SelectValue />
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