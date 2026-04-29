// Construction calculation formulas — Buildings Buddy
// Safe professional upgrade:
// - Keeps existing UI/layout untouched.
// - Adds pricingKey/orderable metadata for consistent pricing.
// - Keeps measurement rows unpriced.
// - Adds clearer orderable rows where calculators previously only had measurements.

// ─── HELPERS ────────────────────────────────────────────────────────────────
function measurementRow(material, quantity, unit, notes = '') {
return {
material,
quantity,
unit,
notes,
orderable: false,
rowType: 'measurement',
};
}

function materialRow(material, quantity, unit, notes = '', pricingKey = null) {
return {
material,
quantity,
unit,
notes,
orderable: true,
rowType: 'material',
pricingKey,
};
}

function helperRow(material, quantity, unit, notes = '') {
return {
material,
quantity,
unit,
notes,
orderable: false,
rowType: 'helper',
};
}

// ─── WALL CONSTRUCTION ───────────────────────────────────────────────────────
export function calculateWallConstruction({
length,
height,
materialType,
thickness,
bond,
}) {
const area = length * height;
const skins = thickness === 'cavity' ? 2 : thickness === 'solid' ? 2 : 1;
const effectiveArea = area * skins;

const unitsPerSqm = {
block_standard: 10,
block_large: 7.2,
block_dense: 10,
brick_standard: 60,
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
measurementRow(
'Wall Face Area',
+area.toFixed(2),
'm²',
`${length}m × ${height}m`
),
];

if (thickness === 'cavity') {
results.push(
materialRow(
'Cavity Wall Insulation',
+area.toFixed(2),
'm²',
'65–100mm cavity fill required (Part L)',
'insulation_m2'
),
materialRow(
'Wall Ties (stainless steel)',
Math.ceil(area * 2.5),
'pcs',
'2.5 per m² — BS EN 845-1',
'wall_tie'
)
);
}

if (isBlock) {
const blocks = Math.ceil(effectiveArea * unitsPerSqm[materialType] * 1.05);
const blockKey =
materialType === 'block_large'
? 'concrete_block_140mm'
: materialType === 'block_dense'
? 'concrete_block_dense'
: 'concrete_block';

results.push(
materialRow(
`Concrete Blocks (${
materialType === 'block_standard'
? '440×215×100mm'
: materialType === 'block_large'
? '440×215×140mm'
: '440×215×100mm 7.3N'
})`,
blocks,
'pcs',
'Includes 5% cutting waste',
blockKey
),
materialRow(
'Mortar — Cement (25kg bags)',
Math.ceil(effectiveArea * 0.5),
'bags',
'1:4 mix, approx 0.5 bag/m²',
'cement_bag_25kg'
),
materialRow(
'Mortar — Building Sand',
+(effectiveArea * 0.05).toFixed(2),
'tonnes',
'~50kg per m²',
'building_sand_tonne'
)
);
}

if (isBrick) {
const bpu = unitsPerSqm[materialType];
const bricks = Math.ceil(effectiveArea * bpu * 1.05);
const brickKey =
materialType === 'brick_engineering'
? 'brick_engineering'
: materialType === 'brick_facing'
? 'brick_facing'
: 'brick_standard';

results.push(
materialRow(
`Bricks (${bond || 'Stretcher Bond'})`,
bricks,
'pcs',
`5% waste. Bond: ${bond || 'Stretcher'}`,
brickKey
),
materialRow(
'Mortar — Cement (25kg bags)',
Math.ceil(effectiveArea * 0.7),
'bags',
'1:3 mix for brickwork',
'cement_bag_25kg'
),
materialRow(
'Mortar — Building Sand',
+(effectiveArea * 0.06).toFixed(2),
'tonnes',
'~60kg per m²',
'building_sand_tonne'
),
materialRow(
'Plasticiser (1L bottles)',
Math.ceil(effectiveArea / 30),
'bottles',
'1 bottle per 30 m²',
'plasticiser_bottle'
)
);
}

if (isStone) {
if (materialType === 'stone_dry') {
results.push(
materialRow(
'Stone (dry walling)',
+((area * 0.3 * 1900) / 1000).toFixed(2),
'tonnes',
'~300mm average thickness, 1900kg/m³',
'walling_stone_tonne'
),
materialRow(
'Pinning / Hearting Stone',
Math.ceil(area * 0.2),
'm²',
'Small infill stones, approx 20% of face area',
'walling_stone_tonne'
)
);
} else {
const mortarTonnes = +(effectiveArea * 0.08).toFixed(2);

results.push(
materialRow(
`Walling Stone (${
materialType === 'stone_coursed' ? 'coursed ashlar' : 'random rubble'
})`,
+((area * 0.25 * 2300) / 1000).toFixed(1),
'tonnes',
'250mm wall, ~2300kg/m³. Order extra for quoins.',
'walling_stone_tonne'
),
materialRow(
'Mortar — Cement (25kg bags)',
Math.ceil(effectiveArea * 0.9),
'bags',
'1:2.5 lime-cement-sand mix',
'cement_bag_25kg'
),
materialRow(
'Hydraulic Lime (25kg bags)',
Math.ceil(effectiveArea * 0.5),
'bags',
'NHL 3.5 recommended for stone',
'lime_bag_25kg'
),
materialRow(
'Sharp Sand',
mortarTonnes,
'tonnes',
'For mortar bed',
'sharp_sand_tonne'
)
);
}
}

results.push(
materialRow(
'DPC Membrane (100mm wide)',
+(length * 1.1).toFixed(1),
'm',
'10% lap allowance — at base of wall',
'dpc_membrane_m'
)
);

if (thickness === 'cavity') {
results.push(
materialRow(
'Cavity Trays (at openings)',
Math.ceil(length / 0.6),
'pcs',
'Estimate — confirm at each opening/lintel',
'cavity_tray'
)
);
}

return results;
}

