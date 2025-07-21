'use client';
import { Leaf, HandCoins, Building2, History } from 'lucide-react';
import FeatureCard from '@/components/feature-card';
import PageHeader from '@/components/page-header';
import { useLanguage } from '@/contexts/language-context';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('crop_health_diagnosis_title'),
      description: t('crop_health_diagnosis_desc'),
      href: '/crop-diagnosis',
      icon: <Leaf className="h-12 w-12 text-primary" />,
    },
    {
      title: t('mandi_price_insights_title'),
      description: t('mandi_price_insights_desc'),
      href: '/mandi-prices',
      icon: <HandCoins className="h-12 w-12 text-primary" />,
    },
    {
      title: t('gov_schemes_info_title'),
      description: t('gov_schemes_info_desc'),
      href: '/gov-schemes',
      icon: <Building2 className="h-12 w-12 text-primary" />,
    },
     {
      title: t('query_history_title'),
      description: t('query_history_desc'),
      href: '/history',
      icon: <History className="h-12 w-12 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t('welcome_title')}
        subtitle={t('welcome_subtitle')}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.href}
              {...feature}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
