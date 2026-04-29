// UK guide pricing engine — Buildings Buddy
// Average UK-wide guide rates only, not live supplier prices.
// Pricing remains ex VAT.
// Safe professional upgrade:
// - Uses pricingKey metadata first.
// - Falls back to text matching for older saved calculations.
// - Measurement/helper rows stay unpriced.
// - Applies modest supplier variation only once.

const UK_GUIDE_RATES = {
// Walling
brick_standard: 0.68,
brick_engineering: 1.0,
brick_facing: 0.85,
concrete_block: 1.75,
concrete_block_140mm: 2.2,
concrete_block_dense: 1.9,
walling_stone_tonne: 190,

// Mortar / concrete materials
cement_bag_25kg: 8.2,
building_sand_tonne: 60,
sharp_sand_tonne: 60,
aggregate_tonne: 65,
lime_bag_25kg: 18,
plasticiser_bottle: 7,

// Concrete / groundworks
ready_mix_m3: 155,
rebar_m: 1.6,
formwork_m2: 25,
dpm_m2: 1.25,
sand_blinding_m3: 95,
mesh_sheet: 45,

// Timber / boards
structural_timber_m: 4.5,
cls_timber_m: 4.5,
plasterboard_sheet: 14.5,
chipboard_sheet: 19,
joist_hanger: 2.5,

// Roofing
concrete_roof_tile: 1.15,
clay_roof_tile: 1.5,
slate_m2: 40,
roof_sheet_m2: 32,
roofing_membrane_m2: 1.8,
roof_batten_m: 1.4,
ridge_tile: 5.5,

// Insulation
insulation_m2: 10,
mineral_wool_roll: 35,
pir_sheet: 42,
eps_sheet: 20,
spray_foam_kit: 350,
vcl_m2: 1.5,
insulation_fixings_pack: 8,

// Drainage
drainage_pipe_m: 6.5,
pipe_coupler: 5,
pea_gravel_m3: 95,
geotextile_m2: 1.8,
inspection_chamber: 95,

// Plastering / decorating
multi_finish_bag: 10.5,
pva_tub: 20,
angle_bead: 4,
joint_tape_m: 0.15,
jointing_compound_bag: 18,
drywall_screw: 0.03,
paint_litre: 7,
paint_tin_5l: 34,
roller_sleeve: 5,
masking_tape_roll: 4,
dust_sheet: 8,

// Wall accessories
wall_tie: 0.35,
dpc_membrane_m: 0.8,
cavity_tray: 4.5,

// Staircase
softwood_tread: 32,
oak_tread: 95,
stair_riser: 20,
stair_string: 65,
newel_post: 75,
baluster: 8,
handrail_m: 22,
steel_stringer: 220,
steel_tread: 75,
steel_balustrade_m: 75,
};

const VARIATION_FACTOR = 1.05;

function normalise(value) {
return String(value || '').toLowerCase();
}

function toNumber(value) {
const number = Number(String(value ?? '').replace(/,/g, ''));
return Number.isFinite(number) ? number : null;
}

function isMeasurementOnly(row) {
if (row?.orderable === false) return true;
if (row?.rowType === 'measurement' || row?.rowType === 'helper') return true;

const material = normalise(row.material);

return (
material.includes('area') ||
material.includes('volume required') ||
material.includes('recommended thickness') ||
material.includes('rafter length') ||
material.includes('number of risers') ||
material.includes('total going') ||
material.includes('stringer length') ||
material.includes('fall')
);
}

function isOrderingHelperRow(row) {
if (row?.rowType === 'helper') return true;

const material = normalise(row.material);

return (
material.includes('packs / pallets') ||
material.includes(' packs') ||
material.includes('recommended pipe order') ||
material.includes('recommended') ||
material.includes('order')
);
}

function getRateFromPricingKey(row) {
const key = row?.pricingKey;

if (!key) return null;

return UK_GUIDE_RATES[key] ?? null;
}

