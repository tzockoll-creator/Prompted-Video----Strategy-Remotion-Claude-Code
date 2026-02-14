import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FilterProvider } from '@/context/filter-context';
import { Sidebar } from '@/components/layout/sidebar';
import { ExecutiveOverview } from '@/pages/executive-overview';
import { BranchComparison } from '@/pages/branch-comparison';
import { GeographicMap } from '@/pages/geographic-map';
import { DigitalTransformation } from '@/pages/digital-transformation';
import { WhatIfAnalysis } from '@/pages/what-if-analysis';

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <FilterProvider>
          <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 ml-64 p-6">
              <Routes>
                <Route path="/" element={<ExecutiveOverview />} />
                <Route path="/comparison" element={<BranchComparison />} />
                <Route path="/map" element={<GeographicMap />} />
                <Route path="/digital" element={<DigitalTransformation />} />
                <Route path="/what-if" element={<WhatIfAnalysis />} />
              </Routes>
            </main>
          </div>
        </FilterProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}