// ─── STUD WALLS ──────────────────────────────────────────────────────────────
export function calculateStudWalls({ length, height, spacing }) {
const spacingM = spacing / 1000;
const studs = Math.ceil(length / spacingM) + 1;
const noggins = Math.ceil(studs * Math.floor(height / 1.2));
const timberLength = +(studs * height + noggins * spacingM + length * 2).toFixed(1);
const plasterboardSheets = Math.ceil(((length * height) / 2.88) * 1.1);

return [
helperRow(
`Timber Studs (${spacing}mm centres)`,
studs,
'pcs',
`CLS 38×89mm × ${height}m lengths. Included in total timber pricing.`
),
helperRow(
'Noggins',
noggins,
'pcs',
'Horizontal bracing every 1.2m. Included in total timber pricing.'
),
helperRow(
'Head & Sole Plates',
2,
'pcs',
`${length}m lengths of CLS 38×89mm. Included in total timber pricing.`
),
materialRow(
'Total Timber Required',
timberLength,
'lin. m',
'Studs, noggins, head and sole plates combined.',
'structural_timber_m'
),
materialRow(
'Plasterboard (2400×1200mm)',
plasterboardSheets,
'sheets',
'Both sides, 10% waste',
'plasterboard_sheet'
),
materialRow(
'Drywall Screws',
Math.ceil(plasterboardSheets * 32),
'pcs',
'~32 per sheet at 300mm centres',
'drywall_screw'
),
materialRow(
'Acoustic / Insulation Batts',
Math.ceil(length * height),
'm²',
'Optional — between studs for sound/thermal',
'insulation_m2'
),
];
}

