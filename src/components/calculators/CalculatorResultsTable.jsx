import React from 'react';
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

export default function CalculatorResultsTable({
  results,
  showPricing = false,
  pricingTotal = 0,
}) {
  if (!results || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border border-border rounded-lg overflow-hidden"
    >
      <div className="bg-primary px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          <h3 className="font-heading font-semibold text-primary-foreground">
            Calculation Results
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
          {results.map((item, i) => (
            <TableRow key={i} className="hover:bg-muted/30">
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

          {showPricing && (
            <TableRow className="bg-muted/40">
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