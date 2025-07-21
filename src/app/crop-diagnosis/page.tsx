'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';
import { useHistory } from '@/contexts/history-context';
import { diagnoseCropDisease } from '@/ai/flows/diagnose-crop-disease';

const FormSchema = z.object({
  image: z.any().refine((file) => file, 'Image is required.'),
});

type FormData = z.infer<typeof FormSchema>;

export default function CropDiagnosisPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addHistoryItem } = useHistory();
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ diagnosis: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setDataUri(null);
    setResult(null);
    form.reset();
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = async () => {
    if (!dataUri) {
      toast({ title: 'No image selected', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await diagnoseCropDisease({ photoDataUri: dataUri });
      setResult(response);
      addHistoryItem({ type: 'crop', query: { image: dataUri }, response });
    } catch (error) {
      console.error(error);
      toast({ title: t('diagnosis_error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader title={t('crop_health_diagnosis_title')} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('upload_crop_photo')}</CardTitle>
            <CardDescription>{t('upload_image_cta')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <label htmlFor="file-upload" className="w-full cursor-pointer">
                <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg border-border hover:bg-muted transition-colors">
                  {preview ? (
                    <>
                      <Image src={preview} alt="Crop preview" layout="fill" objectFit="contain" className="rounded-lg p-2" />
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={(e) => { e.preventDefault(); clearImage(); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{t('upload_image_cta')}</p>
                    </div>
                  )}
                </div>
              </label>
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={loading} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onSubmit} disabled={!preview || loading} className="w-full text-lg p-6">
              {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Leaf className="mr-2 h-6 w-6" />}
              {t('diagnose_button')}
            </Button>
          </CardFooter>
        </Card>

        {(loading || result) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{loading ? 'Diagnosing...' : 'Diagnosis Result'}</CardTitle>
            </CardHeader>
            <CardContent className="text-base leading-relaxed">
              {loading && <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> <p>{t('diagnosis_placeholder')}</p></div>}
              {result && <p>{result.diagnosis}</p>}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
