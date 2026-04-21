import React from 'react';
import { Landmark, Columns3, Home, Grid3X3, Square, PaintBucket, Waves, Cylinder, Thermometer, MoveUp, Brush } from 'lucide-react';
import CalculatorCard from '@/components/calculators/CalculatorCard';

const calculators = [
  {
    title: 'Wall Construction',
    description: 'Brick, block and stone walls. Includes cavity, single skin and solid construction with full mortar and DPC estimates.',
    icon: Landmark,
    path: '/calculators/wall',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Stud Walls',
    description: 'Timber studs, noggins, plates, plasterboard and fixings for partition walls.',
    icon: Columns3,
    path: '/calculators/stud-wall',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Pitched Roofing',
    description: 'Tiles, felt, battens and ridge tiles for pitched roof construction.',
    icon: Home,
    path: '/calculators/roofing',
    color: 'bg-red-100 text-red-700',
  },
  {
    title: 'Flooring',
    description: 'Concrete slab or timber suspended floor materials and quantities.',
    icon: Grid3X3,
    path: '/calculators/flooring',
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'Plasterboard',
    description: 'Boards, screws, tape and jointing compound for dry lining.',
    icon: Square,
    path: '/calculators/plasterboard',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    title: 'Plaster Skim',
    description: 'Multi-finish plaster, PVA and water quantities for skim coating.',
    icon: PaintBucket,
    path: '/calculators/plaster-skim',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    title: 'Drainage',
    description: 'Pipes, gravel bedding, membrane and inspection chambers to Building Regs.',
    icon: Waves,
    path: '/calculators/drainage',
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    title: 'Concrete Mix',
    description: 'Cement, sand and aggregate quantities for C10–C40 mixes by volume.',
    icon: Cylinder,
    path: '/calculators/concrete',
    color: 'bg-stone-100 text-stone-700',
  },
  {
    title: 'Insulation',
    description: 'Mineral wool, PIR boards or spray foam for walls, lofts, floors and roofs.',
    icon: Thermometer,
    path: '/calculators/insulation',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Staircase',
    description: 'Risers, treads, strings and balustrade for timber, oak, steel or concrete stairs.',
    icon: MoveUp,
    path: '/calculators/staircase',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    title: 'Painting & Decorating',
    description: 'Paint volume, tins, primer and sundries for walls, ceilings and woodwork.',
    icon: Brush,
    path: '/calculators/painting',
    color: 'bg-rose-100 text-rose-700',
  },
];

export default function Calculators() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Calculators</h1>
        <p className="text-muted-foreground mt-1">
          {calculators.length} professional calculators — select one to get started.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {calculators.map(c => (
          <CalculatorCard key={c.path} {...c} />
        ))}
      </div>
    </div>
  );
}