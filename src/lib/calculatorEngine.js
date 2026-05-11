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
windowArea = 0,
doorArea = 0,
}) {
if (!length || !height || !materialType || !thickness) return [];

const round1 = (value) => Number(value.toFixed(1));
const round2 = (value) => Number(value.toFixed(2));

const grossArea = round2(length * height);
const openingArea = round2(Number(windowArea || 0) + Number(doorArea || 0));
const netArea = round2(Math.max(grossArea - openingArea, 0));

const skins = thickness === 'cavity' ? 2 : thickness === 'solid' ? 2 : 1;
const effectiveArea = round2(netArea * skins);

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

const constructionLabel =
thickness === 'cavity'
? 'Cavity wall / two leaves'
: thickness === 'solid'
? 'Solid double thickness wall'
: 'Single skin / single leaf wall';

const results = [
measurementRow(
'Gross Wall Face Area',
grossArea,
'm²',
`${length}m × ${height}m wall face area before openings.`
),

helperRow(
'Opening Deduction',
openingArea,
'm²',
openingArea > 0
? `${openingArea}m² deducted for windows/doors. Net wall area: ${netArea}m².`
: 'No opening deduction entered. Quantities calculated from full wall face area.'
),

measurementRow(
'Net Wall Face Area',
netArea,
'm²',
'Wall area used for material quantities after opening deductions.'
),

helperRow(
'Wall Construction',
skins,
skins === 1 ? 'leaf' : 'leaves',
`${constructionLabel}. Material quantities calculated against ${effectiveArea}m² effective wall area.`
),
];

if (thickness === 'cavity') {
results.push(
materialRow(
'Cavity Wall Insulation',
netArea,
'm²',
'Insulation allowed to net wall face area. Confirm cavity width and specification to suit Part L requirements.',
'insulation_m2'
),

materialRow(
'Wall Ties (stainless steel)',
Math.ceil(netArea * 2.5),
'pcs',
'Wall ties allowed at approx. 2.5 ties per m² for standard cavity walling.',
'wall_tie'
)
);
}

if (isBlock) {
const blocks = Math.ceil(effectiveArea * unitsPerSqm[materialType] * 1.05);
const blockPacks = Math.ceil(blocks / 72);
const totalPackBlocks = blockPacks * 72;

const blockLabel =
materialType === 'block_standard'
? '440×215×100mm'
: materialType === 'block_large'
? '440×215×140mm'
: '440×215×100mm 7.3N';

const blockKey =
materialType === 'block_large'
? 'concrete_block_140mm'
: materialType === 'block_dense'
? 'concrete_block_dense'
: 'concrete_block';

results.push(
materialRow(
`Concrete Blocks (${blockLabel})`,
blocks,
'pcs',
`${blocks} blocks allowed based on ${unitsPerSqm[materialType]} blocks per m², including approx. 5% cutting and breakage allowance.`,
blockKey
),

helperRow(
'Concrete Block Packs / Pallets',
blockPacks,
'packs',
`Based on approx. 72 blocks per pack/pallet. Order quantity would be around ${totalPackBlocks} blocks.`
),

materialRow(
'Mortar — Cement (25kg bags)',
Math.ceil(effectiveArea * 0.35),
'bags',
'Cement allowed for blockwork mortar at approx. 0.35 bags per m² of effective wall area.',
'cement_bag_25kg'
),

materialRow(
'Mortar — Building Sand',
round2(effectiveArea * 0.04),
'tonnes',
'Building sand allowed for blockwork mortar at approx. 40kg per m² of effective wall area.',
'building_sand_tonne'
)
);
}

if (isBrick) {
const bricksPerM2 = unitsPerSqm[materialType];
const bricks = Math.ceil(effectiveArea * bricksPerM2 * 1.05);
const brickPacks = Math.ceil(bricks / 500);
const totalPackBricks = brickPacks * 500;

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
`${bricks} bricks allowed based on ${bricksPerM2} bricks per m² for ${bond || 'Stretcher Bond'}, including approx. 5% waste.`,
brickKey
),

helperRow(
'Brick Packs / Pallets',
brickPacks,
'packs',
`Based on approx. 500 bricks per pack/pallet. Order quantity would be around ${totalPackBricks} bricks.`
),

materialRow(
'Mortar — Cement (25kg bags)',
Math.ceil(effectiveArea * 0.55),
'bags',
'Cement allowed for brickwork mortar at approx. 0.55 bags per m² of effective wall area.',
'cement_bag_25kg'
),

materialRow(
'Mortar — Building Sand',
round2(effectiveArea * 0.05),
'tonnes',
'Building sand allowed for brickwork mortar at approx. 50kg per m² of effective wall area.',
'building_sand_tonne'
),

materialRow(
'Plasticiser (1L bottles)',
Math.ceil(effectiveArea / 30),
'bottles',
'Plasticiser allowed for mortar work at approx. 1 bottle per 30m².',
'plasticiser_bottle'
)
);
}

