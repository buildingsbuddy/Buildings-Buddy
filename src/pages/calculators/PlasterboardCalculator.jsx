import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePlasterboard } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PlasterboardCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    height: '',
    layers: '1',
    ...prefillInputs,
  }));

  return (
    <CalculatorWrapper
      title="Plasterboard Calculator"
      icon={Square}
      calcType="plasterboard"
      onCalculate={() => {
        if (!inputs.length || !inputs.height) return null;

        return calculatePlasterboard({
          length: parseFloat(inputs.length),
          height: parseFloat(inputs.height),
          layers: parseInt(inputs.layers),
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plasterboard-length">Wall Length (m)</Label>
          <Input
            id="plasterboard-length"
            type="number"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plasterboard-height">Wall Height (m)</Label>
          <Input
            id="plasterboard-height"
            type="number"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Layers</Label>
          <Select
            value={inputs.layers}
            onValueChange={(v) => setInputs((p) => ({ ...p, layers: v }))}
          >
            <SelectTrigger>
              <SelectValue />
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