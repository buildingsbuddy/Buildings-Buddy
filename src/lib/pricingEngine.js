// UK guide pricing engine — Buildings Buddy
// These are average UK-wide guide rates only, not live supplier prices.
// Rates include a small estimating buffer inside addPricing().
// Keep this file simple and editable.

const UK_GUIDE_RATES = {
// Walling
brick_standard: 0.68, // per brick
brick_engineering: 1.0, // per brick
brick_facing: 0.85, // per brick
concrete_block: 1.75, // per block
walling_stone_tonne: 190, // per tonne

// Mortar / concrete materials
cement_bag_25kg: 8.2, // per bag
building_sand_tonne: 60, // per tonne
sharp_sand_tonne: 60, // per tonne
aggregate_tonne: 65, // per tonne
lime_bag_25kg: 18, // per bag
plasticiser_bottle: 7, // per bottle

// Concrete
ready_mix_m3: 155, // per m³ guide
rebar_m: 1.6, // per linear metre
formwork_m2: 25, // per m²

// Timber / boards
cls_timber_m: 4.5, // per linear metre
plasterboard_sheet: 14.5, // per 2400x1200 sheet
chipboard_sheet: 19, // per sheet
mesh_sheet: 45, // per mesh sheet

// Roofing
concrete_roof_tile: 1.15, // per tile
clay_roof_tile: 1.5, // per tile
slate_m2: 40, // per m²
roof_sheet_m2: 32, // per m²
roofing_membrane_m2: 1.8, // per m²
roof_batten_m: 1.4, // per linear metre
ridge_tile: 5.5, // per piece

// Insulation
insulation_m2: 10, // per m²
mineral_wool_roll: 35, // per roll
pir_sheet: 42, // per sheet
eps_sheet: 20, // per sheet
spray_foam_kit: 350, // per kit
vcl_m2: 1.5, // per m²

// Drainage
drainage_pipe_m: 6.5, // per linear metre
pipe_coupler: 5, // per piece
pea_gravel_m3: 95, // per m³
geotextile_m2: 1.8, // per m²
inspection_chamber: 95, // per chamber

// Plastering / decorating
multi_finish_bag: 10.5, // per bag
pva_tub: 20, // per 5L tub
angle_bead: 4, // per piece
joint_tape_m: 0.15, // per linear metre
jointing_compound_bag: 18, // per bag
paint_litre: 7, // per litre
paint_tin_5l: 34, // per 5L tin
roller_sleeve: 5, // per sleeve
masking_tape_roll: 4, // per roll
dust_sheet: 8, // per sheet

// Staircase
softwood_tread: 32, // per tread
oak_tread: 95, // per tread
stair_riser: 20, // per riser
stair_string: 65, // per string
newel_post: 75, // per post
baluster: 8, // per baluster/spindle
handrail_m: 22, // per linear metre
steel_stringer: 220, // per stringer
steel_tread: 75, // per tread
};

// Applied to priced line items only.
// This keeps estimates safer across UK regions/suppliers without changing calculator quantities.
const WASTE_FACTOR = 1.08;
const VARIATION_FACTOR = 1.05;

function normalise(value) {
return String(value || '').toLowerCase();
}

function isMeasurementOnly(row) {
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
const material = normalise(row.material);

return (
material.includes('packs / pallets') ||
material.includes(' packs') ||
material.includes('recommended') ||
material.includes('order')
);
}

