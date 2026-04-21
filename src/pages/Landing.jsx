import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calculator, FolderOpen, Shield, ArrowRight, CheckCircle2, Zap, FileDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const features = [
  { icon: Calculator, title: 'Accurate Calculations', desc: 'Professional-grade material estimates for walls (brick, block & stone), roofing, flooring, concrete, insulation, staircases, painting and more.' },
  { icon: FileDown, title: 'Export to PDF', desc: 'Print or save any calculation result as a clean PDF — share with clients, suppliers or your team instantly.' },
  { icon: FolderOpen, title: 'Project Management', desc: 'Save and organise your jobs. Return anytime to review or update calculations.' },
  { icon: Users, title: 'Multi-User Access', desc: 'Company plan includes up to 5 team members — everyone on the same account.' },
  { icon: Shield, title: 'UK Building Standards', desc: 'All calculations reference current building regulations and industry best practices.' },
];

const calculators = [
  'Wall Construction', 'Stud Walls', 'Pitched Roofing', 'Flooring',
  'Plasterboard', 'Plaster Skim', 'Drainage',
  'Concrete Mix', 'Insulation', 'Staircase', 'Painting & Decorating',
];

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">Buildings Buddy</span>
          </div>
          <Button onClick={handleGetStarted} className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Professional Construction Calculator
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Calculate Materials<br />
              <span className="text-accent">With Confidence</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              The go-to platform for tradespeople, DIY enthusiasts, and small companies to accurately estimate construction materials. No more guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleLearnMore}>
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculators grid */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold mb-8">11 Professional Calculators</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {calculators.map(c => (
              <div key={c} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-center mb-12">Why Buildings Buddy?</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-primary-foreground/70 mb-10">Start with a 5-day free trial. Cancel anytime.</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { name: 'DIY Plan', monthly: '£19', yearly: '£190', desc: 'All 11 calculators, PDF export, up to 20 projects' },
              { name: 'Company Plan', monthly: '£22', yearly: '£224', desc: 'Everything in DIY + unlimited projects & multi-user access (up to 5)' },
            ].map(plan => (
              <div key={plan.name} className="p-6 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-left">
                <h3 className="font-heading font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-sm text-primary-foreground/60 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.monthly}</span>
                  <span className="text-primary-foreground/60">/mo</span>
                </div>
                <p className="text-sm text-primary-foreground/50 mb-4">or {plan.yearly}/year</p>
              </div>
            ))}
          </div>
          <Button size="lg" onClick={handleGetStarted} className="mt-10 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-base px-8">
            Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Buildings Buddy</span>
          </div>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}