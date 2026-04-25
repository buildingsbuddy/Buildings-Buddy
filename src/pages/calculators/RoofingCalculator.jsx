import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import { calculateRoofing } from '@/lib/calculatorEngine';
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

const DEFAULT_PACK_SIZES = {
  concrete: '192',
  clay: '240',
  slate: '',
  sheet: '',
};

function isRoofOrderable(row) {
  const material = String(row.material || '').toLowerCase();

  return (
    material.includes('tiles') ||
    material.includes('slates') ||
    material.includes('sheet') ||
    material.includes('membrane') ||
    material.includes('felt') ||
    material.includes('battens')
  );
}

function isTilePackable(row) {
  const material = String(row.material || '').toLowerCase();
  const unit = String(row.unit || '').toLowerCase();

  return (
    unit.includes('pcs') &&
    (material.includes('tiles') || material.includes('slates'))
  );
}

export default function RoofingCalculator() {
  const location = useLocation();
  const prefillInputs = location.state?.prefillInputs;

  const [inputs, setInputs] = useState(() => ({
    length: '',
    width: '',
    pitch: '30',
    materialType: 'concrete',
    allowance: 'standard',
    packSize: DEFAULT_PACK_SIZES.concrete,
    ...prefillInputs,
  }));

  const showPackSize =
    inputs.materialType === 'concrete' ||
    inputs.materialType === 'clay' ||
    inputs.materialType === 'slate';

  const extraAllowancePercent = useMemo(
    () => getExtraAllowancePercent(inputs.allowance),
    [inputs.allowance]
  );

  const calculateResults = () => {
    if (!inputs.length || !inputs.width) return null;

    const baseResults = calculateRoofing({
      length: parseFloat(inputs.length),
      width: parseFloat(inputs.width),
      pitch: parseFloat(inputs.pitch),
      materialType: inputs.materialType,
    });

    let results = withExtraAllowance(
      baseResults,
      extraAllowancePercent,
      isRoofOrderable
    );

    if (showPackSize && inputs.packSize) {
      results = addUnitPackRow(results, isTilePackable, inputs.packSize);
    }

    return results;
  };

  return (
    <CalculatorWrapper
      title="Pitched Roof Calculator"
      icon={Home}
      calcType="roofing"
      onCalculate={calculateResults}
      getSavePayload={() => ({ inputs: { ...inputs, extraAllowancePercent } })}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roofing-length">Roof Length (m)</Label>
          <Input
            id="roofing-length"
            type="number"
            min="0"
            step="0.01"
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
            min="0"
            step="0.01"
            placeholder="e.g. 7.0"
            value={inputs.width}
            onChange={(e) => setInputs((p) => ({ ...p, width: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Roof Pitch (degrees)</Label>
          <Select
            value={inputs.pitch}
            onValueChange={(value) => setInputs((p) => ({ ...p, pitch: value }))}
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
            onValueChange={(value) =>
              setInputs((p) => ({
                ...p,
                materialType: value,
                packSize: DEFAULT_PACK_SIZES[value] || '',
              }))
            }
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
            <Label htmlFor="roof-pack-size">Tile / Slate Pack or Pallet Quantity</Label>
            <Input
              id="roof-pack-size"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 192"
              value={inputs.packSize}
              onChange={(e) => setInputs((p) => ({ ...p, packSize: e.target.value }))}
            />
          </div>
        )}
      </div>
    </CalculatorWrapper>
  );
}