// ─── ROOFING ─────────────────────────────────────────────────────────────────
export function calculateRoofing({ length, width, pitch, materialType }) {
const pitchRad = (pitch * Math.PI) / 180;
const rafterLength = width / 2 / Math.cos(pitchRad);
const roofArea = length * rafterLength * 2;
const tilesPerSqm = materialType === 'concrete' ? 10 : materialType === 'clay' ? 15 : 1;

const rafterCentres = 0.4;
const rafterPairs = Math.ceil(length / rafterCentres) + 1;
const totalRafters = rafterPairs * 2;
const totalRafterTimber = +(totalRafters * rafterLength).toFixed(2);

const results = [
measurementRow(
'Roof Area (both slopes)',
+roofArea.toFixed(1),
'm²',
`${pitch}° pitch`
),
measurementRow(
'Rafter Length',
+rafterLength.toFixed(2),
'm',
'Per side, before overhang'
),
helperRow(
'Rafters Required',
totalRafters,
'pcs',
`${rafterPairs} pairs at approx 400mm centres`
),
materialRow(
'Rafter Timber Required',
totalRafterTimber,
'lin. m',
`Approx ${totalRafters} rafters × ${rafterLength.toFixed(2)}m`,
'structural_timber_m'
),
];

if (materialType === 'slate' || materialType === 'sheet') {
results.push(
materialRow(
'Roofing Sheets / Slates',
Math.ceil(roofArea * 1.1),
'm²',
'10% overlap allowance',
materialType === 'sheet' ? 'roof_sheet_m2' : 'slate_m2'
)
);
} else {
results.push(
materialRow(
`${materialType === 'concrete' ? 'Concrete' : 'Clay'} Tiles`,
Math.ceil(roofArea * tilesPerSqm * 1.05),
'pcs',
'5% wastage included',
materialType === 'concrete' ? 'concrete_roof_tile' : 'clay_roof_tile'
)
);
}

results.push(
materialRow(
'Roofing Felt / Membrane',
Math.ceil(roofArea * 1.15),
'm²',
'15% overlap',
'roofing_membrane_m2'
),
materialRow(
'Battens (25×50mm)',
Math.ceil((roofArea / 0.34) * 1.05),
'lin. m',
'340mm gauge, 5% waste',
'roof_batten_m'
),
materialRow(
'Ridge Tiles',
Math.ceil(length / 0.33),
'pcs',
'330mm gauge',
'ridge_tile'
),
materialRow(
'Hip / Valley Tiles',
Math.ceil((rafterLength * 2) / 0.28),
'pcs',
'If hips/valleys present — 280mm gauge',
'ridge_tile'
)
);

return results;
}

// ─── FLOORING ────────────────────────────────────────────────────────────────
export function calculateFlooring({ length, width, materialType }) {
const area = length * width;

if (materialType === 'concrete_slab') {
const concreteVol = +(area * 0.1).toFixed(2);

return [
measurementRow('Floor Area', +area.toFixed(1), 'm²'),
materialRow(
'Concrete (100mm slab)',
concreteVol,
'm³',
'C25/30 recommended',
'ready_mix_m3'
),
materialRow(
'DPM (1200 gauge polythene)',
Math.ceil(area * 1.15),
'm²',
'15% overlap',
'dpm_m2'
),
materialRow(
'Sand Blinding (50mm)',
+(area * 0.05).toFixed(2),
'm³',
'Under DPM',
'sand_blinding_m3'
),
materialRow(
'Steel Mesh (A142)',
Math.ceil((area / 4.8) * 1.1),
'sheets',
'4.8×2.4m sheets, 10% overlap',
'mesh_sheet'
),
materialRow(
'Insulation (75mm Celotex)',
Math.ceil(area * 1.05),
'm²',
'5% cutting waste',
'insulation_m2'
),
];
}

const joists = Math.ceil(length / 0.4) + 1;
const joistTimber = +(joists * width).toFixed(2);
const noggins = Math.ceil(joists * (length / 2));
const nogginTimber = +(noggins * 0.4).toFixed(2);

return [
measurementRow('Floor Area', +area.toFixed(1), 'm²'),
materialRow(
'Floor Joist Timber (400mm centres)',
joistTimber,
'lin. m',
`${joists} joists × ${width}m lengths, 47×200mm C16`,
'structural_timber_m'
),
materialRow(
'Chipboard Flooring (P5 T&G)',
Math.ceil((area / 2.88) * 1.05),
'sheets',
'2400×600×22mm, 5% waste',
'chipboard_sheet'
),
materialRow(
'Joist Hangers',
joists * 2,
'pcs',
'Both ends',
'joist_hanger'
),
materialRow(
'Noggin Timber',
nogginTimber,
'lin. m',
`${noggins} noggins allowed at approx 400mm each`,
'structural_timber_m'
),
];
}

