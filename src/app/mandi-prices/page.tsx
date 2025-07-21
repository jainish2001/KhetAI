'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import VoiceInputButton from '@/components/voice-input-button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useHistory } from '@/contexts/history-context';
import { Loader2, HandCoins } from 'lucide-react';
import { getMandiPriceInsights } from '@/ai/flows/get-mandi-price-insights';

const FormSchema = z.object({
  crop: z.string().min(2, 'Crop is required.'),
  location: z.string().min(2, 'Location is required.'),
});

type FormData = z.infer<typeof FormSchema>;

export default function MandiPricesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { crop: '', location: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await getMandiPriceInsights(data);
      setResult(response);
      addHistoryItem({ type: 'mandi', query: data, response });
    } catch (error) {
      console.error(error);
      toast({ title: t('insights_error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('mandi_prices_title')} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('mandi_prices_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="crop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{t('crop_label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('crop_placeholder')} {...field} className="text-base p-6" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{t('location_label')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                           <Input placeholder={t('location_placeholder')} {...field} className="text-base p-6" />
                           <VoiceInputButton
                            disabled={loading}
                            onTranscript={(text) => form.setValue('location', text)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full text-lg p-6">
                  {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <HandCoins className="mr-2 h-6 w-6" />}
                  {t('get_insights_button')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {(loading || result) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{loading ? 'Getting Insights...' : 'Mandi Price Insights'}</CardTitle>
            </CardHeader>
            <CardContent className="text-base leading-relaxed">
              {loading && <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> <p>{t('insights_placeholder')}</p></div>}
              {result && <p>{result.summary}</p>}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