function getRate(row) {
const material = normalise(row.material);
const unit = normalise(row.unit);

if (isMeasurementOnly(row) || isOrderingHelperRow(row)) return null;

// Walling
if (material.includes('engineering brick')) return UK_GUIDE_RATES.brick_engineering;
if (material.includes('facing brick')) return UK_GUIDE_RATES.brick_facing;
if (material.includes('brick')) return UK_GUIDE_RATES.brick_standard;

if (material.includes('concrete block') || material.includes('blocks')) {
return UK_GUIDE_RATES.concrete_block;
}

if (material.includes('walling stone') || material.includes('stone')) {
if (unit.includes('tonne')) return UK_GUIDE_RATES.walling_stone_tonne;
}

// Mortar / concrete materials
if (material.includes('cement')) return UK_GUIDE_RATES.cement_bag_25kg;
if (material.includes('building sand')) return UK_GUIDE_RATES.building_sand_tonne;
if (material.includes('sharp sand')) return UK_GUIDE_RATES.sharp_sand_tonne;
if (material.includes('aggregate')) return UK_GUIDE_RATES.aggregate_tonne;
if (material.includes('hydraulic lime')) return UK_GUIDE_RATES.lime_bag_25kg;
if (material.includes('plasticiser')) return UK_GUIDE_RATES.plasticiser_bottle;

// Concrete / reinforcement
if (material.includes('ready-mix')) return null; // alternative only, avoids double-counting

if (material.includes('concrete') && unit.includes('m³')) {
return UK_GUIDE_RATES.ready_mix_m3;
}

if (material.includes('rebar')) return UK_GUIDE_RATES.rebar_m;
if (material.includes('formwork')) return UK_GUIDE_RATES.formwork_m2;

// Timber / sheet materials
if (material.includes('total timber') || material.includes('handrail')) {
return UK_GUIDE_RATES.cls_timber_m;
}

if (
material.includes('timber studs') ||
material.includes('noggins') ||
material.includes('head & sole')
) {
return null; // total timber line prices this cleaner
}

if (material.includes('plasterboard')) return UK_GUIDE_RATES.plasterboard_sheet;
if (material.includes('chipboard')) return UK_GUIDE_RATES.chipboard_sheet;
if (material.includes('steel mesh')) return UK_GUIDE_RATES.mesh_sheet;

// Roofing
if (material.includes('concrete tiles')) return UK_GUIDE_RATES.concrete_roof_tile;
if (material.includes('clay tiles')) return UK_GUIDE_RATES.clay_roof_tile;

if (material.includes('ridge tiles') || material.includes('hip / valley tiles')) {
return UK_GUIDE_RATES.ridge_tile;
}

if (material.includes('slate')) return UK_GUIDE_RATES.slate_m2;
if (material.includes('sheet')) return UK_GUIDE_RATES.roof_sheet_m2;

if (material.includes('felt') || material.includes('membrane')) {
return UK_GUIDE_RATES.roofing_membrane_m2;
}

if (material.includes('batten')) return UK_GUIDE_RATES.roof_batten_m;

// Insulation
if (material.includes('mineral wool')) return UK_GUIDE_RATES.mineral_wool_roll;
if (material.includes('pir board')) return UK_GUIDE_RATES.pir_sheet;
if (material.includes('eps board')) return UK_GUIDE_RATES.eps_sheet;
if (material.includes('spray foam')) return UK_GUIDE_RATES.spray_foam_kit;

if (material.includes('cavity wall insulation') || material.includes('insulation')) {
if (unit.includes('m²')) return UK_GUIDE_RATES.insulation_m2;
}

if (material.includes('vapour control')) return UK_GUIDE_RATES.vcl_m2;

// Drainage
if (material.includes('drainage pipe')) return UK_GUIDE_RATES.drainage_pipe_m;
if (material.includes('coupler')) return UK_GUIDE_RATES.pipe_coupler;
if (material.includes('pea gravel')) return UK_GUIDE_RATES.pea_gravel_m3;
if (material.includes('geotextile')) return UK_GUIDE_RATES.geotextile_m2;
if (material.includes('inspection chamber')) return UK_GUIDE_RATES.inspection_chamber;

// Plaster / decorating
if (material.includes('multi-finish plaster')) return UK_GUIDE_RATES.multi_finish_bag;
if (material.includes('pva')) return UK_GUIDE_RATES.pva_tub;

if (material.includes('angle bead') || material.includes('corner bead')) {
return UK_GUIDE_RATES.angle_bead;
}

if (material.includes('joint tape')) return UK_GUIDE_RATES.joint_tape_m;
if (material.includes('jointing compound')) return UK_GUIDE_RATES.jointing_compound_bag;
if (material.includes('total volume')) return UK_GUIDE_RATES.paint_litre;

if (material.includes('5 litre tins') || material.includes('primer / mist coat')) {
return UK_GUIDE_RATES.paint_tin_5l;
}

if (material.includes('2.5 litre tins')) return null; // alternative only, avoids double-counting
if (material.includes('roller')) return UK_GUIDE_RATES.roller_sleeve;
if (material.includes('masking tape')) return UK_GUIDE_RATES.masking_tape_roll;
if (material.includes('dust sheets')) return UK_GUIDE_RATES.dust_sheet;

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
if (material.includes('steel balustrade')) return UK_GUIDE_RATES.handrail_m;

return null;
}

export function addPricing(results = []) {
let total = 0;

const items = results.map((row) => {
const rate = getRate(row);
const qty = Number(row.quantity);

if (!rate || !Number.isFinite(qty)) {
return {
...row,
rate: null,
total: null,
};
}

const adjustedRate = rate * VARIATION_FACTOR;
const adjustedQty = qty * WASTE_FACTOR;
const lineTotal = adjustedQty * adjustedRate;

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