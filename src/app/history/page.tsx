'use client';

import Image from 'next/image';
import { useHistory, HistoryItem } from '@/hooks/use-history';
import { useLanguage } from '@/contexts/language-context';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Leaf, HandCoins, Building2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
          <Image src={item.query.image} alt="Queried crop image" width={100} height={100} className="rounded-lg object-cover" />
          <p className="text-base text-foreground flex-1">{item.response.diagnosis}</p>
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

export default function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { t } = useLanguage();

  const getTitle = (item: HistoryItem) => {
    switch (item.type) {
      case 'crop': return t('query_type_crop');
      case 'mandi': return `${t('query_type_mandi')} - ${item.query.crop}`;
      case 'scheme': return `${t('query_type_scheme')} - ${item.query.schemeName}`;
      default: return 'Query';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('history_title')}>
        {history.length > 0 && (
          <Button variant="destructive" onClick={clearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('clear_history_button')}
          </Button>
        )}
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {history.length === 0 ? (
          <Card className="text-center py-16">
            <CardHeader>
              <History className="mx-auto h-16 w-16 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle>{t('history_empty')}</CardTitle>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {history.map((item) => (
              <AccordionItem value={item.id} key={item.id} className="bg-card border rounded-lg">
                <AccordionTrigger className="p-4 text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-4">
                    {ICONS[item.type]}
                    <div className="text-left">
                      <span>{getTitle(item)}</span>
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
      </main>
    </div>
  );
}
