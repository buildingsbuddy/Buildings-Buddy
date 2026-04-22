import React, { useState } from 'react';
import { Brush } from 'lucide-react';
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
import { calculatePainting } from '@/lib/calculatorEngine';

export default function PaintingCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    height: '',
    coats: '2',
    surface: 'plaster',
    paintType: 'emulsion',
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

    return calculatePainting({
      length,
      height,
      coats,
      surface: inputs.surface,
      paintType: inputs.paintType,
    });
  };

  return (
    <CalculatorWrapper
      title="Painting & Decorating Calculator"
      icon={Brush}
      calcType="painting"
      onCalculate={handleCalculate}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="painting-length">Wall / Ceiling Length (m)</Label>
          <Input
            id="painting-length"
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
          <Label htmlFor="painting-height">Height / Width (m)</Label>
          <Input
            id="painting-height"
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
          <Label>Surface Type</Label>
          <Select
            value={inputs.surface}
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, surface: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select surface type" />
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
            onValueChange={(value) =>
              setInputs((prev) => ({ ...prev, paintType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select paint type" />
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
              <SelectItem value="3">3 Coats (new plaster / dark colour)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CalculatorWrapper>
  );
}