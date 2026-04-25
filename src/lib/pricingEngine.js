// UK guide pricing engine — Buildings Buddy
// These are average guide rates only, not live supplier prices.
// Keep this file simple and editable.

const UK_GUIDE_RATES = {
  // Walling
  brick_standard: 0.65, // per brick
  brick_engineering: 0.95, // per brick
  brick_facing: 0.85, // per brick
  concrete_block: 1.85, // per block
  walling_stone_tonne: 180, // per tonne

  // Mortar / concrete materials
  cement_bag_25kg: 7.5, // per bag
  building_sand_tonne: 55, // per tonne
  sharp_sand_tonne: 55, // per tonne
  aggregate_tonne: 55, // per tonne
  lime_bag_25kg: 16, // per bag
  plasticiser_bottle: 6, // per bottle

  // Concrete
  ready_mix_m3: 145, // per m³ guide
  rebar_m: 1.4, // per linear metre
  formwork_m2: 22, // per m²

  // Timber / boards
  cls_timber_m: 3.8, // per linear metre
  plasterboard_sheet: 12.5, // per 2400x1200 sheet
  chipboard_sheet: 17.5, // per sheet
  mesh_sheet: 42, // per mesh sheet

  // Roofing
  concrete_roof_tile: 1.05, // per tile
  clay_roof_tile: 1.35, // per tile
  slate_m2: 35, // per m²
  roof_sheet_m2: 28, // per m²
  roofing_membrane_m2: 1.3, // per m²
  roof_batten_m: 1.2, // per linear metre
  ridge_tile: 4.5, // per piece

  // Insulation
  insulation_m2: 8.5, // per m²
  mineral_wool_roll: 32, // per roll
  pir_sheet: 38, // per sheet
  eps_sheet: 18, // per sheet
  spray_foam_kit: 320, // per kit
  vcl_m2: 1.2, // per m²

  // Drainage
  drainage_pipe_m: 5.8, // per linear metre
  pipe_coupler: 4.5, // per piece
  pea_gravel_m3: 85, // per m³
  geotextile_m2: 1.5, // per m²
  inspection_chamber: 85, // per chamber

  // Plastering / decorating
  multi_finish_bag: 9.5, // per bag
  pva_tub: 18, // per 5L tub
  angle_bead: 3.5, // per piece
  joint_tape_m: 0.12, // per linear metre
  jointing_compound_bag: 16, // per bag
  paint_litre: 6, // per litre
  paint_tin_5l: 30, // per 5L tin
  roller_sleeve: 4.5,
  masking_tape_roll: 3.5,
  dust_sheet: 7.5,

  // Staircase
  softwood_tread: 28,
  oak_tread: 85,
  stair_riser: 18,
  stair_string: 55,
  newel_post: 65,
  baluster: 7,
  handrail_m: 18,
  steel_stringer: 180,
  steel_tread: 65,
};

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
  if (material.includes('concrete') && unit.includes('m³')) return UK_GUIDE_RATES.ready_mix_m3;
  if (material.includes('rebar')) return UK_GUIDE_RATES.rebar_m;
  if (material.includes('formwork')) return UK_GUIDE_RATES.formwork_m2;

  // Timber / sheet materials
  if (material.includes('total timber') || material.includes('handrail')) {
    return UK_GUIDE_RATES.cls_timber_m;
  }
  if (material.includes('timber studs') || material.includes('noggins') || material.includes('head & sole')) {
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
  if (material.includes('angle bead') || material.includes('corner bead')) return UK_GUIDE_RATES.angle_bead;
  if (material.includes('joint tape')) return UK_GUIDE_RATES.joint_tape_m;
  if (material.includes('jointing compound')) return UK_GUIDE_RATES.jointing_compound_bag;
  if (material.includes('total volume')) return UK_GUIDE_RATES.paint_litre;
  if (material.includes('5 litre tins') || material.includes('primer / mist coat')) return UK_GUIDE_RATES.paint_tin_5l;
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
  if (material.includes('balusters') || material.includes('spindles')) return UK_GUIDE_RATES.baluster;
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

    const lineTotal = qty * rate;
    total += lineTotal;

    return {
      ...row,
      rate: Number(rate.toFixed(2)),
      total: Number(lineTotal.toFixed(2)),
    };
  });

  return {
    items,
    total: Number(total.toFixed(2)),
  };
}