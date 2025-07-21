'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import { LogIn } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">{t('login_title')}</CardTitle>
          <CardDescription>{t('login_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base">{t('phone_number_label')}</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder={t('phone_number_placeholder')} 
                required 
                className="p-6 text-lg"
              />
            </div>
            <Button type="submit" className="w-full text-lg p-6">
              <LogIn className="mr-2 h-5 w-5" />
              {t('send_otp_button')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