if (isStone) {
if (materialType === 'stone_dry') {
const dryStoneTonnes = round2((netArea * 0.3 * 1900) / 1000);
const heartingAllowance = Math.ceil(netArea * 0.2);

results.push(
materialRow(
'Stone (dry walling)',
dryStoneTonnes,
'tonnes',
'Dry walling stone allowed using approx. 300mm average wall thickness and 1900kg/m³ stone density.',
'walling_stone_tonne'
),

materialRow(
'Pinning / Hearting Stone',
heartingAllowance,
'm²',
'Hearting stone allowed for internal packing and smaller infill stones.',
'walling_stone_tonne'
)
);
} else {
const stoneTonnes = round1((netArea * 0.25 * 2300) / 1000);
const mortarTonnes = round2(effectiveArea * 0.07);

results.push(
materialRow(
`Walling Stone (${materialType === 'stone_coursed' ? 'coursed ashlar' : 'random rubble'})`,
stoneTonnes,
'tonnes',
'Walling stone allowed using approx. 250mm wall thickness and 2300kg/m³ stone density. Allow extra on site for quoins and selection.',
'walling_stone_tonne'
),

materialRow(
'Mortar — Cement (25kg bags)',
Math.ceil(effectiveArea * 0.8),
'bags',
'Cement allowed for stonework mortar to effective wall area.',
'cement_bag_25kg'
),

materialRow(
'Hydraulic Lime (25kg bags)',
Math.ceil(effectiveArea * 0.5),
'bags',
'Hydraulic lime allowed for breathable stonework mortar. NHL 3.5 commonly used subject to specification.',
'lime_bag_25kg'
),

materialRow(
'Sharp Sand',
mortarTonnes,
'tonnes',
'Sharp sand allowed for stonework mortar bed and jointing.',
'sharp_sand_tonne'
)
);
}
}

results.push(
materialRow(
'DPC Membrane (100mm wide)',
round1(length * 1.1),
'm',
'DPC allowed along wall base with approx. 10% lap allowance.',
'dpc_membrane_m'
)
);

if (thickness === 'cavity') {
results.push(
helperRow(
'Cavity Tray Allowance',
Math.ceil(length / 0.6),
'pcs',
'Indicative allowance only. Confirm cavity trays against actual openings, lintels and abutments.'
)
);
}

return results;
}

export function calculateStudWalls({ length, height, spacing }) {
if (!length || !height || !spacing) return [];

const round2 = (value) => Number(value.toFixed(2));

const area = length * height;
const spacingM = spacing / 1000;
const stockLength = 6.0;

const studCount = Math.ceil(length / spacingM) + 1;
const bays = Math.max(studCount - 1, 1);

const nogginRows = height <= 1.2 ? 0 : height <= 2.7 ? 1 : 2;
const nogginCount = bays * nogginRows;

const studTimber = studCount * height;
const nogginTimber = nogginCount * spacingM;
const plateTimber = length * 2;

const totalCutTimber = round2(studTimber + nogginTimber + plateTimber);
const safetyAllowance = round2(totalCutTimber * 0.03);
const timberOrderLength = round2(totalCutTimber + safetyAllowance);

const lengthsNeeded = Math.ceil(timberOrderLength / stockLength);
const totalOrdered = round2(lengthsNeeded * stockLength);
const estimatedWaste = round2(totalOrdered - totalCutTimber);

const plasterboardSheets = Math.ceil((area * 2 * 1.1) / 2.88);
const drywallScrews = Math.ceil(plasterboardSheets * 32);
const framingFixings = Math.ceil(
(studCount * 4 + nogginCount * 4 + 20) / 100
);

return [
measurementRow(
'Wall Frame Area',
round2(area),
'm²',
`${length}m × ${height}m wall area based on input dimensions.`
),

helperRow(
`Stud Layout (${spacing}mm centres)`,
studCount,
'studs',
`${studCount} studs at ${spacing}mm centres across ${length}m wall, including end studs.`
),

helperRow(
'Noggin Layout',
nogginCount,
'pcs',
nogginRows > 0
? `${nogginRows} row${nogginRows === 1 ? '' : 's'} of noggins across ${bays} stud bays.`
: 'No noggins required for this wall height.'
),

helperRow(
'Head & Sole Plate Runs',
round2(plateTimber),
'lin. m',
`Head and sole plates run full wall length, ${length}m each.`
),

materialRow(
'CLS Timber — Smart Order',
timberOrderLength,
'lin. m',
`${lengthsNeeded} × ${stockLength}m lengths selected to cover studs, noggins, head plate and sole plate. Includes approx. 3% cutting allowance. Estimated waste/offcut: ${estimatedWaste}m.`,
'structural_timber_m'
),

helperRow(
'CLS Timber Order Breakdown',
lengthsNeeded,
'lengths',
`${lengthsNeeded} lengths at ${stockLength}m each. Total ordered length: ${totalOrdered}m. Required cut length including allowance: ${timberOrderLength}m.`
),

materialRow(
'Plasterboard (2400×1200mm)',
plasterboardSheets,
'sheets',
`${plasterboardSheets} sheets for both sides of wall, including 10% waste allowance.`,
'plasterboard_sheet'
),

materialRow(
'Drywall Screws',
drywallScrews,
'pcs',
`${drywallScrews} screws based on approx. 32 fixings per board.`,
'drywall_screw'
),

materialRow(
'Framing Nails / Timber Screws',
framingFixings,
'boxes',
`${framingFixings} boxes of fixings for studs, noggins, head plate and sole plate.`,
'timber_fixings_box'
),

materialRow(
'Acoustic / Insulation Batts',
Math.ceil(area),
'm²',
`${round2(area)}m² insulation to suit stud spacing. Optional depending on thermal or acoustic requirements.`,
'insulation_m2'
),
];
}


