'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function FeatureCard({ title, description, href, icon }: FeatureCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
        <CardHeader>
          {icon}
          <CardTitle className="pt-4 text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardContent>
         <div className="p-6 pt-0">
           <div className="flex items-center text-primary font-semibold">
              <span>Go to feature</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
           </div>
        </div>
      </Card>
    </Link>
  );
}
