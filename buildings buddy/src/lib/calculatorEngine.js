// Construction calculation formulas — Buildings Buddy

// ─── WALL CONSTRUCTION ───────────────────────────────────────────────────────
export function calculateWallConstruction({ length, height, materialType, thickness, bond }) {
  const area = length * height;
  const skins = thickness === 'cavity' ? 2 : thickness === 'solid' ? 2 : 1;
  const effectiveArea = area * skins;

  // Units per m² by material
  const unitsPerSqm = {
    block_standard: 10,
    block_large: 7.2,
    block_dense: 10,
    brick_standard: 60,      // stretcher bond; English/Flemish ~120
    brick_engineering: 60,
    brick_facing: bond === 'Header Bond' ? 120 : bond === 'English Bond' ? 90 : 60,
    stone_random_rubble: null,
    stone_coursed: null,
    stone_dry: null,
  };

  const isStone = materialType.startsWith('stone');
  const isBrick = materialType.startsWith('brick');
  const isBlock = materialType.startsWith('block');

  const results = [
    { material: 'Wall Face Area', quantity: +area.toFixed(2), unit: 'm²', notes: `${length}m × ${height}m` },
  ];

  if (thickness === 'cavity') {
    results.push({ material: 'Cavity Wall Insulation', quantity: +area.toFixed(2), unit: 'm²', notes: '65–100mm cavity fill required (Part L)' });
    results.push({ material: 'Wall Ties (stainless steel)', quantity: Math.ceil(area * 2.5), unit: 'pcs', notes: '2.5 per m² — BS EN 845-1' });
  }

  if (isBlock) {
    const blocks = Math.ceil(effectiveArea * unitsPerSqm[materialType] * 1.05);
    results.push({ material: `Concrete Blocks (${materialType === 'block_standard' ? '440×215×100mm' : materialType === 'block_large' ? '440×215×140mm' : '440×215×100mm 7.3N'})`, quantity: blocks, unit: 'pcs', notes: 'Includes 5% cutting waste' });
    results.push({ material: 'Mortar — Cement (25kg bags)', quantity: Math.ceil(effectiveArea * 0.5), unit: 'bags', notes: '1:4 mix, approx 0.5 bag/m²' });
    results.push({ material: 'Mortar — Building Sand', quantity: +(effectiveArea * 0.05).toFixed(2), unit: 'tonnes', notes: '~50kg per m²' });
  }

  if (isBrick) {
    const bpu = unitsPerSqm[materialType];
    const bricks = Math.ceil(effectiveArea * bpu * 1.05);
    results.push({ material: `Bricks (${bond || 'Stretcher Bond'})`, quantity: bricks, unit: 'pcs', notes: `5% waste. Bond: ${bond || 'Stretcher'}` });
    results.push({ material: 'Mortar — Cement (25kg bags)', quantity: Math.ceil(effectiveArea * 0.7), unit: 'bags', notes: '1:3 mix for brickwork' });
    results.push({ material: 'Mortar — Building Sand', quantity: +(effectiveArea * 0.06).toFixed(2), unit: 'tonnes', notes: '~60kg per m²' });
    results.push({ material: 'Plasticiser (1L bottles)', quantity: Math.ceil(effectiveArea / 30), unit: 'bottles', notes: '1 bottle per 30 m²' });
  }

  if (isStone) {
    if (materialType === 'stone_dry') {
      results.push({ material: 'Stone (dry walling)', quantity: +(area * 0.3 * 1900).toFixed(0) / 1000, unit: 'tonnes', notes: '~300mm average thickness, 1900kg/m³' });
      results.push({ material: 'Pinning / Hearting Stone', quantity: Math.ceil(area * 0.2), unit: 'm²', notes: 'Small infill stones, approx 20% of face area' });
    } else {
      const mortarTonnes = +(effectiveArea * 0.08).toFixed(2);
      results.push({ material: `Walling Stone (${materialType === 'stone_coursed' ? 'coursed ashlar' : 'random rubble'})`, quantity: +(area * 0.25 * 2300 / 1000).toFixed(1), unit: 'tonnes', notes: '250mm wall, ~2300kg/m³. Order extra for quoins.' });
      results.push({ material: 'Mortar — Cement (25kg bags)', quantity: Math.ceil(effectiveArea * 0.9), unit: 'bags', notes: '1:2.5 lime-cement-sand mix' });
      results.push({ material: 'Hydraulic Lime (25kg bags)', quantity: Math.ceil(effectiveArea * 0.5), unit: 'bags', notes: 'NHL 3.5 recommended for stone' });
      results.push({ material: 'Sharp Sand', quantity: mortarTonnes, unit: 'tonnes', notes: 'For mortar bed' });
    }
  }

  results.push(
    { material: 'DPC Membrane (100mm wide)', quantity: +(length * 1.1).toFixed(1), unit: 'm', notes: '10% lap allowance — at base of wall' },
  );

  if (thickness === 'cavity') {
    results.push({ material: 'Cavity Trays (at openings)', quantity: Math.ceil(length / 0.6), unit: 'pcs', notes: 'Estimate — confirm at each opening/lintel' });
  }

  return results;
}

