'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLocation } from '@/contexts/location-context';
import { useLanguage } from '@/contexts/language-context';

export default function LocationSwitcher() {
  const { location, setLocation, fetchCurrentLocation, isFetching, loading } = useLocation();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [manualCity, setManualCity] = useState('');

  useEffect(() => {
    if (location) {
      setManualCity(location.city);
    }
  }, [location]);

  const handleSave = () => {
    if (manualCity) {
      setLocation({ city: manualCity });
      setIsOpen(false);
    }
  };

  const handleFetchLocation = () => {
    fetchCurrentLocation();
    // Dialog might be closed by the time fetch is complete, depending on user action.
    // If it's still open, we can close it upon success.
    // This is handled inside the context now.
    setIsOpen(false);
  }

  const displayLocation = location ? location.city : t('location_not_set');

  if (loading) {
    return (
       <Button variant="outline" className="w-auto gap-2 text-base font-semibold">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t('location_fetching')}</span>
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-auto gap-2 text-base font-semibold">
        <MapPin className="h-5 w-5 text-primary" />
        <span>{displayLocation}</span>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('location_title')}</DialogTitle>
          <DialogDescription>{t('location_subtitle')}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Button onClick={handleFetchLocation} disabled={isFetching} className="w-full">
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
            {t('use_current_location')}
          </Button>
          <div className="flex items-center space-x-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">{t('or_enter_manually')}</span>
            <Separator className="flex-1" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city-input" className="text-left">{t('city_label')}</Label>
            <Input
              id="city-input"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              placeholder={t('city_placeholder')}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>{t('save_location')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
