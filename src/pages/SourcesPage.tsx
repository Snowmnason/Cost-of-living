import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function SourcesPage() {
  return (
    <div className="flex-1 flex flex-col items-center px-10 py-14">
      <div className="w-full max-w-5xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold tracking-tight">Data Sources & Methodology</h1>
          <p className="text-2xl" style={{ color: 'var(--muted-foreground)' }}>
            This project aggregates publicly available wage, housing, and tax data from federal agencies and industry datasets. Sources were selected based on availability, geographic coverage, update frequency, and consistency across national, state, metropolitan, and county-level comparisons.
          </p>
          <p className="text-2xl" style={{ color: 'var(--muted-foreground)' }}> updated as newer datasets become available. Unless otherwise noted, the most recent available datasets at the time of development were used.
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
        >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="wage-data">
            <AccordionTrigger>Wage Data</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">U.S. Bureau of Labor Statistics (BLS) — Occupational Employment and Wage Statistics (OEWS)</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://www.bls.gov/oes/tables.htm" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.bls.gov/oes/tables.htm</a>
                  </p>
                  <p className="text-sm text-foreground/70 mb-2"><strong>Datasets Used:</strong></p>
                  <ul className="text-sm text-foreground/70 space-y-1 ml-4">
                    <li>• National Occupational Employment and Wage Estimates</li>
                    <li>• State Occupational Employment and Wage Estimates</li>
                    <li>• Metropolitan and Nonmetropolitan Area Occupational Employment and Wage Estimates</li>
                  </ul>
                  <p className="text-sm text-foreground/70 mt-2"><strong>Dataset Year:</strong> 2024</p>
                  <p className="text-sm text-foreground/70 mt-2">The 2024 release was the most recent complete dataset available at the time of implementation.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="housing-data">
            <AccordionTrigger>Housing Data</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">HUD Fair Market Rent (FMR)</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://www.huduser.gov/portal/datasets/fmr.html#2025" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.huduser.gov/portal/datasets/fmr.html#2025</a>
                  </p>
                  <p className="text-sm text-foreground/70 mt-2">Used for regional fair market rent estimates and baseline housing cost comparisons.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Zillow Research Data (ZORI)</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.zillow.com/research/data/</a>
                  </p>
                  <p className="text-sm text-foreground/70 mb-2"><strong>Datasets Used:</strong></p>
                  <ul className="text-sm text-foreground/70 space-y-1 ml-4">
                    <li>• ZORI (Smoothed): Single Family Residence Time Series ($) — Metro & U.S.</li>
                    <li>• ZORI (Smoothed): All Homes Plus Multifamily Time Series ($) — Metro & U.S.</li>
                    <li>• ZORI (Smoothed): All Homes Plus Multifamily Time Series ($) — County</li>
                  </ul>
                  <p className="text-sm text-foreground/70 mt-2">These datasets were selected to provide broader rental market coverage and improve comparability between single-family and multifamily housing markets.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tax-data">
            <AccordionTrigger>Tax Data</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">State & Local Sales Tax Rates</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://taxfoundation.org/data/all/state/sales-tax-rates/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://taxfoundation.org/data/all/state/sales-tax-rates/</a>
                  </p>
                  <p className="text-sm text-foreground/70 mb-2"><strong>Dataset Year:</strong> 2026</p>
                  <p className="text-sm text-foreground/70">Used for state and local sales tax calculations and comparisons.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Federal Income Tax Rates & Brackets</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://www.irs.gov/filing/federal-income-tax-rates-and-brackets" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.irs.gov/filing/federal-income-tax-rates-and-brackets</a>
                  </p>
                  <p className="text-sm text-foreground/70 mt-2">Used for estimated federal income tax calculations.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">State & Local Tax Bracket & Rates</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/</a>
                  </p>
                  <p className="text-sm text-foreground/70"><strong>Dataset Year:</strong> 2026</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="internet-data">
            <AccordionTrigger>Internet Data</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">BroadbandNow — County Broadband Statistics</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://broadbandnow.com/research/county-broadband-statistics" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://broadbandnow.com/research/county-broadband-statistics</a>
                  </p>
                  <p className="text-sm text-foreground/70">Used for county-level broadband pricing, competition, and coverage data.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">BroadbandNow — Home Internet Costs by State</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://broadbandnow.com/research/home-internet-costs-by-state" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://broadbandnow.com/research/home-internet-costs-by-state</a>
                  </p>
                  <p className="text-sm text-foreground/70">Used for state-level home internet cost comparisons.</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-foreground/70"><strong>Notes:</strong> Internet pricing data may vary by provider, service availability, and promotional pricing. County and state broadband datasets may use different update schedules or methodologies.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mobile-data">
            <AccordionTrigger>Mobile Provider Data</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm text-foreground/70">
                <p>Mobile plan pricing was collected directly from major carrier websites, including AT&T, T-Mobile, and Verizon.</p>
                <p>Estimated plan pricing was gathered for:</p>
                <ul className="ml-4 space-y-1">
                  <li>• 1 line</li>
                  <li>• 2 lines</li>
                  <li>• 3 lines</li>
                  <li>• 4 lines</li>
                  <li>• 5 lines</li>
                </ul>
                <p>States were assigned a provider based on overall market popularity and regional carrier presence at the time of implementation.</p>
                <p>An alternative low-cost comparison sheet was also created using carriers that operate on the same underlying networks:</p>
                <ul className="ml-4 space-y-1">
                  <li>• AT&T / Cricket</li>
                  <li>• Verizon / Visible</li>
                  <li>• T-Mobile / Mint Mobile</li>
                </ul>
                <p>This allows for comparisons between traditional major carrier pricing and lower-cost alternatives using similar network infrastructure.</p>
                <p>Pricing estimates are intended for comparison purposes only and may vary based on promotions, taxes, fees, device financing, trade-in offers, or plan changes.</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="electricity-data">
            <AccordionTrigger>Electricity Data</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">U.S. Energy Information Administration (EIA)</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    <strong>Source:</strong> <a href="https://www.eia.gov/electricity/sales_revenue_price/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://www.eia.gov/electricity/sales_revenue_price/</a>
                  </p>
                  <p className="text-sm text-foreground/70">Used for 2024 average monthly residential electricity consumption data (kWh).</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger>Notes & Limitations</AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-foreground/70 space-y-2 ml-4">
                <li>• Data sources may use different update schedules and methodologies.</li>
                <li>• Geographic boundaries between datasets (metro, county, state, etc.) may not align perfectly.</li>
                <li>• Housing estimates represent market-level averages and may not reflect individual lease prices or local neighborhood conditions.</li>
                <li>• Tax calculations are intended for estimation and comparison purposes only and should not be considered financial or legal advice.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>
      </div>
    </div>
  )
}
