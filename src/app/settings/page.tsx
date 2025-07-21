'use client';
import PageHeader from '@/components/page-header';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('settings')} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon />
              <span>{t('settings')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Future settings will be available here, such as farm type, profile information, and notification preferences.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