// ─── PLASTERBOARD ────────────────────────────────────────────────────────────
export function calculatePlasterboard({ length, height, layers }) {
const area = length * height;
const sheetsPerLayer = Math.ceil(((area / 2.88) * 1.1));
const totalSheets = sheetsPerLayer * layers;

return [
measurementRow('Wall Area', +area.toFixed(1), 'm²'),
materialRow(
'Plasterboard (12.5mm)',
totalSheets,
'sheets',
`${layers} layer(s), 2400×1200mm, 10% waste`,
'plasterboard_sheet'
),
materialRow(
'Drywall Screws (38mm)',
Math.ceil(totalSheets * 32),
'pcs',
'300mm centres',
'drywall_screw'
),
materialRow(
'Joint Tape',
Math.ceil(area * 1.5),
'lin. m',
'Paper or fibreglass mesh',
'joint_tape_m'
),
materialRow(
'Jointing Compound (25kg)',
Math.ceil(area / 10),
'bags',
'For joints and skim coat',
'jointing_compound_bag'
),
materialRow(
'Corner Bead',
Math.ceil(height * 0.5),
'pcs',
'External corners, 2.4m lengths',
'angle_bead'
),
];
}

// ─── PLASTER SKIM ────────────────────────────────────────────────────────────
export function calculatePlasterSkim({ length, height, coats }) {
const area = length * height;
const plasterBags = Math.ceil((area * coats * 2) / 25);

return [
measurementRow('Wall Area', +area.toFixed(1), 'm²'),
materialRow(
'Multi-Finish Plaster (25kg)',
plasterBags,
'bags',
`${coats} coat(s) @ ~2kg/m² per coat`,
'multi_finish_bag'
),
materialRow(
'PVA Bonding Agent (5L)',
Math.ceil(area / 50),
'tubs',
'Seal surface before skim',
'pva_tub'
),
helperRow(
'Clean Water',
Math.ceil(plasterBags * 11.5),
'litres',
'~11.5L per 25kg bag'
),
materialRow(
'Angle Bead',
Math.ceil((height / 2.4) * 2),
'pcs',
'External corner protection',
'angle_bead'
),
];
}