export function calculateRoofing({ length, width, pitch, materialType }) {
if (!length || !width || !pitch) return [];

const round2 = (value) => Number(value.toFixed(2));

const pitchRad = (pitch * Math.PI) / 180;
const rafterLength = round2((width / 2) / Math.cos(pitchRad));
const roofArea = round2(length * rafterLength * 2);

const rafterCentres = 0.4;
const rafterPairs = Math.ceil(length / rafterCentres) + 1;
const totalRafters = rafterPairs * 2;
const rafterTimberLength = round2(totalRafters * rafterLength);
const rafterTimberOrder = round2(rafterTimberLength * 1.05);

const coveringRates = {
concrete: {
label: 'Concrete Roof Tiles',
perM2: 10,
waste: 1.08,
pricingKey: 'concrete_roof_tile',
},
clay: {
label: 'Clay Roof Tiles',
perM2: 15,
waste: 1.08,
pricingKey: 'clay_roof_tile',
},
slate: {
label: 'Roof Slates',
perM2: 20,
waste: 1.1,
pricingKey: 'slate_piece',
},
sheet: {
label: 'Roof Sheets',
perM2: 1,
waste: 1.05,
pricingKey: 'roof_sheet_m2',
},
};

const covering = coveringRates[materialType] || coveringRates.concrete;

const roofCoveringQuantity =
materialType === 'sheet'
? Math.ceil(roofArea * covering.waste)
: Math.ceil(roofArea * covering.perM2 * covering.waste);

const battenGauge =
materialType === 'slate' ? 0.25 : materialType === 'clay' ? 0.3 : 0.34;

const battenRowsPerSlope = Math.ceil(rafterLength / battenGauge) + 1;
const totalBattenRows = battenRowsPerSlope * 2;
const battenLength = round2(totalBattenRows * length * 1.05);

const membraneArea = Math.ceil(roofArea * 1.15);
const ridgeTiles = Math.ceil(length / 0.33);

const coveringFixingBoxes =
materialType === 'sheet'
? Math.ceil((roofCoveringQuantity * 8) / 200)
: Math.ceil((roofCoveringQuantity * 1.5) / 200);

const battenNailBoxes = Math.ceil((battenLength * 2) / 250);

const dryRidgeKits = Math.ceil(length / 3);
const eavesVentLength = round2(length * 2);
const vergeLength = round2(rafterLength * 4);

return [
measurementRow(
'Roof Area',
roofArea,
'm²',
`${length}m roof length × ${width}m span at ${pitch}° pitch. True roof area calculated across both slopes.`
),

measurementRow(
'Rafter Length',
rafterLength,
'm',
`Common rafter length based on ${width}m span and ${pitch}° roof pitch.`
),

helperRow(
'Rafter Layout',
rafterPairs,
'pairs',
`${rafterPairs} rafter pairs set out at approximately 400mm centres along the roof length.`
),

materialRow(
'Rafter Timber',
rafterTimberOrder,
'lin. m',
`${totalRafters} rafters × ${rafterLength}m, including approx. 5% cutting allowance.`,
'structural_timber_m'
),

materialRow(
covering.label,
roofCoveringQuantity,
materialType === 'sheet' ? 'm²' : 'pcs',
materialType === 'sheet'
? 'Roof sheet allowance based on true roof area with approx. 5% waste.'
: `${covering.perM2} units per m² allowed with waste for cuts, verge, ridge and breakages.`,
covering.pricingKey
),

materialRow(
'Breather Membrane / Felt',
membraneArea,
'm²',
'Full roof coverage with lap allowance across both slopes.',
'roofing_membrane_m2'
),

materialRow(
'Roof Battens',
battenLength,
'lin. m',
`${totalBattenRows} courses set out at approx. ${Math.round(
battenGauge * 1000
)}mm gauge to suit roof covering. Includes 5% waste allowance.`,
'roof_batten_m'
),

materialRow(
'Ridge Tiles',
ridgeTiles,
'pcs',
`Ridge tiles calculated from ${length}m ridge length with standard lap allowance.`,
'ridge_tile'
),

materialRow(
'Dry Ridge System',
dryRidgeKits,
'kits',
`Dry ridge allowance based on ${length}m ridge length, using approx. 3m kits.`,
'roof_fixings_box'
),

materialRow(
'Tile / Sheet Fixings',
coveringFixingBoxes,
'boxes',
materialType === 'sheet'
? 'Fixings rounded into boxes, based on approx. 8 fixings per m² of roof sheets.'
: 'Fixings rounded into boxes, based on approx. 1.5 fixings per tile/slate.',
'roof_fixings_box'
),

materialRow(
'Batten Nails',
battenNailBoxes,
'boxes',
'Batten nail allowance rounded into boxes for fixing battens across both roof slopes.',
'roof_fixings_box'
),

helperRow(
'Eaves Support Trays / Ventilation',
eavesVentLength,
'lin. m',
'Allowance for eaves support trays and ventilation along both eaves runs.'
),

helperRow(
'Verge Allowance',
vergeLength,
'lin. m',
'Allowance for verge finishing to exposed roof edges where required.'
),
];
}