// ─── STUD WALLS ──────────────────────────────────────────────────────────────
export function calculateStudWalls({ length, height, spacing }) {
  const spacingM = spacing / 1000;
  const studs = Math.ceil(length / spacingM) + 1;
  const noggins = Math.ceil(studs * (Math.floor(height / 1.2)));
  const timberLength = +(studs * height + noggins * spacingM + length * 2).toFixed(1);
  const plasterboardSheets = Math.ceil((length * height) / 2.88 * 1.1);

  return [
    { material: `Timber Studs (${spacing}mm centres)`, quantity: studs, unit: 'pcs', notes: `CLS 38×89mm × ${height}m lengths` },
    { material: 'Noggins', quantity: noggins, unit: 'pcs', notes: 'Horizontal bracing every 1.2m' },
    { material: 'Head & Sole Plates', quantity: 2, unit: 'pcs', notes: `${length}m lengths of CLS 38×89mm` },
    { material: 'Total Timber Required', quantity: timberLength, unit: 'lin. m', notes: 'All framing combined' },
    { material: 'Plasterboard (2400×1200mm)', quantity: plasterboardSheets, unit: 'sheets', notes: 'Both sides, 10% waste' },
    { material: 'Drywall Screws', quantity: Math.ceil(plasterboardSheets * 32), unit: 'pcs', notes: '~32 per sheet at 300mm centres' },
    { material: 'Acoustic / Insulation Batts', quantity: Math.ceil(length * height), unit: 'm²', notes: 'Optional — between studs for sound/thermal' },
  ];
}

// ─── ROOFING ─────────────────────────────────────────────────────────────────
export function calculateRoofing({ length, width, pitch, materialType }) {
  const pitchRad = (pitch * Math.PI) / 180;
  const rafterLength = width / 2 / Math.cos(pitchRad);
  const roofArea = length * rafterLength * 2;
  const tilesPerSqm = materialType === 'concrete' ? 10 : materialType === 'clay' ? 15 : 1;

  const results = [
    { material: 'Roof Area (both slopes)', quantity: +roofArea.toFixed(1), unit: 'm²', notes: `${pitch}° pitch` },
    { material: 'Rafter Length', quantity: +rafterLength.toFixed(2), unit: 'm', notes: 'Per side, before overhang' },
  ];

  if (materialType === 'slate' || materialType === 'sheet') {
    results.push({ material: 'Roofing Sheets / Slates', quantity: Math.ceil(roofArea * 1.1), unit: 'm²', notes: '10% overlap allowance' });
  } else {
    results.push({ material: `${materialType === 'concrete' ? 'Concrete' : 'Clay'} Tiles`, quantity: Math.ceil(roofArea * tilesPerSqm * 1.05), unit: 'pcs', notes: '5% wastage included' });
  }

  results.push(
    { material: 'Roofing Felt / Membrane', quantity: Math.ceil(roofArea * 1.15), unit: 'm²', notes: '15% overlap' },
    { material: 'Battens (25×50mm)', quantity: Math.ceil(roofArea / 0.34 * 1.05), unit: 'lin. m', notes: '340mm gauge, 5% waste' },
    { material: 'Ridge Tiles', quantity: Math.ceil(length / 0.33), unit: 'pcs', notes: '330mm gauge' },
    { material: 'Hip / Valley Tiles', quantity: Math.ceil(rafterLength * 2 / 0.28), unit: 'pcs', notes: 'If hips/valleys present — 280mm gauge' },
  );

  return results;
}