function getFallbackRate(row) {
const material = normalise(row.material);
const unit = normalise(row.unit);

// Walling
if (material.includes('engineering brick')) return UK_GUIDE_RATES.brick_engineering;
if (material.includes('facing brick')) return UK_GUIDE_RATES.brick_facing;
if (material.includes('brick')) return UK_GUIDE_RATES.brick_standard;

if (material.includes('140mm') && material.includes('block')) {
return UK_GUIDE_RATES.concrete_block_140mm;
}

if (material.includes('dense') && material.includes('block')) {
return UK_GUIDE_RATES.concrete_block_dense;
}

if (material.includes('concrete block') || material.includes('blocks')) {
return UK_GUIDE_RATES.concrete_block;
}

if ((material.includes('walling stone') || material.includes('stone')) && unit.includes('tonne')) {
return UK_GUIDE_RATES.walling_stone_tonne;
}

// Mortar / concrete materials
if (material.includes('cement')) return UK_GUIDE_RATES.cement_bag_25kg;
if (material.includes('building sand')) return UK_GUIDE_RATES.building_sand_tonne;
if (material.includes('sharp sand')) return UK_GUIDE_RATES.sharp_sand_tonne;
if (material.includes('aggregate')) return UK_GUIDE_RATES.aggregate_tonne;
if (material.includes('hydraulic lime')) return UK_GUIDE_RATES.lime_bag_25kg;
if (material.includes('plasticiser')) return UK_GUIDE_RATES.plasticiser_bottle;

// Concrete / reinforcement
if (material.includes('ready-mix')) return null;

if (material.includes('concrete') && unit.includes('m³')) {
return UK_GUIDE_RATES.ready_mix_m3;
}

if (material.includes('rebar')) return UK_GUIDE_RATES.rebar_m;
if (material.includes('formwork')) return UK_GUIDE_RATES.formwork_m2;
if (material.includes('dpm')) return UK_GUIDE_RATES.dpm_m2;
if (material.includes('sand blinding')) return UK_GUIDE_RATES.sand_blinding_m3;
if (material.includes('steel mesh')) return UK_GUIDE_RATES.mesh_sheet;

// Timber / boards
if (
material.includes('total timber') ||
material.includes('timber required') ||
material.includes('joist timber') ||
material.includes('noggin timber') ||
material.includes('rafter timber') ||
material.includes('batten') ||
material.includes('handrail')
) {
if (unit.includes('lin') || unit === 'm') {
return material.includes('batten')
? UK_GUIDE_RATES.roof_batten_m
: UK_GUIDE_RATES.structural_timber_m;
}
}

if (material.includes('joist hanger') || material.includes('hangers')) {
return UK_GUIDE_RATES.joist_hanger;
}

if (material.includes('plasterboard')) return UK_GUIDE_RATES.plasterboard_sheet;
if (material.includes('chipboard')) return UK_GUIDE_RATES.chipboard_sheet;

// Roofing
if (material.includes('concrete tiles')) return UK_GUIDE_RATES.concrete_roof_tile;
if (material.includes('clay tiles')) return UK_GUIDE_RATES.clay_roof_tile;

if (material.includes('ridge tiles') || material.includes('hip / valley tiles')) {
return UK_GUIDE_RATES.ridge_tile;
}

if (material.includes('slate')) {
return unit.includes('m²') ? UK_GUIDE_RATES.slate_m2 : UK_GUIDE_RATES.concrete_roof_tile;
}

if (material.includes('sheet')) return UK_GUIDE_RATES.roof_sheet_m2;

if (material.includes('felt') || material.includes('membrane')) {
return material.includes('geotextile')
? UK_GUIDE_RATES.geotextile_m2
: UK_GUIDE_RATES.roofing_membrane_m2;
}

// Insulation
if (material.includes('mineral wool')) return UK_GUIDE_RATES.mineral_wool_roll;
if (material.includes('pir board')) return UK_GUIDE_RATES.pir_sheet;
if (material.includes('eps board')) return UK_GUIDE_RATES.eps_sheet;
if (material.includes('spray foam')) return UK_GUIDE_RATES.spray_foam_kit;

if (material.includes('cavity wall insulation') || material.includes('insulation')) {
if (unit.includes('m²')) return UK_GUIDE_RATES.insulation_m2;
}

if (material.includes('vapour control')) return UK_GUIDE_RATES.vcl_m2;
if (material.includes('tape') || material.includes('fixings')) {
return UK_GUIDE_RATES.insulation_fixings_pack;
}

// Drainage
if (material.includes('drainage pipe')) return UK_GUIDE_RATES.drainage_pipe_m;
if (material.includes('coupler')) return UK_GUIDE_RATES.pipe_coupler;
if (material.includes('pea gravel')) return UK_GUIDE_RATES.pea_gravel_m3;
if (material.includes('geotextile')) return UK_GUIDE_RATES.geotextile_m2;
if (material.includes('inspection chamber')) return UK_GUIDE_RATES.inspection_chamber;

// Plaster / decorating
if (material.includes('multi-finish plaster')) return UK_GUIDE_RATES.multi_finish_bag;
if (material.includes('pva')) return UK_GUIDE_RATES.pva_tub;
if (material.includes('angle bead') || material.includes('corner bead')) return UK_GUIDE_RATES.angle_bead;
if (material.includes('joint tape')) return UK_GUIDE_RATES.joint_tape_m;
if (material.includes('jointing compound')) return UK_GUIDE_RATES.jointing_compound_bag;
if (material.includes('drywall screws')) return UK_GUIDE_RATES.drywall_screw;
if (material.includes('total volume')) return UK_GUIDE_RATES.paint_litre;

if (material.includes('5 litre tins') || material.includes('primer / mist coat')) {
return UK_GUIDE_RATES.paint_tin_5l;
}

if (material.includes('2.5 litre tins')) return null;
if (material.includes('roller')) return UK_GUIDE_RATES.roller_sleeve;
if (material.includes('masking tape')) return UK_GUIDE_RATES.masking_tape_roll;
if (material.includes('dust sheets')) return UK_GUIDE_RATES.dust_sheet;

// Wall accessories
if (material.includes('wall ties')) return UK_GUIDE_RATES.wall_tie;
if (material.includes('dpc')) return UK_GUIDE_RATES.dpc_membrane_m;
if (material.includes('cavity tray')) return UK_GUIDE_RATES.cavity_tray;

// Staircase
if (material.includes('softwood timber treads')) return UK_GUIDE_RATES.softwood_tread;
if (material.includes('solid oak treads')) return UK_GUIDE_RATES.oak_tread;
if (material.includes('risers')) return UK_GUIDE_RATES.stair_riser;
if (material.includes('strings')) return UK_GUIDE_RATES.stair_string;
if (material.includes('newel')) return UK_GUIDE_RATES.newel_post;

if (material.includes('balusters') || material.includes('spindles')) {
return UK_GUIDE_RATES.baluster;
}

if (material.includes('steel stringers')) return UK_GUIDE_RATES.steel_stringer;
if (material.includes('steel treads')) return UK_GUIDE_RATES.steel_tread;
if (material.includes('steel balustrade')) return UK_GUIDE_RATES.steel_balustrade_m;

return null;
}

function getRate(row) {
if (isMeasurementOnly(row) || isOrderingHelperRow(row)) return null;

return getRateFromPricingKey(row) ?? getFallbackRate(row);
}

export function addPricing(results = []) {
let total = 0;

const items = results.map((row) => {
const baseRate = getRate(row);
const qty = toNumber(row.quantity);

if (!baseRate || qty === null) {
return {
...row,
rate: null,
total: null,
};
}

const adjustedRate = baseRate * VARIATION_FACTOR;
const lineTotal = qty * adjustedRate;

total += lineTotal;

return {
...row,
rate: Number(adjustedRate.toFixed(2)),
total: Number(lineTotal.toFixed(2)),
};
});

return {
items,
total: Number(total.toFixed(2)),
};
}