// ─── FLOORING ────────────────────────────────────────────────────────────────
export function calculateFlooring({ length, width, materialType }) {
if (!length || !width || !materialType) return [];

const round1 = (value) => Number(value.toFixed(1));
const round2 = (value) => Number(value.toFixed(2));

const area = round2(length * width);

// =========================
// CONCRETE SLAB FLOOR
// =========================

if (materialType === 'concrete_slab') {
const slabDepth = 0.1;

const concreteVol = round2(area * slabDepth);
const concreteOrderVol = round2(concreteVol * 1.05);

const dpmArea = Math.ceil(area * 1.15);

const sandBlinding = round2(area * 0.05);

const meshSheets = Math.ceil((area / 11.52) * 1.1);

const rebarLength = Math.ceil(
((length / 0.2) * width) +
((width / 0.2) * length)
);

const insulationArea = Math.ceil(area * 1.05);

const perimeterLength = round2((length + width) * 2);

const formworkArea = round2(perimeterLength * slabDepth);

return [
measurementRow(
'Floor Area',
round1(area),
'm²',
`${length}m × ${width}m floor area based on input dimensions.`
),

measurementRow(
'Slab Depth',
100,
'mm',
'Standard 100mm slab depth allowed for general domestic floor build-up.'
),

materialRow(
'Concrete Slab',
concreteOrderVol,
'm³',
'C25/30 ready-mix concrete allowed at 100mm depth, including approx. 5% ordering allowance.',
'ready_mix_m3'
),

materialRow(
'DPM (1200 gauge polythene)',
dpmArea,
'm²',
'DPM allowed across full slab area with approx. 15% lap and upstand allowance.',
'dpm_m2'
),

materialRow(
'Sand Blinding',
sandBlinding,
'm³',
'50mm sand blinding layer allowed below DPM for protection and levelling.',
'sand_blinding_m3'
),

materialRow(
'Steel Mesh (A142)',
meshSheets,
'sheets',
'A142 reinforcement mesh allowed based on 4.8m × 2.4m sheets, including lap allowance.',
'mesh_sheet'
),

materialRow(
'Reinforcement Rebar (10mm)',
rebarLength,
'lin. m',
'Additional reinforcement allowance at approx. 200mm centres for slab strengthening and perimeter support.',
'rebar_m'
),

materialRow(
'Floor Insulation',
insulationArea,
'm²',
'75mm PIR insulation allowed across slab area with approx. 5% cutting waste.',
'insulation_m2'
),

materialRow(
'Edge Formwork',
formworkArea,
'm²',
'Indicative slab edge shuttering/formwork allowance.',
'formwork_m2'
),

helperRow(
'Perimeter Edge Allowance',
perimeterLength,
'lin. m',
'Perimeter allowance for edging, insulation upstand or movement detail where required.'
),
];
}

// =========================
// TIMBER SUSPENDED FLOOR
// =========================

const joistCentres = 0.4;

const joists = Math.ceil(length / joistCentres) + 1;

const joistBays = Math.max(joists - 1, 1);

const joistTimber = round2(joists * width);

const joistTimberOrder = round2(joistTimber * 1.05);

const nogginRows =
length > 2.4
? Math.ceil(length / 2.4) - 1
: 0;

const noggins = joistBays * nogginRows;

const nogginTimber = round2(noggins * joistCentres);

const nogginTimberOrder = round2(nogginTimber * 1.05);

const chipboardSheets = Math.ceil((area / 1.44) * 1.05);

const joistHangers = joists * 2;

const flooringScrews = Math.ceil(chipboardSheets * 35);

const screwBoxes = Math.ceil(flooringScrews / 200);

const insulationArea = Math.ceil(area);

return [
measurementRow(
'Floor Area',
round1(area),
'm²',
`${length}m × ${width}m floor area based on input dimensions.`
),

helperRow(
'Joist Layout',
joists,
'joists',
`${joists} joists set out at approximately 400mm centres across ${length}m floor length.`
),

materialRow(
'Floor Joist Timber',
joistTimberOrder,
'lin. m',
`${joists} joists × ${width}m span, including approx. 5% cutting allowance.`,
'structural_timber_m'
),

materialRow(
'Chipboard Flooring (P5 T&G)',
chipboardSheets,
'sheets',
`${chipboardSheets} sheets allowed based on 2400×600mm boards, including approx. 5% waste.`,
'chipboard_sheet'
),

materialRow(
'Joist Hangers',
joistHangers,
'pcs',
'Joist hangers allowed to both ends of each joist.',
'joist_hanger'
),

materialRow(
'Noggin Timber',
nogginTimberOrder,
'lin. m',
nogginRows > 0
? `${noggins} noggins allowed across ${nogginRows} row${nogginRows === 1 ? '' : 's'}, including approx. 5% cutting allowance.`
: 'No intermediate noggin row required for this floor length.',
'structural_timber_m'
),

materialRow(
'Flooring Screws',
screwBoxes,
'boxes',
`${screwBoxes} boxes allowed, based on approx. ${flooringScrews} floor fixings.`,
'timber_fixings_box'
),

materialRow(
'Acoustic / Thermal Insulation',
insulationArea,
'm²',
`${insulationArea}m² insulation allowed between joists where acoustic or thermal performance is required.`,
'insulation_m2'
),
];
}