// ─── FLOORING ────────────────────────────────────────────────────────────────
export function calculateFlooring({ length, width, materialType }) {
  const area = length * width;

  if (materialType === 'concrete_slab') {
    const concreteVol = +(area * 0.1).toFixed(2);
    return [
      { material: 'Floor Area', quantity: +area.toFixed(1), unit: 'm²', notes: '' },
      { material: 'Concrete (100mm slab)', quantity: concreteVol, unit: 'm³', notes: 'C25/30 recommended' },
      { material: 'DPM (1200 gauge polythene)', quantity: Math.ceil(area * 1.15), unit: 'm²', notes: '15% overlap' },
      { material: 'Sand Blinding (50mm)', quantity: +(area * 0.05).toFixed(2), unit: 'm³', notes: 'Under DPM' },
      { material: 'Steel Mesh (A142)', quantity: Math.ceil(area / 4.8 * 1.1), unit: 'sheets', notes: '4.8×2.4m sheets, 10% overlap' },
      { material: 'Insulation (75mm Celotex)', quantity: Math.ceil(area * 1.05), unit: 'm²', notes: '5% cutting waste' },
    ];
  }

  const joists = Math.ceil(length / 0.4) + 1;
  return [
    { material: 'Floor Area', quantity: +area.toFixed(1), unit: 'm²', notes: '' },
    { material: 'Floor Joists (400mm centres)', quantity: joists, unit: 'pcs', notes: `${width}m lengths, 47×200mm C16` },
    { material: 'Chipboard Flooring (P5 T&G)', quantity: Math.ceil(area / 2.88 * 1.05), unit: 'sheets', notes: '2400×600×22mm, 5% waste' },
    { material: 'Joist Hangers', quantity: joists * 2, unit: 'pcs', notes: 'Both ends' },
    { material: 'Noggins', quantity: Math.ceil(joists * (length / 2)), unit: 'pcs', notes: 'Mid-span blocking' },
  ];
}

// ─── PLASTERBOARD ────────────────────────────────────────────────────────────
export function calculatePlasterboard({ length, height, layers }) {
  const area = length * height;
  const sheetsPerLayer = Math.ceil(area / 2.88 * 1.1);
  const totalSheets = sheetsPerLayer * layers;

  return [
    { material: 'Wall Area', quantity: +area.toFixed(1), unit: 'm²', notes: '' },
    { material: `Plasterboard (12.5mm)`, quantity: totalSheets, unit: 'sheets', notes: `${layers} layer(s), 2400×1200mm, 10% waste` },
    { material: 'Drywall Screws (38mm)', quantity: Math.ceil(totalSheets * 32), unit: 'pcs', notes: '300mm centres' },
    { material: 'Joint Tape', quantity: Math.ceil(area * 1.5), unit: 'lin. m', notes: 'Paper or fibreglass mesh' },
    { material: 'Jointing Compound (25kg)', quantity: Math.ceil(area / 10), unit: 'bags', notes: 'For joints and skim coat' },
    { material: 'Corner Bead', quantity: Math.ceil(height * 0.5), unit: 'pcs', notes: 'External corners, 2.4m lengths' },
  ];
}

// ─── PLASTER SKIM ────────────────────────────────────────────────────────────
export function calculatePlasterSkim({ length, height, coats }) {
  const area = length * height;
  const plasterBags = Math.ceil((area * coats * 2) / 25);

  return [
    { material: 'Wall Area', quantity: +area.toFixed(1), unit: 'm²', notes: '' },
    { material: 'Multi-Finish Plaster (25kg)', quantity: plasterBags, unit: 'bags', notes: `${coats} coat(s) @ ~2kg/m² per coat` },
    { material: 'PVA Bonding Agent (5L)', quantity: Math.ceil(area / 50), unit: 'tubs', notes: 'Seal surface before skim' },
    { material: 'Clean Water', quantity: Math.ceil(plasterBags * 11.5), unit: 'litres', notes: '~11.5L per 25kg bag' },
    { material: 'Angle Bead', quantity: Math.ceil(height / 2.4 * 2), unit: 'pcs', notes: 'External corner protection' },
  ];
}

