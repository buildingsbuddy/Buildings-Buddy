export const ALLOWANCE_OPTIONS = [
{ value: 'standard', label: 'Standard allowance included' },
{ value: '5', label: 'Extra safety allowance: +5%' },
{ value: '10', label: 'Extra safety allowance: +10%' },
];

export function getExtraAllowancePercent(value) {
const parsed = Number(value);
return Number.isFinite(parsed) ? parsed : 0;
}

export function roundQuantity(value, unit = '') {
if (!Number.isFinite(value)) return value;

const unitText = String(unit).toLowerCase();

if (
unitText.includes('pcs') ||
unitText.includes('sheets') ||
unitText.includes('bags') ||
unitText.includes('tubs') ||
unitText.includes('tins') ||
unitText.includes('bottles') ||
unitText.includes('rolls') ||
unitText.includes('packs') ||
unitText.includes('kit') ||
unitText.includes('steps') ||
unitText.includes('lengths')
) {
return Math.ceil(value);
}

if (unitText.includes('m³')) return Number(value.toFixed(3));
if (unitText.includes('tonnes')) return Number(value.toFixed(2));
if (unitText.includes('litres')) return Math.ceil(value);
if (unitText.includes('lin. m')) return Number(value.toFixed(2));
if (unitText.includes('m²')) return Number(value.toFixed(2));
if (unitText.includes('m total')) return Number(value.toFixed(3));
if (unitText === 'm') return Number(value.toFixed(2));

return Number(value.toFixed(2));
}

function canApplyAllowance(row, matcher) {
if (row?.orderable === false) return false;
if (row?.rowType === 'measurement' || row?.rowType === 'helper') return false;

return matcher(row);
}

export function withExtraAllowance(results, allowancePercent, matcher) {
if (!allowancePercent || allowancePercent <= 0) return results;

return results.map((row) => {
const quantity = Number(row.quantity);

if (!Number.isFinite(quantity) || !canApplyAllowance(row, matcher)) return row;

const adjusted = roundQuantity(
quantity * (1 + allowancePercent / 100),
row.unit
);

return {
...row,
quantity: adjusted,
notes: [
row.notes,
`Extra safety allowance of ${allowancePercent}% added. Base quantity: ${quantity} ${row.unit}.`,
]
.filter(Boolean)
.join(' '),
};
});
}

export function addUnitPackRow(rows, rowMatcher, packSize, label = 'Packs / Pallets') {
const size = Number(packSize);

if (!Number.isFinite(size) || size <= 0) return rows;

const extraRows = [];

rows.forEach((row) => {
if (row?.orderable === false) return;
if (!rowMatcher(row)) return;

const quantity = Number(row.quantity);

if (!Number.isFinite(quantity)) return;

const packs = Math.ceil(quantity / size);
const ordered = packs * size;
const spare = ordered - quantity;

extraRows.push({
material: `${row.material} ${label}`,
quantity: packs,
unit: 'packs',
notes: `${size} units per pack/pallet. Orders ${ordered} units total with approx ${spare} spare.`,
orderable: false,
rowType: 'helper',
sourceMaterial: row.material,
});
});

return [...rows, ...extraRows];
}

export function addLengthOrderRow(
rows,
sourceMaterialName,
stockLength,
outputMaterialName
) {
const length = Number(stockLength);

if (!Number.isFinite(length) || length <= 0) return rows;

const source = rows.find((row) =>
String(row.material || '')
.toLowerCase()
.includes(sourceMaterialName.toLowerCase())
);

if (!source) return rows;

const quantity = Number(source.quantity);

if (!Number.isFinite(quantity)) return rows;

const lengthsNeeded = Math.ceil(quantity / length);
const totalOrdered = lengthsNeeded * length;
const spare = totalOrdered - quantity;

return [
...rows,
{
material: outputMaterialName,
quantity: lengthsNeeded,
unit: 'lengths',
notes: `${length}m stock lengths. Orders ${totalOrdered.toFixed(
2
)}m total with approx ${spare.toFixed(2)}m spare.`,
orderable: false,
rowType: 'helper',
sourceMaterial: source.material,
},
];
}