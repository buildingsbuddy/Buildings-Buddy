import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Brush } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculatePainting } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PaintingCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    height: '',
    coats: '2',
    surface: 'plaster',
    paintType: 'emulsion',
    ...prefillInputs,
  }));

  return (
    <CalculatorWrapper
      title="Painting & Decorating Calculator"
      icon={Brush}
      calcType="painting"
      onCalculate={() => {
        if (!inputs.length || !inputs.height) return null;

        return calculatePainting({
          length: parseFloat(inputs.length),
          height: parseFloat(inputs.height),
          coats: parseInt(inputs.coats),
          surface: inputs.surface,
          paintType: inputs.paintType,
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="painting-length">Wall / Ceiling Length (m)</Label>
          <Input
            id="painting-length"
            type="number"
            min="0"
            placeholder="e.g. 5.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="painting-height">Height / Width (m)</Label>
          <Input
            id="painting-height"
            type="number"
            min="0"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Surface Type</Label>
          <Select
            value={inputs.surface}
            onValueChange={(v) => setInputs((p) => ({ ...p, surface: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plaster">New Plaster / Skim</SelectItem>
              <SelectItem value="existing">Previously Painted</SelectItem>
              <SelectItem value="bare_brick">Bare Brick / Block</SelectItem>
              <SelectItem value="wood">Bare Timber / MDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Paint Type</Label>
          <Select
            value={inputs.paintType}
            onValueChange={(v) => setInputs((p) => ({ ...p, paintType: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emulsion">Emulsion (walls/ceilings)</SelectItem>
              <SelectItem value="satinwood">Satinwood / Gloss (woodwork)</SelectItem>
              <SelectItem value="masonry">Masonry Paint (exterior)</SelectItem>
              <SelectItem value="primer">Primer / Undercoat</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="3">3 Coats (new plaster / dark colour)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}