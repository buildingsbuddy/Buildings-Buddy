import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PaintBucket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePlasterSkim } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PlasterSkimCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    height: '',
    coats: '2',
    ...prefillInputs,
  }));

  return (
    <CalculatorWrapper
      title="Plaster Skim Calculator"
      icon={PaintBucket}
      calcType="plaster_skim"
      onCalculate={() => {
        if (!inputs.length || !inputs.height) return null;

        return calculatePlasterSkim({
          length: parseFloat(inputs.length),
          height: parseFloat(inputs.height),
          coats: parseInt(inputs.coats),
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plaster-skim-length">Wall Length (m)</Label>
          <Input
            id="plaster-skim-length"
            type="number"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plaster-skim-height">Wall Height (m)</Label>
          <Input
            id="plaster-skim-height"
            type="number"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Coats</Label>
          <Select
            value={inputs.coats}
            onValueChange={(v) => setInputs((p) => ({ ...p, coats: v }))}
          >
            <SelectTrigger>
              <SelectValue />
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