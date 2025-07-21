'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { summarizeGovernmentScheme, SummarizeGovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/page-header';
import VoiceInputButton from '@/components/voice-input-button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useHistory } from '@/hooks/use-history';
import { Loader2, Building2 } from 'lucide-react';

const FormSchema = z.object({
  schemeName: z.string().min(2, 'Scheme name is required.'),
  query: z.string().min(10, 'Query must be at least 10 characters.'),
});

type FormData = z.infer<typeof FormSchema>;

export default function GovSchemesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummarizeGovernmentSchemeOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { schemeName: '', query: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await summarizeGovernmentScheme(data);
      setResult(response);
      addHistoryItem({ type: 'scheme', query: data, response });
    } catch (error) {
      console.error(error);
      toast({ title: t('summary_error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('gov_schemes_title')} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('gov_schemes_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="schemeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{t('scheme_name_label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('scheme_name_placeholder')} {...field} className="text-base p-6" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{t('query_label')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                           <Textarea placeholder={t('query_placeholder')} {...field} className="text-base p-4" rows={3} />
                           <VoiceInputButton
                            disabled={loading}
                            onTranscript={(text) => form.setValue('query', text)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full text-lg p-6">
                  {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Building2 className="mr-2 h-6 w-6" />}
                  {t('get_summary_button')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {(loading || result) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{loading ? 'Getting Summary...' : 'Scheme Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="text-base leading-relaxed">
              {loading && <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> <p>{t('summary_placeholder')}</p></div>}
              {result && <p>{result.summary}</p>}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
