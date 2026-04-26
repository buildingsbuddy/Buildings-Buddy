import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateWallConstruction } from '@/lib/calculatorEngine';
import {
  ALLOWANCE_OPTIONS,
  getExtraAllowancePercent,
  withExtraAllowance,
  addUnitPackRow,
} from '@/lib/orderEnhancements';
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

const DEFAULT_PACK_SIZES = {
  block_standard: '72',
  block_large: '60',
  block_dense: '72',
  brick_standard: '500',
  brick_engineering: '400',
  brick_facing: '500',
};

function getDefaultInputs(prefillInputs = {}) {
  return {
    length: '',
    height: '',
    thickness: 'single',
    materialType: 'block_standard',
    bond: 'Stretcher Bond',
    allowance: 'standard',
    packSize: DEFAULT_PACK_SIZES.block_standard,
    ...prefillInputs,
  };
}

function getFreshInputs() {
  return {
    length: '',
    height: '',
    thickness: 'single',
    materialType: 'block_standard',
    bond: 'Stretcher Bond',
    allowance: 'standard',
    packSize: DEFAULT_PACK_SIZES.block_standard,
  };
}

function isPrimaryWallMaterial(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('concrete blocks') ||
    material.includes('bricks') ||
    material.includes('walling stone') ||
    material.includes('stone (dry walling)')
  );
}

function isPackableWallUnit(row) {
  const material = String(row.material || '').toLowerCase();
  const unit = String(row.unit || '').toLowerCase();

  return (
    unit.includes('pcs') &&
    (material.includes('concrete blocks') || material.includes('bricks'))
  );
}

export default function WallCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => getDefaultInputs(prefillInputs));

  const showBond = inputs.materialType.startsWith('brick');
  const showPackSize =
    inputs.materialType.startsWith('brick') || inputs.materialType.startsWith('block');

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const resetInputs = () => {
    setInputs(getFreshInputs());
  };

  const calculateResults = () => {
    if (!inputs.length || !inputs.height) return null;

    const baseResults = calculateWallConstruction({
      length: parseFloat(inputs.length),
      height: parseFloat(inputs.height),
      materialType: inputs.materialType,
      thickness: inputs.thickness,
      bond: inputs.bond,
    });

    let results = withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isPrimaryWallMaterial
    );

    if (showPackSize) {
      results = addUnitPackRow(results, isPackableWallUnit, inputs.packSize);
    }

    return results;
  };

  return (
    <CalculatorWrapper
      title="Wall Construction Calculator"
      icon={Landmark}
      calcType="wall_construction"
      onCalculate={calculateResults}
      getSavePayload={() => ({
        inputs: { ...inputs, extraAllowancePercent },
        resetInputs,
      })}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wall-length">Wall Length (m)</Label>
            <Input
              id="wall-length"
              type="number"
              min="0"
              step="0.01"
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
              step="0.01"
              placeholder="e.g. 2.4"
              value={inputs.height}
              onChange={(e) => setInputs((p) => ({ ...p, height: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Material Type</Label>
            <Select
              value={inputs.materialType}
              onValueChange={(value) =>
                setInputs((p) => ({
                  ...p,
                  materialType: value,
                  bond: 'Stretcher Bond',
                  packSize: DEFAULT_PACK_SIZES[value] || '',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wall Construction</Label>
            <Select
              value={inputs.thickness}
              onValueChange={(value) => setInputs((p) => ({ ...p, thickness: value }))}
            >
              <SelectTrigger>
                <SelectValue />
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
                onValueChange={(value) => setInputs((p) => ({ ...p, bond: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOND_OPTIONS[inputs.materialType].map((bond) => (
                    <SelectItem key={bond} value={bond}>
                      {bond}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Extra Ordering Allowance</Label>
            <Select
              value={inputs.allowance}
              onValueChange={(value) => setInputs((p) => ({ ...p, allowance: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALLOWANCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showPackSize && (
            <div className="space-y-2">
              <Label htmlFor="pack-size">Pack / Pallet Quantity</Label>
              <Input
                id="pack-size"
                type="number"
                min="1"
                step="1"
                value={inputs.packSize}
                onChange={(e) => setInputs((p) => ({ ...p, packSize: e.target.value }))}
              />
            </div>
          )}
        </div>
      </div>
    </CalculatorWrapper>
  );
}