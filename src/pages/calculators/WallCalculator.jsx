import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateWallConstruction } from '@/lib/calculatorEngine';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MATERIAL_OPTIONS = [
  { value: 'block_standard', label: 'Concrete Block — Standard (440×215×100mm)' },
  { value: 'block_large', label: 'Concrete Block — Large Format (440×215×140mm)' },
  { value: 'block_dense', label: 'Dense Concrete Block (7.3N/mm²)' },
  { value: 'brick_standard', label: 'Standard Brick (215×65×102.5mm)' },
  { value: 'brick_engineering', label: 'Engineering Brick (Class B)' },
  { value: 'brick_facing', label: 'Facing Brick (handmade / feature)' },
  { value: 'stone_random_rubble', label: 'Stone — Random Rubble' },
  { value: 'stone_coursed', label: 'Stone — Coursed Ashlar' },
  { value: 'stone_dry', label: 'Stone — Dry Stone Wall' },
];

const BOND_OPTIONS = {
  brick_standard: ['Stretcher Bond', 'English Bond', 'Flemish Bond'],
  brick_engineering: ['Stretcher Bond', 'English Bond'],
  brick_facing: ['Stretcher Bond', 'Flemish Bond', 'Header Bond'],
};

export default function WallCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    height: '',
    thickness: 'single',
    materialType: 'block_standard',
    bond: 'Stretcher Bond',
    ...prefillInputs,
  }));

  const showBond = inputs.materialType.startsWith('brick');

  return (
    <CalculatorWrapper
      title="Wall Construction Calculator"
      icon={Landmark}
      calcType="wall_construction"
      onCalculate={() => {
        if (!inputs.length || !inputs.height) return null;

        return calculateWallConstruction({
          length: parseFloat(inputs.length),
          height: parseFloat(inputs.height),
          materialType: inputs.materialType,
          thickness: inputs.thickness,
          bond: inputs.bond,
        });
      }}
      getSavePayload={() => ({ inputs })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wall-length">Wall Length (m)</Label>
          <Input
            id="wall-length"
            type="number"
            min="0"
            placeholder="e.g. 6.0"
            value={inputs.length}
            onChange={(e) => setInputs((p) => ({ ...p, length: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wall-height">Wall Height (m)</Label>
          <Input
            id="wall-height"
            type="number"
            min="0"
            placeholder="e.g. 2.4"
            value={inputs.height}
            onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Material Type</Label>
          <Select
            value={inputs.materialType}
            onValueChange={(v) =>
              setInputs((p) => ({
                ...p,
                materialType: v,
                bond: 'Stretcher Bond',
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material type" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_OPTIONS.filter((o) => o.value.startsWith('block')).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
              {MATERIAL_OPTIONS.filter((o) => o.value.startsWith('brick')).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
              {MATERIAL_OPTIONS.filter((o) => o.value.startsWith('stone')).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Wall Construction</Label>
          <Select
            value={inputs.thickness}
            onValueChange={(v) => setInputs((p) => ({ ...p, thickness: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select wall construction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Skin / Leaf</SelectItem>
              <SelectItem value="cavity">Cavity Wall (two leaves)</SelectItem>
              <SelectItem value="solid">Solid Double Thickness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showBond && BOND_OPTIONS[inputs.materialType] && (
          <div className="space-y-2">
            <Label>Brick Bond Pattern</Label>
            <Select
              value={inputs.bond}
              onValueChange={(v) => setInputs((p) => ({ ...p, bond: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOND_OPTIONS[inputs.materialType].map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </CalculatorWrapper>
  );
}