// ─── DRAINAGE ────────────────────────────────────────────────────────────────
export function calculateDrainage({ length, pipeDiameter, gradient }) {
const pipeLengths = Math.ceil((length / 3) * 1.05);
const bedding = +(length * 0.15 * 0.45).toFixed(2);

return [
materialRow(
`Drainage Pipe (${pipeDiameter}mm)`,
Math.ceil(length * 1.05),
'lin. m',
`3m lengths, 5% waste. ${pipeDiameter}mm dia.`,
'drainage_pipe_m'
),
materialRow(
'Pipe Couplers',
pipeLengths,
'pcs',
'One per joint',
'pipe_coupler'
),
materialRow(
'Pea Gravel (Bedding)',
bedding,
'm³',
'150mm bed, 450mm trench',
'pea_gravel_m3'
),
materialRow(
'Pea Gravel (Surround)',
+(bedding * 2).toFixed(2),
'm³',
'150mm cover over pipe',
'pea_gravel_m3'
),
materialRow(
'Geotextile Membrane',
Math.ceil(length * 1.5 * 1.1),
'm²',
'Wrap around gravel, 10% overlap',
'geotextile_m2'
),
materialRow(
'Inspection Chamber',
Math.max(1, Math.ceil(length / 45)),
'pcs',
'Every 45m max per Building Regs',
'inspection_chamber'
),
measurementRow(
'Fall',
+(length * gradient / 100).toFixed(3),
'm total',
`1:${Math.round(100 / gradient)} gradient (${gradient}% fall)`
),
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
const mix = concreteMixRatios[grade] || concreteMixRatios.C25;
const totalParts = mix.cement + mix.sand + mix.agg;
const dryVolume = volume * 1.54;

const cementVol = dryVolume * (mix.cement / totalParts);
const sandVol = dryVolume * (mix.sand / totalParts);
const aggVol = dryVolume * (mix.agg / totalParts);

const cementBags = Math.ceil((cementVol * 1440) / 25);

return [
measurementRow(
'Concrete Volume Required',
volume,
'm³',
`${length}m × ${width}m × ${depth * 1000}mm thick`
),
materialRow(
`Cement (25kg bags) — ${grade}`,
cementBags,
'bags',
`Mix ratio ${mix.label} by volume`,
'cement_bag_25kg'
),
materialRow(
'Sharp Sand',
+(sandVol * 1.7).toFixed(2),
'tonnes',
'1700kg/m³ bulk density',
'sharp_sand_tonne'
),
materialRow(
'Coarse Aggregate (20mm)',
+(aggVol * 1.6).toFixed(2),
'tonnes',
'1600kg/m³ bulk density',
'aggregate_tonne'
),
helperRow(
'Water',
Math.ceil(cementBags * 12),
'litres',
'~12L per 25kg bag at 0.5 w/c ratio'
),
helperRow(
'Ready-Mix Alternative',
volume,
'm³',
`Order ${grade} ready-mix if volume > 1m³`
),
];
}

// ─── INSULATION ──────────────────────────────────────────────────────────────
const insulationCoverage = {
mineral_wool: {
rollWidth: 0.6,
rollLength: 8.33,
rollArea: 5,
unit: 'rolls',
label: 'Mineral Wool Roll (100mm, 5.0m²)',
pricingKey: 'mineral_wool_roll',
},
rigid_pir: {
sheetArea: 2.88,
unit: 'sheets',
label: 'PIR Board 2400×1200mm',
pricingKey: 'pir_sheet',
},
eps: {
sheetArea: 2.88,
unit: 'sheets',
label: 'EPS Board 2400×1200mm',
pricingKey: 'eps_sheet',
},
spray_foam: {
unit: 'kit',
label: 'Spray Foam Kit (covers ~15m²)',
pricingKey: 'spray_foam_kit',
},
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
const waste = 1.1;

const results = [
measurementRow(
'Area to Insulate',
area,
'm²',
`${length}m × ${width}m`
),
measurementRow(
'Recommended Thickness',
thickness,
'mm',
`For ${areaType} — Part L Building Regs guidance`
),
];

if (insType === 'mineral_wool') {
results.push(
materialRow(
ins.label,
Math.ceil((area * waste) / ins.rollArea),
ins.unit,
'10% cutting waste added',
ins.pricingKey
)
);
} else if (insType === 'rigid_pir' || insType === 'eps') {
results.push(
materialRow(
ins.label,
Math.ceil((area * waste) / ins.sheetArea),
ins.unit,
'10% cutting waste added',
ins.pricingKey
)
);
} else {
results.push(
materialRow(
ins.label,
Math.ceil(area / 15),
ins.unit,
'~15m² coverage per kit',
ins.pricingKey
)
);
}

results.push(
materialRow(
'Vapour Control Layer',
Math.ceil(area * 1.15),
'm²',
'Polythene VCL — 15% overlap; warm side of insulation',
'vcl_m2'
),
materialRow(
'Insulation Tape / Fixings',
Math.ceil(area / 5),
'packs',
'Foil tape or mechanical fixings',
'insulation_fixings_pack'
)
);

return results;
}

// ─── STAIRCASE ───────────────────────────────────────────────────────────────
export function calculateStaircase({ totalRise, width, material }) {
const riserHeight = 0.19;
const going = 0.25;
const numRisers = Math.ceil(totalRise / riserHeight);
const totalGoing = +(numRisers * going).toFixed(2);
const stringerLength = +Math.sqrt(totalRise ** 2 + totalGoing ** 2).toFixed(2);

const results = [
measurementRow(
'Number of Risers',
numRisers,
'steps',
`${Math.round((totalRise / numRisers) * 1000)}mm riser height (Part K: 150–220mm)`
),
measurementRow(
'Total Going (horizontal run)',
totalGoing,
'm',
`${going * 1000}mm per step (Part K: min 220mm)`
),
measurementRow(
'Stringer Length',
stringerLength,
'm',
'Diagonal length of stair string'
),
];

if (material === 'timber' || material === 'oak') {
const label = material === 'oak' ? 'Solid Oak' : 'Softwood Timber';
const treadKey = material === 'oak' ? 'oak_tread' : 'softwood_tread';

results.push(
materialRow(
`${label} Treads (${Math.round(going * 1000)}×${Math.round(width * 1000)}mm)`,
numRisers - 1,
'pcs',
'32mm thickness recommended',
treadKey
),
materialRow(
`${label} Risers`,
numRisers,
'pcs',
'18mm thickness',
'stair_riser'
),
materialRow(
`${label} Strings (×2)`,
2,
'pcs',
`${stringerLength}m × 300mm × 38mm`,
'stair_string'
),
materialRow('Newel Posts', 2, 'pcs', 'Top and bottom', 'newel_post'),
materialRow(
'Balusters / Spindles',
Math.ceil((numRisers - 1) * 2),
'pcs',
'~2 per tread, 100mm max spacing (Part K)',
'baluster'
),
materialRow(
'Handrail',
+(stringerLength + 0.3).toFixed(2),
'lin. m',
'Both sides if width > 1m',
'handrail_m'
)
);
} else if (material === 'steel') {
results.push(
materialRow(
'Steel Stringers (×2)',
2,
'pcs',
`${stringerLength}m — 200×10mm flat or RHS — fabricated`,
'steel_stringer'
),
materialRow(
'Steel Treads (open riser)',
numRisers - 1,
'pcs',
'Chequer plate or bar grating',
'steel_tread'
),
materialRow(
'Steel Balustrade',
+(stringerLength * 2).toFixed(1),
'lin. m',
'Both sides inc handrail',
'steel_balustrade_m'
)
);
} else if (material === 'concrete') {
const concreteVol = +((totalGoing * width * totalRise) / 2 * 1.2).toFixed(2);

results.push(
materialRow(
'Concrete (in-situ)',
concreteVol,
'm³',
'C25/30, 20% added for waist and landings',
'ready_mix_m3'
),
materialRow(
'Rebar (10mm)',
Math.ceil(numRisers * width * 2 * 1.1),
'lin. m',
'Top and bottom layer, 200mm centres',
'rebar_m'
),
materialRow(
'Formwork (soffit)',
+(totalGoing * width).toFixed(1),
'm²',
'18mm plywood shuttering',
'formwork_m2'
)
);
}

return results;
}

// ─── PAINTING & DECORATING ───────────────────────────────────────────────────
const spreadRates = {
emulsion: 12,
satinwood: 14,
masonry: 5,
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
const surfaceFactor = surface === 'bare_brick' ? 0.6 : surface === 'plaster' ? 0.8 : 1;
const effectiveRate = rate * surfaceFactor;
const litresNeeded = +((area * coats) / effectiveRate).toFixed(1);
const fiveLitreTins = Math.ceil(litresNeeded / 5);
const twoFiveTins = Math.ceil(litresNeeded / 2.5);

const results = [
measurementRow('Surface Area', area, 'm²', `${length}m × ${height}m`),
materialRow(
`${paintType.charAt(0).toUpperCase() + paintType.slice(1).replace(/_/g, ' ')} — Total Volume`,
litresNeeded,
'litres',
`${coats} coat(s) @ ${effectiveRate.toFixed(1)}m²/litre`,
'paint_litre'
),
materialRow(
'5 Litre Tins',
fiveLitreTins,
'tins',
'Most economical option',
'paint_tin_5l'
),
helperRow(
'2.5 Litre Tins (alternative)',
twoFiveTins,
'tins',
'For colour matching / feature walls'
),
];

if (primerNeeded[surface]) {
const primerLitres = +(area / (spreadRates.primer * surfaceFactor)).toFixed(1);

results.push(
materialRow(
'Primer / Mist Coat',
Math.ceil(primerLitres / 5),
'tins (5L)',
surface === 'plaster'
? 'Dilute emulsion 70/30 or specialist mist coat'
: `Appropriate primer for ${surface}`,
'paint_tin_5l'
)
);
}

results.push(
materialRow(
'Roller Sleeves (medium pile)',
Math.ceil(area / 40),
'pcs',
'Replace when shedding or clogged',
'roller_sleeve'
),
materialRow(
'Masking Tape (25mm)',
Math.ceil((length * 2 + height * 2) / 33),
'rolls',
'33m per roll — around perimeter',
'masking_tape_roll'
),
materialRow(
'Dust Sheets',
Math.ceil(area / 10),
'pcs',
'1 sheet per ~10m² floor area',
'dust_sheet'
)
);

return results;
}