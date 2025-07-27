'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-context';
import { Languages } from 'lucide-react';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी (Hindi)' },
  { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' },
  { value: 'tulu', label: 'ತುಳು (Tulu)' },
  { value: 'kon', label: 'कोंकणी (Konkani)' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
      <SelectTrigger className="w-auto gap-2 text-base font-semibold border-2 border-primary bg-primary/10">
        <Languages className="h-5 w-5 text-primary"/>
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
