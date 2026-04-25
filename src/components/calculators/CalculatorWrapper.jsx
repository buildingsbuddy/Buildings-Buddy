import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, Save, ClipboardList } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/lib/subscriptionContext';
import PaywallModal from '@/components/PaywallModal';
import CalculatorResultsTable from './CalculatorResultsTable';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DIY_PROJECT_LIMIT = 20;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getResultGroup(row) {
  const material = String(row.material || '').toLowerCase();

  if (material.includes('pack') || material.includes('pallet')) return 'Ordering';
  if (material.includes('area') || material.includes('volume')) return 'Measurements';
  if (material.includes('screw') || material.includes('fixing')) return 'Fixings';

  return 'Materials';
}

function groupResults(results = []) {
  const groups = {
    Measurements: [],
    Materials: [],
    Fixings: [],
    Ordering: [],
  };

  results.forEach((row) => {
    const group = getResultGroup(row);
    groups[group].push(row);
  });

  return Object.entries(groups).filter(([, rows]) => rows.length > 0);
}

export default function CalculatorWrapper({
  title,
  icon: Icon,
  children,
  onCalculate,
  calcType,
  getSavePayload,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const sub = useSubscription();

  const [results, setResults] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleCalculate = () => {
    if (!sub.canCalculate) {
      setShowPaywall(true);
      return;
    }

    const calcResults = onCalculate();
    if (calcResults) setResults(calcResults);
  };

  const handleExportPDF = () => {
    if (!results) return;

    const groupedRows = groupResults(results)
      .map(([groupName, rows]) => {
        const rowsHtml = rows
          .map(
            (r) => `
              <tr>
                <td>${escapeHtml(r.material)}</td>
                <td style="text-align:right;font-weight:600">${escapeHtml(r.quantity)}</td>
                <td>${escapeHtml(r.unit)}</td>
                <td style="color:#555">${escapeHtml(r.notes || '')}</td>
              </tr>`
          )
          .join('');

        return `
          <tr style="background:#eef2f7;font-weight:700;">
            <td colspan="4">${groupName}</td>
          </tr>
          ${rowsHtml}
        `;
      })
      .join('');

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial; padding: 32px; }
            h1 { margin-bottom: 5px; }
            .sub { color:#666; margin-bottom:20px; }
            table { width:100%; border-collapse: collapse; }
            th { background:#1e2d4d; color:white; padding:8px; }
            td { padding:8px; border-bottom:1px solid #eee; }
            .footer { margin-top:25px; font-size:11px; color:#666; line-height:1.6; }
          </style>
        </head>
        <body>

          <h1>${title}</h1>
          <p class="sub">Buildings Buddy — Material Estimate & Cost Guide</p>

          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${groupedRows}
            </tbody>
          </table>

          <div class="footer">
            <strong>Important:</strong> Material quantities and costs are provided as estimating guidance only.<br><br>

            Quantities may include standard allowances for waste, overlaps and cutting where applicable.
            Any additional allowance is only applied when selected by the user.<br><br>

            Material prices are based on typical UK supply rates and may vary by supplier, region,
            availability and specification.<br><br>

            Labour, plant, delivery, waste removal, profit, overheads and VAT are not included.<br><br>

            Always verify quantities, specifications and costs against project drawings, site conditions,
            supplier quotations and current Building Regulations before ordering or commencing work.
          </div>

        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <Link to="/calculators" className="mb-4 flex items-center text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5" />}
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {children}

          <div className="flex gap-2">
            <Button onClick={handleCalculate}>
              Calculate Materials
            </Button>

            {results && (
              <>
                <Button variant="outline" onClick={handleExportPDF}>
                  <FileDown className="w-4 h-4 mr-1" /> Export PDF
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <CalculatorResultsTable results={results} />
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}