import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function CalculatorCard({ title, description, icon: Icon, path, color }) {
  return (
    <Link to={path}>
      <Card className="group hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
          <div className="flex items-center text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            Open Calculator <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}