// ─── PLASTERBOARD ────────────────────────────────────────────────────────────
export function calculatePlasterboard({ length, height, layers }) {
if (!length || !height || !layers) return [];

const round1 = (value) => Number(value.toFixed(1));
const round2 = (value) => Number(value.toFixed(2));

const area = round2(length * height);
const boardArea = 2.88; // 2400mm × 1200mm

const sheetsPerLayer = Math.ceil((area / boardArea) * 1.1);
const totalSheets = sheetsPerLayer * layers;

const drywallScrews = Math.ceil(totalSheets * 32);
const drywallScrewBoxes = Math.ceil(drywallScrews / 200);

const jointTape = Math.ceil(area * 1.5);
const jointingCompound = Math.ceil(area / 10);
const cornerBeads = Math.ceil(height / 2.4);

return [
measurementRow(
'Wall Area',
round1(area),
'm²',
`${length}m × ${height}m wall area based on input dimensions.`
),

helperRow(
'Board Layout',
sheetsPerLayer,
'sheets/layer',
`${sheetsPerLayer} sheets per layer based on 2400×1200mm boards, including approx. 10% cutting waste.`
),

materialRow(
'Plasterboard (12.5mm)',
totalSheets,
'sheets',
`${totalSheets} sheets allowed for ${layers} layer${layers === 1 ? '' : 's'} of plasterboard.`,
'plasterboard_sheet'
),

materialRow(
'Drywall Screws (38mm)',
drywallScrewBoxes,
'boxes',
`${drywallScrewBoxes} boxes allowed, based on approx. ${drywallScrews} screws at 32 fixings per sheet.`,
'timber_fixings_box'
),

materialRow(
'Joint Tape',
jointTape,
'lin. m',
'Joint tape allowed for board joints at approx. 1.5m per m² of boarded area.',
'joint_tape_m'
),

materialRow(
'Jointing Compound (25kg)',
jointingCompound,
'bags',
'Jointing compound allowed at approx. 1 bag per 10m² for joints and finishing.',
'jointing_compound_bag'
),

materialRow(
'Corner Bead',
cornerBeads,
'pcs',
`${cornerBeads} corner bead${cornerBeads === 1 ? '' : 's'} allowed based on 2.4m lengths.`,
'angle_bead'
),
];
}

// ─── PLASTER SKIM ────────────────────────────────────────────────────────────
export function calculatePlasterSkim({ length, height, coats }) {
if (!length || !height || !coats) return [];

const round1 = (value) => Number(value.toFixed(1));
const round2 = (value) => Number(value.toFixed(2));

const area = round2(length * height);
const plasterRequiredKg = area * coats * 2;
const plasterBags = Math.ceil(plasterRequiredKg / 25);
const pvaTubs = Math.ceil(area / 50);
const waterLitres = Math.ceil(plasterBags * 11.5);
const angleBeads = Math.ceil(height / 2.4);

return [
measurementRow(
'Wall Area',
round1(area),
'm²',
`${length}m × ${height}m wall area based on input dimensions.`
),

helperRow(
'Plaster Build-Up',
coats,
'coats',
`${coats} coat${coats === 1 ? '' : 's'} of finish plaster allowed at approx. 2kg per m² per coat.`
),

materialRow(
'Multi-Finish Plaster (25kg)',
plasterBags,
'bags',
`${plasterBags} bags required based on total coverage of ${plasterRequiredKg.toFixed(0)}kg.`,
'multi_finish_bag'
),

materialRow(
'PVA Bonding Agent (5L)',
pvaTubs,
'tubs',
'PVA allowed to seal and control suction prior to plastering.',
'pva_tub'
),

materialRow(
'Angle Bead',
angleBeads,
'pcs',
`${angleBeads} beads allowed based on 2.4m lengths for external corners.`,
'angle_bead'
),

helperRow(
'Water Requirement',
waterLitres,
'litres',
`Approx. ${waterLitres} litres required based on ~11.5L per 25kg bag.`
),
];
}

