// 🧠 Material Intelligence Layer — Buildings Buddy

function normalise(value) {
return String(value || '').toLowerCase();
}

export function enrichMaterials(results = []) {
const extra = [];

results.forEach((row) => {
const material = normalise(row.material);
const qty = Number(row.quantity);

if (!Number.isFinite(qty)) return;

// ─── TIMBER / FLOORING ─────────────────────────────
if (material.includes('joist')) {
extra.push({
material: 'Joist Hangers',
quantity: qty * 2,
unit: 'pcs',
notes: 'Both ends of each joist',
});

extra.push({
material: 'Joist Nails / Fixings',
quantity: Math.ceil(qty * 0.5),
unit: 'boxes',
notes: 'Approx. 1 box per 2 joists',
});
}

if (material.includes('noggin')) {
extra.push({
material: 'Timber Screws (100mm)',
quantity: Math.ceil(qty * 4),
unit: 'pcs',
notes: 'Fixing noggins to joists',
});
}

if (material.includes('chipboard')) {
extra.push({
material: 'Flooring Screws (50mm)',
quantity: Math.ceil(qty * 25),
unit: 'pcs',
notes: '~25 fixings per board',
});

extra.push({
material: 'PVA Wood Adhesive',
quantity: Math.ceil(qty / 10),
unit: 'bottles',
notes: 'For T&G joints',
});
}

// ─── PLASTERBOARD ─────────────────────────────
if (material.includes('plasterboard')) {
extra.push({
material: 'Drywall Screws',
quantity: qty * 32,
unit: 'pcs',
notes: 'Standard fixing rate per sheet',
});

extra.push({
material: 'Joint Tape',
quantity: Math.ceil(qty * 3),
unit: 'lin. m',
notes: 'For board joints',
});

extra.push({
material: 'Jointing Compound',
quantity: Math.ceil(qty / 8),
unit: 'bags',
notes: 'For finishing joints',
});
}

// ─── WALLING ─────────────────────────────
if (material.includes('brick') || material.includes('block')) {
extra.push({
material: 'Brick Ties',
quantity: Math.ceil(qty * 0.04),
unit: 'pcs',
notes: 'Approx 2.5 per m²',
});

extra.push({
material: 'Plasticiser',
quantity: Math.ceil(qty / 500),
unit: 'bottles',
notes: 'For mortar workability',
});
}

// ─── ROOFING ─────────────────────────────
if (material.includes('tile') || material.includes('slate')) {
extra.push({
material: 'Roofing Nails / Clips',
quantity: Math.ceil(qty * 1.1),
unit: 'pcs',
notes: 'Fixing tiles/slates',
});
}

if (material.includes('batten')) {
extra.push({
material: 'Batten Nails',
quantity: Math.ceil(qty * 5),
unit: 'pcs',
notes: 'Fixing battens to rafters',
});
}

// ─── DRAINAGE ─────────────────────────────
if (material.includes('pipe')) {
extra.push({
material: 'Pipe Bedding Gravel',
quantity: Math.ceil(qty * 0.1),
unit: 'm³',
notes: 'Support and surround pipe',
});
}
});

return [...results, ...extra];
}