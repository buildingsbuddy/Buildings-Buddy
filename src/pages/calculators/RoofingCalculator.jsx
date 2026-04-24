import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateRoofing } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RoofingCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    pitch: '30',
    materialType: 'concrete',
    ...prefillInputs,
  }));

  return (
    <CalculatorWrapper
      title="Pitched Roof Calculator"
      icon={Home}
      calcType="roofing"
      onCalculate={() => {
        if (!inputs.length || !inputs.width) return null;

        return calculateRoofing({
          length: parseFloat(inputs.length),
          width: parseFloat(inputs.width),
          pitch: parseFloat(inputs.pitch),
          materialType: inputs.materialType,
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roofing-length">Roof Length (m)</Label>
          <Input
            id="roofing-length"
            type="number"
            placeholder="e.g. 10.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="roofing-width">Building Width (m)</Label>
          <Input
            id="roofing-width"
            type="number"
            placeholder="e.g. 7.0"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Roof Pitch (degrees)</Label>
          <Select
            value={inputs.pitch}
            onValueChange={(v) => setInputs((p) => ({ ...p, pitch: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15°</SelectItem>
              <SelectItem value="22.5">22.5°</SelectItem>
              <SelectItem value="30">30°</SelectItem>
              <SelectItem value="35">35°</SelectItem>
              <SelectItem value="40">40°</SelectItem>
              <SelectItem value="45">45°</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Roofing Material</Label>
          <Select
            value={inputs.materialType}
            onValueChange={(v) => setInputs((p) => ({ ...p, materialType: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concrete">Concrete Tiles</SelectItem>
              <SelectItem value="clay">Clay Tiles</SelectItem>
              <SelectItem value="slate">Slate</SelectItem>
              <SelectItem value="sheet">Metal / Sheet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}