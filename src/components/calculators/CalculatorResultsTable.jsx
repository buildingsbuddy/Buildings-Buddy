import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(Number(value));
}

function toNumber(value) {
  const number = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(number) ? number : 0;
}

export default function CalculatorResultsTable({
  results,
  showPricing = false,
  pricingTotal = 0,
}) {
  const groupedSections = useMemo(() => {
    if (!results || results.length === 0) return [];

    const sections = {};

    results.forEach((item) => {
      const section = item.estimate_section || 'Calculation Results';

      if (!sections[section]) {
        sections[section] = {
          name: section,
          rows: [],
          total: 0,
        };
      }

      sections[section].rows.push(item);

      if (showPricing) {
        sections[section].total += toNumber(item.total);
      }
    });

    return Object.values(sections);
  }, [results, showPricing]);

  if (!results || results.length === 0) return null;

  const hasMultipleSections = groupedSections.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border border-border rounded-lg overflow-hidden"
    >
      <div className="bg-primary px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          <h3 className="font-heading font-semibold text-primary-foreground">
            {hasMultipleSections ? 'Estimate Results' : 'Calculation Results'}
          </h3>
        </div>

        {showPricing && (
          <div className="text-sm font-semibold text-primary-foreground">
            Est. Total: {money(pricingTotal)}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Material</TableHead>
            <TableHead className="font-semibold text-right">Quantity</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>

            {showPricing && (
              <>
                <TableHead className="font-semibold text-right">Rate</TableHead>
                <TableHead className="font-semibold text-right">Est. Cost</TableHead>
              </>
            )}

            <TableHead className="font-semibold">Notes</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {groupedSections.map((section) => (
            <React.Fragment key={section.name}>
              {hasMultipleSections && (
                <TableRow className="bg-accent/10 hover:bg-accent/10">
                  <TableCell
                    colSpan={showPricing ? 6 : 4}
                    className="font-heading font-bold text-accent"
                  >
                    {section.name}
                  </TableCell>
                </TableRow>
              )}

              {section.rows.map((item, i) => (
                <TableRow key={`${section.name}-${i}`} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{item.material}</TableCell>

                  <TableCell className="text-right font-semibold text-lg">
                    {item.quantity}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.unit}
                    </Badge>
                  </TableCell>

                  {showPricing && (
                    <>
                      <TableCell className="text-right text-sm">
                        {item.rate ? money(item.rate) : '—'}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {item.total ? money(item.total) : '—'}
                      </TableCell>
                    </>
                  )}

                  <TableCell className="text-sm text-muted-foreground">
                    {item.notes || '—'}
                  </TableCell>
                </TableRow>
              ))}

              {showPricing && hasMultipleSections && (
                <TableRow className="bg-muted/30">
                  <TableCell
                    colSpan={4}
                    className="font-semibold text-right"
                  >
                    {section.name} Subtotal
                  </TableCell>

                  <TableCell className="font-bold text-right">
                    {money(section.total)}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    Guide price
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}

          {showPricing && (
            <TableRow className="bg-muted/50">
              <TableCell colSpan={4} className="font-bold text-right">
                Estimated Total
              </TableCell>

              <TableCell className="font-bold text-right">
                {money(pricingTotal)}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground">
                Guide price only
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}