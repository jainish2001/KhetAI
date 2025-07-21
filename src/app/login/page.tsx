'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/language-context';
import { LogIn, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const { t } = useLanguage();
  const { signInWithPhoneNumber } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPhoneNumber(`+91${phoneNumber}`);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setError('');
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      // Auth context will redirect on successful login
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };


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
          {!confirmationResult ? (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">{t('phone_number_label')}</Label>
                  <div className="flex items-center">
                    <span className="p-3 text-lg border rounded-l-md bg-muted">+91</span>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder={t('phone_number_placeholder')} 
                      required 
                      className="p-6 text-lg rounded-l-none"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full text-lg p-6" disabled={loading || phoneNumber.length !== 10}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {t('send_otp_button')}
                </Button>
                <div id="recaptcha-container"></div>
              </div>
            </form>
          ) : (
             <form onSubmit={handleVerifyOtp}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-base">{t('otp_label')}</Label>
                  <Input 
                    id="otp" 
                    type="text" 
                    placeholder={t('otp_placeholder')} 
                    required 
                    className="p-6 text-lg tracking-[0.5em] text-center"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full text-lg p-6" disabled={loading || otp.length !== 6}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {t('verify_otp_button')}
                </Button>
              </div>
            </form>
          )}
          {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