// ─── DRAINAGE ────────────────────────────────────────────────────────────────
export function calculateDrainage({ length, pipeDiameter, gradient }) {
  const pipeLengths = Math.ceil(length / 3 * 1.05);
  const bedding = +(length * 0.15 * 0.45).toFixed(2);

  return [
    { material: `Drainage Pipe (${pipeDiameter}mm)`, quantity: Math.ceil(length * 1.05), unit: 'lin. m', notes: `3m lengths, 5% waste. ${pipeDiameter}mm dia.` },
    { material: 'Pipe Couplers', quantity: pipeLengths, unit: 'pcs', notes: 'One per joint' },
    { material: 'Pea Gravel (Bedding)', quantity: bedding, unit: 'm³', notes: '150mm bed, 450mm trench' },
    { material: 'Pea Gravel (Surround)', quantity: +(bedding * 2).toFixed(2), unit: 'm³', notes: '150mm cover over pipe' },
    { material: 'Geotextile Membrane', quantity: Math.ceil(length * 1.5 * 1.1), unit: 'm²', notes: 'Wrap around gravel, 10% overlap' },
    { material: 'Inspection Chamber', quantity: Math.max(1, Math.ceil(length / 45)), unit: 'pcs', notes: 'Every 45m max per Building Regs' },
    { material: 'Fall', quantity: +(length * gradient / 100).toFixed(3), unit: 'm total', notes: `1:${Math.round(100/gradient)} gradient (${gradient}% fall)` },
  ];
}

// ─── CONCRETE MIX ────────────────────────────────────────────────────────────
const concreteMixRatios = {
  C10: { cement: 1, sand: 3, agg: 6, label: '1:3:6' },
  C20: { cement: 1, sand: 2, agg: 4, label: '1:2:4' },
  C25: { cement: 1, sand: 1.5, agg: 3, label: '1:1.5:3' },
  C30: { cement: 1, sand: 1, agg: 2, label: '1:1:2' },
  C35: { cement: 1, sand: 1, agg: 1.5, label: '1:1:1.5' },
  C40: { cement: 1, sand: 0.5, agg: 1, label: '1:0.5:1' },
};

export function calculateConcreteMix({ length, width, depth, grade }) {
  const volume = +(length * width * depth).toFixed(3);
  const mix = concreteMixRatios[grade] || concreteMixRatios['C25'];
  const totalParts = mix.cement + mix.sand + mix.agg;
  // Dry volume factor ~1.54 to account for compaction
  const dryVolume = volume * 1.54;

  const cementVol = dryVolume * (mix.cement / totalParts);
  const sandVol = dryVolume * (mix.sand / totalParts);
  const aggVol = dryVolume * (mix.agg / totalParts);

  // 1m³ cement ≈ 1440kg; 25kg bags
  const cementBags = Math.ceil((cementVol * 1440) / 25);

  return [
    { material: 'Concrete Volume Required', quantity: volume, unit: 'm³', notes: `${length}m × ${width}m × ${depth * 1000}mm thick` },
    { material: `Cement (25kg bags) — ${grade}`, quantity: cementBags, unit: 'bags', notes: `Mix ratio ${mix.label} by volume` },
    { material: 'Sharp Sand', quantity: +(sandVol * 1.7).toFixed(2), unit: 'tonnes', notes: '1700kg/m³ bulk density' },
    { material: 'Coarse Aggregate (20mm)', quantity: +(aggVol * 1.6).toFixed(2), unit: 'tonnes', notes: '1600kg/m³ bulk density' },
    { material: 'Water', quantity: Math.ceil(cementBags * 12), unit: 'litres', notes: '~12L per 25kg bag at 0.5 w/c ratio' },
    { material: 'Ready-Mix Alternative', quantity: volume, unit: 'm³', notes: `Order ${grade} ready-mix if volume > 1m³` },
  ];
}