// ─── DRAINAGE ────────────────────────────────────────────────────────────────
export function calculateDrainage({ length, pipeDiameter, gradient }) {
if (!length || !pipeDiameter || !gradient) return [];

const round2 = (value) => Number(value.toFixed(2));
const round3 = (value) => Number(value.toFixed(3));

const pipeLength = Math.ceil(length * 1.05);

const pipeLengths = Math.ceil(pipeLength / 3);

const pipeCouplers = Math.max(pipeLengths - 1, 0);

const trenchWidth = 0.45;
const beddingDepth = 0.15;

const beddingVolume = round2(
length * trenchWidth * beddingDepth
);

const surroundVolume = round2(beddingVolume * 2);

const membraneArea = Math.ceil(length * 1.5 * 1.1);

const inspectionChambers = Math.max(
1,
Math.ceil(length / 45)
);

const fall = round3((length * gradient) / 100);

return [
measurementRow(
'Drain Run Length',
round2(length),
'm',
'Total drainage run based on input length.'
),

measurementRow(
'Fall',
fall,
'm total',
`Gradient set at 1:${Math.round(
100 / gradient
)} (${gradient}% fall) across the full run.`
),

helperRow(
'Pipe Layout',
pipeLengths,
'lengths',
`${pipeLengths} × 3m pipe lengths allowed, including approx. 5% cutting and wastage allowance.`
),

materialRow(
`Drainage Pipe (${pipeDiameter}mm)`,
pipeLength,
'lin. m',
'Total pipe length including approx. 5% allowance for cuts and wastage.',
'drainage_pipe_m'
),

materialRow(
'Pipe Couplers',
pipeCouplers,
'pcs',
'One coupler allowed at each pipe joint.',
'pipe_coupler'
),

materialRow(
'Pea Gravel (Bedding)',
beddingVolume,
'm³',
'150mm bedding layer within approx. 450mm wide trench.',
'pea_gravel_m3'
),

materialRow(
'Pea Gravel (Surround)',
surroundVolume,
'm³',
'150mm surround cover above and around pipe.',
'pea_gravel_m3'
),

materialRow(
'Geotextile Membrane',
membraneArea,
'm²',
'Membrane wrap to trench with approx. 10% overlap allowance.',
'geotextile_m2'
),

materialRow(
'Inspection Chambers',
inspectionChambers,
'pcs',
'Allowance based on maximum 45m spacing in line with Building Regulations.',
'inspection_chamber'
),

helperRow(
'Trench Allowance',
round2(length * trenchWidth),
'm²',
'Indicative trench footprint based on approx. 450mm trench width.'
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
if (!length || !width || !depth) return [];

const round1 = (value) => Number(value.toFixed(1));
const round2 = (value) => Number(value.toFixed(2));
const round3 = (value) => Number(value.toFixed(3));

const selectedGrade = grade || 'C25';
const mix = concreteMixRatios[selectedGrade] || concreteMixRatios.C25;

const area = round2(length * width);
const volume = round3(length * width * depth);
const orderVolume = round3(volume * 1.05);

const totalParts = mix.cement + mix.sand + mix.agg;

// Dry volume allows for bulking, voids and batching loss.
const dryVolume = volume * 1.54;

const cementVol = dryVolume * (mix.cement / totalParts);
const sandVol = dryVolume * (mix.sand / totalParts);
const aggVol = dryVolume * (mix.agg / totalParts);

const cementBags = Math.ceil((cementVol * 1440) / 25);
const sandTonnes = round2(sandVol * 1.7);
const aggregateTonnes = round2(aggVol * 1.6);
const waterLitres = Math.ceil(cementBags * 12);

// Reinforcement / slab build-up extras
const meshSheets = Math.ceil((area / 11.52) * 1.1);
const dpmArea = Math.ceil(area * 1.15);
const formworkArea = round1((length + width) * 2 * depth);
const rebarLength = Math.ceil(area * 2);

return [
measurementRow(
'Concrete Volume',
volume,
'm³',
`${length}m × ${width}m × ${depth * 1000}mm concrete volume.`
),

helperRow(
'Ordering Allowance',
orderVolume,
'm³',
'Allow approx. 5% extra concrete for batching, level tolerance and site waste.'
),

helperRow(
'Concrete Mix',
selectedGrade,
'',
`Mix ratio ${mix.label} by volume: cement : sand : aggregate.`
),

materialRow(
`Cement (25kg bags) — ${selectedGrade}`,
cementBags,
'bags',
`${cementBags} bags required based on calculated ${selectedGrade} mix proportions.`,
'cement_bag_25kg'
),

materialRow(
'Sharp Sand',
sandTonnes,
'tonnes',
`Sharp sand calculated from ${mix.label} mix ratio using approx. 1700kg/m³ bulk density.`,
'sharp_sand_tonne'
),

materialRow(
'Coarse Aggregate (20mm)',
aggregateTonnes,
'tonnes',
`Aggregate calculated from ${mix.label} mix ratio using approx. 1600kg/m³ bulk density.`,
'aggregate_tonne'
),

helperRow(
'Water Requirement',
waterLitres,
'litres',
'Approx. water requirement based on ~12L per 25kg cement bag. Adjust on site to suit workability.'
),

materialRow(
'Steel Mesh (A142)',
meshSheets,
'sheets',
'A142 reinforcement mesh allowed using 4.8m × 2.4m sheets with approx. 10% lap allowance.',
'mesh_sheet'
),

materialRow(
'Rebar (10mm)',
rebarLength,
'lin. m',
'Indicative rebar allowance for slab edges, thickened areas or additional reinforcement where required.',
'rebar_m'
),

materialRow(
'DPM Membrane',
dpmArea,
'm²',
'DPM allowed across concrete area with approx. 15% lap and upstand allowance.',
'dpm_m2'
),

materialRow(
'Formwork',
formworkArea,
'm²',
'Indicative edge formwork allowance based on slab perimeter and depth.',
'formwork_m2'
),

helperRow(
'Ready-Mix Alternative',
volume,
'm³',
`For volumes over 1m³, consider ordering ${selectedGrade} ready-mix concrete for consistency and efficiency.`
),
];
}

// ─── INSULATION ──────────────────────────────────────────────────────────────
const insulationCoverage = {
mineral_wool: {
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
coverage: 15,
unit: 'kits',
label: 'Spray Foam Kit (~15m² coverage)',
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
if (!length || !width || !areaType || !insType) return [];

const round1 = (value) => Number(value.toFixed(1));
const round2 = (value) => Number(value.toFixed(2));

const area = round2(length * width);
const thickness = recommendedThickness[areaType]?.[insType];
const ins = insulationCoverage[insType];

if (!ins || !thickness) return [];

const wasteFactor = 1.1;

const results = [
measurementRow(
'Area to Insulate',
round1(area),
'm²',
`${length}m × ${width}m area based on input dimensions.`
),

measurementRow(
'Recommended Thickness',
thickness,
'mm',
`Typical ${areaType} insulation thickness based on UK Part L guidance. Confirm final specification where required.`
),

helperRow(
'Coverage Allowance',
'10%',
'',
'Additional material allowed for cutting, fitting and waste.'
),
];

if (insType === 'mineral_wool') {
const rolls = Math.ceil((area * wasteFactor) / ins.rollArea);

results.push(
materialRow(
ins.label,
rolls,
ins.unit,
`${rolls} rolls required based on 5m² coverage per roll including waste.`,
ins.pricingKey
)
);
}

if (insType === 'rigid_pir' || insType === 'eps') {
const sheets = Math.ceil((area * wasteFactor) / ins.sheetArea);

results.push(
materialRow(
ins.label,
sheets,
ins.unit,
`${sheets} sheets required based on 2400×1200mm boards including waste.`,
ins.pricingKey
)
);
}

if (insType === 'spray_foam') {
const kits = Math.ceil(area / ins.coverage);

results.push(
materialRow(
ins.label,
kits,
ins.unit,
`${kits} kits required based on approx. ${ins.coverage}m² coverage per kit.`,
ins.pricingKey
)
);
}

const vclArea = Math.ceil(area * 1.15);
const fixingsPacks = Math.ceil(area / 5);

results.push(
materialRow(
'Vapour Control Layer',
vclArea,
'm²',
'VCL allowed with approx. 15% overlap. Install on warm side of insulation.',
'vcl_m2'
),

materialRow(
'Insulation Tape / Fixings',
fixingsPacks,
'packs',
'Allowance for foil tape, fixings or mechanical support systems.',
'insulation_fixings_pack'
)
);

return results;
}

// ─── STAIRCASE ───────────────────────────────────────────────────────────────
export function calculateStaircase({ totalRise, width, material }) {
if (!totalRise || !width || !material) return [];

const round1 = (v) => Number(v.toFixed(1));
const round2 = (v) => Number(v.toFixed(2));

const riserHeight = 0.19;
const going = 0.25;

const stairWidthM = width > 10 ? width / 1000 : width;
const stairWidthMm = width > 10 ? Math.round(width) : Math.round(width * 1000);

const numRisers = Math.ceil(totalRise / riserHeight);
const actualRiser = totalRise / numRisers;

const totalGoing = round2(numRisers * going);
const stringerLength = round2(Math.sqrt(totalRise ** 2 + totalGoing ** 2));

const results = [
measurementRow(
'Number of Risers',
numRisers,
'steps',
`${Math.round(actualRiser * 1000)}mm riser height. Check final stair design against Part K requirements.`
),

measurementRow(
'Total Going',
totalGoing,
'm',
`${Math.round(going * 1000)}mm going per step allowed.`
),

measurementRow(
'Stringer Length',
stringerLength,
'm',
'Diagonal string length based on total rise and going.'
),
];

if (material === 'timber' || material === 'oak') {
const label = material === 'oak' ? 'Solid Oak' : 'Softwood Timber';
const treadKey = material === 'oak' ? 'oak_tread' : 'softwood_tread';

const treadCount = numRisers - 1;
const balusters = Math.ceil(treadCount * 2);
const handrailLength = round2(stringerLength + 0.3);

results.push(
materialRow(
`${label} Treads`,
treadCount,
'pcs',
`${treadCount} treads allowed at approx. ${Math.round(
going * 1000
)}mm going × ${stairWidthMm}mm width.`,
treadKey
),

materialRow(
`${label} Risers`,
numRisers,
'pcs',
`${numRisers} risers allowed. Approx. 18mm thickness.`,
'stair_riser'
),

materialRow(
`${label} Strings`,
2,
'pcs',
`2 stair strings allowed at approx. ${stringerLength}m length.`,
'stair_string'
),

materialRow(
'Newel Posts',
2,
'pcs',
'Top and bottom newel posts allowed.',
'newel_post'
),

materialRow(
'Balusters / Spindles',
balusters,
'pcs',
`${balusters} balusters allowed at approx. 2 per tread. Confirm spacing on final design.`,
'baluster'
),

materialRow(
'Handrail',
handrailLength,
'lin. m',
'Handrail length based on stair string run. Allow both sides if required by width/use.',
'handrail_m'
)
);
}

if (material === 'steel') {
const treadCount = numRisers - 1;

results.push(
materialRow(
'Steel Stringers',
2,
'pcs',
`2 fabricated steel stringers allowed at approx. ${stringerLength}m length.`,
'steel_stringer'
),

materialRow(
'Steel Treads',
treadCount,
'pcs',
`${treadCount} steel treads allowed. Final tread type to suit design specification.`,
'steel_tread'
),

materialRow(
'Steel Balustrade',
round1(stringerLength * 2),
'lin. m',
'Balustrade both sides including handrail allowance.',
'steel_balustrade_m'
)
);
}

if (material === 'concrete') {
const concreteVol = round2(((totalGoing * stairWidthM * totalRise) / 2) * 1.2);
const rebarLength = Math.ceil(numRisers * stairWidthM * 2 * 1.1);
const formworkArea = round1(totalGoing * stairWidthM);

results.push(
materialRow(
'Concrete Stair',
concreteVol,
'm³',
'In-situ concrete volume including approx. 20% allowance for waist, steps and landings.',
'ready_mix_m3'
),

materialRow(
'Rebar (10mm)',
rebarLength,
'lin. m',
'Indicative reinforcement allowance for stair waist and step reinforcement.',
'rebar_m'
),

materialRow(
'Formwork',
formworkArea,
'm²',
'Formwork allowance for soffit and sides of stair.',
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

export function calculatePainting({
length,
height,
coats,
surface,
paintType,
}) {
if (!length || !height || !coats || !surface || !paintType) {
return [];
}

const round1 = (v) => Number(v.toFixed(1));
const round2 = (v) => Number(v.toFixed(2));

const area = round2(length * height);

const baseRate = spreadRates[paintType] || 10;

const surfaceFactor =
surface === 'bare_brick'
? 0.6
: surface === 'plaster'
? 0.8
: 1;

const effectiveRate = baseRate * surfaceFactor;

const litresNeeded = round1(
(area * coats) / effectiveRate
);

const tins5L = Math.ceil(litresNeeded / 5);

const tins2_5L = Math.ceil(litresNeeded / 2.5);

const paintLabel =
paintType.charAt(0).toUpperCase() +
paintType.slice(1).replace(/_/g, ' ');

const results = [
measurementRow(
'Surface Area',
area,
'm²',
`${length}m × ${height}m area based on input dimensions.`
),

helperRow(
'Coverage Rate',
`${effectiveRate.toFixed(1)} m²/l`,
'',
`Adjusted coverage based on ${surface.replace('_', ' ')} surface condition.`
),

materialRow(
`${paintLabel} — Total Volume`,
litresNeeded,
'litres',
`${coats} coat${coats === 1 ? '' : 's'} applied.`,
'paint_litre'
),

materialRow(
'Primary Paint Supply (5L)',
tins5L,
'tins',
'Primary paint supply based on total calculated volume.',
'paint_tin_5l'
),

helperRow(
'2.5L Tins (Alternative)',
tins2_5L,
'tins',
'Optional for colour matching, touch-up work or smaller areas.'
),
];

if (primerNeeded[surface]) {
const primerLitres = round1(
area / (spreadRates.primer * surfaceFactor)
);

const primerTins = Math.ceil(primerLitres / 5);

results.push(
materialRow(
'Primer / Mist Coat',
primerTins,
'tins',
surface === 'plaster'
? 'Mist coat recommended using diluted emulsion or specialist plaster primer.'
: `Primer required for ${surface.replace('_', ' ')} surface.`,
'paint_tin_5l'
)
);
}

const rollers = Math.ceil(area / 40);

const tapeRolls = Math.ceil(
(length * 2 + height * 2) / 33
);

const dustSheets = Math.ceil(area / 10);

results.push(
materialRow(
'Roller Sleeves (medium pile)',
rollers,
'pcs',
`Approx. ${rollers} sleeves allowed based on coverage and replacement during use.`,
'roller_sleeve'
),

materialRow(
'Masking Tape (25mm)',
tapeRolls,
'rolls',
'Allowance based on perimeter coverage (33m per roll).',
'masking_tape_roll'
),

materialRow(
'Dust Sheets',
dustSheets,
'pcs',
'Protective covering based on approx. 10m² per sheet.',
'dust_sheet'
)
);

return results;
}