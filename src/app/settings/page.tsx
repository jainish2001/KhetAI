'use client';
import Image from 'next/image';
import { useHistory, HistoryItem } from '@/contexts/history-context';
import { useLanguage } from '@/contexts/language-context';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Leaf, HandCoins, Building2, Trash2, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const ICONS = {
  crop: <Leaf className="h-5 w-5 text-primary" />,
  mandi: <HandCoins className="h-5 w-5 text-primary" />,
  scheme: <Building2 className="h-5 w-5 text-primary" />,
};

const QueryDetails: React.FC<{ item: HistoryItem, t: (key: string) => string }> = ({ item, t }) => {
  switch(item.type) {
    case 'crop':
      return (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
             <Image src={item.query.image} alt="Queried crop image" width={100} height={100} className="rounded-lg object-cover" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{t('query_label')}: <span className="font-normal">{item.query.query}</span></p>
            <p className="mt-4 text-base text-foreground">{item.response.diagnosis}</p>
          </div>
        </div>
      );
    case 'mandi':
      return (
        <div>
          <p className="font-semibold">{t('crop_label')}: <span className="font-normal">{item.query.crop}</span></p>
          <p className="font-semibold">{t('location_label')}: <span className="font-normal">{item.query.location}</span></p>
          <p className="mt-4 text-base text-foreground">{item.response.summary}</p>
        </div>
      );
    case 'scheme':
      return (
        <div>
          <p className="font-semibold">{t('scheme_name_label')}: <span className="font-normal">{item.query.schemeName}</span></p>
          <p className="font-semibold">{t('query_label')}: <span className="font-normal">{item.query.query}</span></p>
          <p className="mt-4 text-base text-foreground">{item.response.summary}</p>
        </div>
      );
    default:
      return null;
  }
};


export default function SettingsPage() {
  const { history, loading, clearHistory } = useHistory();
  const { t } = useLanguage();

  const getTitle = (item: HistoryItem) => {
    switch (item.type) {
      case 'crop': return `${t('query_type_crop')} - ${item.query.query}`;
      case 'mandi': return `${t('query_type_mandi')} - ${item.query.crop}`;
      case 'scheme': return `${t('query_type_scheme')} - ${item.query.schemeName}`;
      default: return 'Query';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('settings')} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <HistoryIcon />
                <span>{t('history_title')}</span>
            </CardTitle>
            {history.length > 0 && (
              <Button variant="destructive" onClick={clearHistory}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('clear_history_button')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10">
                <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">{t('history_empty')}</h3>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {history.map((item) => (
                  <AccordionItem value={item.id} key={item.id} className="bg-muted/50 border rounded-lg">
                    <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                      <div className="flex items-center gap-4 text-left">
                        {ICONS[item.type]}
                        <div className="flex-1">
                          <span className="block truncate">{getTitle(item)}</span>
                          <p className="text-sm font-normal text-muted-foreground">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <QueryDetails item={item} t={t} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