// ─── INSULATION ──────────────────────────────────────────────────────────────
const insulationCoverage = {
  mineral_wool: { rollWidth: 0.6, rollLength: 8.33, rollArea: 5, unit: 'rolls', label: 'Mineral Wool Roll (100mm, 5.0m²)' },
  rigid_pir: { sheetArea: 2.88, unit: 'sheets', label: 'PIR Board 2400×1200mm' },
  eps: { sheetArea: 2.88, unit: 'sheets', label: 'EPS Board 2400×1200mm' },
  spray_foam: { unit: 'kit', label: 'Spray Foam Kit (covers ~15m²)' },
};

const recommendedThickness = {
  wall: { mineral_wool: 100, rigid_pir: 75, eps: 100, spray_foam: 80 },
  loft: { mineral_wool: 270, rigid_pir: 100, eps: 150, spray_foam: 100 },
  floor: { mineral_wool: 100, rigid_pir: 75, eps: 100, spray_foam: 75 },
  roof: { mineral_wool: 100, rigid_pir: 80, eps: 100, spray_foam: 75 },
};

export function calculateInsulation({ length, width, areaType, insType }) {
  const area = +(length * width).toFixed(2);
  const thickness = recommendedThickness[areaType][insType];
  const ins = insulationCoverage[insType];
  const waste = 1.1; // 10% waste

  const results = [
    { material: 'Area to Insulate', quantity: area, unit: 'm²', notes: `${length}m × ${width}m` },
    { material: 'Recommended Thickness', quantity: thickness, unit: 'mm', notes: `For ${areaType} — Part L Building Regs guidance` },
  ];

  if (insType === 'mineral_wool') {
    results.push({ material: ins.label, quantity: Math.ceil(area * waste / ins.rollArea), unit: ins.unit, notes: '10% cutting waste added' });
  } else if (insType === 'rigid_pir' || insType === 'eps') {
    results.push({ material: ins.label, quantity: Math.ceil(area * waste / ins.sheetArea), unit: ins.unit, notes: '10% cutting waste added' });
  } else {
    results.push({ material: ins.label, quantity: Math.ceil(area / 15), unit: ins.unit, notes: '~15m² coverage per kit' });
  }

  results.push(
    { material: 'Vapour Control Layer', quantity: Math.ceil(area * 1.15), unit: 'm²', notes: 'Polythene VCL — 15% overlap; warm side of insulation' },
    { material: 'Insulation Tape / Fixings', quantity: Math.ceil(area / 5), unit: 'packs', notes: 'Foil tape or mechanical fixings' },
  );

  return results;
}

// ─── STAIRCASE ───────────────────────────────────────────────────────────────
export function calculateStaircase({ totalRise, width, material }) {
  // Part K: rise 150–220mm, going 220–300mm
  const riserHeight = 0.19; // 190mm — common comfortable riser
  const going = 0.25;       // 250mm going
  const numRisers = Math.ceil(totalRise / riserHeight);
  const totalGoing = +(numRisers * going).toFixed(2);
  const stringerLength = +Math.sqrt(totalRise ** 2 + totalGoing ** 2).toFixed(2);

  const results = [
    { material: 'Number of Risers', quantity: numRisers, unit: 'steps', notes: `${Math.round(totalRise / numRisers * 1000)}mm riser height (Part K: 150–220mm)` },
    { material: 'Total Going (horizontal run)', quantity: totalGoing, unit: 'm', notes: `${going * 1000}mm per step (Part K: min 220mm)` },
    { material: 'Stringer Length', quantity: stringerLength, unit: 'm', notes: 'Diagonal length of stair string' },
  ];

  if (material === 'timber' || material === 'oak') {
    const label = material === 'oak' ? 'Solid Oak' : 'Softwood Timber';
    results.push(
      { material: `${label} Treads (${Math.round(going * 1000)}×${Math.round(width * 1000)}mm)`, quantity: numRisers - 1, unit: 'pcs', notes: '32mm thickness recommended' },
      { material: `${label} Risers`, quantity: numRisers, unit: 'pcs', notes: '18mm thickness' },
      { material: `${label} Strings (×2)`, quantity: 2, unit: 'pcs', notes: `${stringerLength}m × 300mm × 38mm` },
      { material: 'Newel Posts', quantity: 2, unit: 'pcs', notes: 'Top and bottom' },
      { material: 'Balusters / Spindles', quantity: Math.ceil((numRisers - 1) * 2), unit: 'pcs', notes: '~2 per tread, 100mm max spacing (Part K)' },
      { material: 'Handrail', quantity: +(stringerLength + 0.3).toFixed(2), unit: 'lin. m', notes: 'Both sides if width > 1m' },
    );
  } else if (material === 'steel') {
    results.push(
      { material: 'Steel Stringers (×2)', quantity: 2, unit: 'pcs', notes: `${stringerLength}m — 200×10mm flat or RHS — fabricated` },
      { material: 'Steel Treads (open riser)', quantity: numRisers - 1, unit: 'pcs', notes: 'Chequer plate or bar grating' },
      { material: 'Steel Balustrade', quantity: +(stringerLength * 2).toFixed(1), unit: 'lin. m', notes: 'Both sides inc handrail' },
    );
  } else if (material === 'concrete') {
    const concreteVol = +((totalGoing * width * totalRise / 2) * 1.2).toFixed(2);
    results.push(
      { material: 'Concrete (in-situ)', quantity: concreteVol, unit: 'm³', notes: 'C25/30, 20% added for waist and landings' },
      { material: 'Rebar (10mm)', quantity: Math.ceil(numRisers * width * 2 * 1.1), unit: 'lin. m', notes: 'Top and bottom layer, 200mm centres' },
      { material: 'Formwork (soffit)', quantity: +(totalGoing * width).toFixed(1), unit: 'm²', notes: '18mm plywood shuttering' },
    );
  }

  return results;
}

// ─── PAINTING & DECORATING ───────────────────────────────────────────────────
const spreadRates = {
  emulsion: 12,       // m² per litre per coat (smooth plaster)
  satinwood: 14,
  masonry: 5,         // rough surface
  primer: 10,
};

const primerNeeded = {
  plaster: true,
  bare_brick: true,
  wood: true,
  existing: false,
};

export function calculatePainting({ length, height, coats, surface, paintType }) {
  const area = +(length * height).toFixed(2);
  const rate = spreadRates[paintType] || 10;
  // Porous surfaces need more
  const surfaceFactor = surface === 'bare_brick' ? 0.6 : surface === 'plaster' ? 0.8 : 1;
  const effectiveRate = rate * surfaceFactor;
  const litresNeeded = +(area * coats / effectiveRate).toFixed(1);
  const fiveLitreTins = Math.ceil(litresNeeded / 5);
  const twoFiveTins = Math.ceil(litresNeeded / 2.5);

  const results = [
    { material: 'Surface Area', quantity: area, unit: 'm²', notes: `${length}m × ${height}m` },
    { material: `${paintType.charAt(0).toUpperCase() + paintType.slice(1).replace(/_/g, ' ')} — Total Volume`, quantity: litresNeeded, unit: 'litres', notes: `${coats} coat(s) @ ${effectiveRate.toFixed(1)}m²/litre` },
    { material: '5 Litre Tins', quantity: fiveLitreTins, unit: 'tins', notes: 'Most economical option' },
    { material: '2.5 Litre Tins (alternative)', quantity: twoFiveTins, unit: 'tins', notes: 'For colour matching / feature walls' },
  ];

  if (primerNeeded[surface]) {
    const primerLitres = +(area / (spreadRates.primer * surfaceFactor)).toFixed(1);
    results.push({ material: 'Primer / Mist Coat', quantity: Math.ceil(primerLitres / 5), unit: 'tins (5L)', notes: `${surface === 'plaster' ? 'Dilute emulsion 70/30 or specialist mist coat' : 'Appropriate primer for ' + surface}` });
  }

  results.push(
    { material: 'Roller Sleeves (medium pile)', quantity: Math.ceil(area / 40), unit: 'pcs', notes: 'Replace when shedding or clogged' },
    { material: 'Masking Tape (25mm)', quantity: Math.ceil((length * 2 + height * 2) / 33), unit: 'rolls', notes: '33m per roll — around perimeter' },
    { material: 'Dust Sheets', quantity: Math.ceil(area / 10), unit: 'pcs', notes: '1 sheet per ~10m² floor area' },
  );

  return results;
}