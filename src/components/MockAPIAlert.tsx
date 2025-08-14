import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { footballAPI, FootballAPI } from '@/config/api';
import { useTranslation } from '@/hooks/useTranslation';

interface MockAPIAlertProps {
  onRetry?: () => void;
}

const MockAPIAlert: React.FC<MockAPIAlertProps> = ({ onRetry }) => {
  const { currentLanguage } = useTranslation();
  const isUsingMockAPI = FootballAPI.isUsingMockAPI();

  if (!isUsingMockAPI) {
    return null;
  }

  const handleRetryRealAPI = () => {
  FootballAPI.forceRealAPI();
  footballAPI.clearCache();
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          {currentLanguage === 'ar' ? (
            <>
              <strong>وضع التطوير:</strong> يتم عرض بيانات تجريبية بسبب مشاكل CORS مع API Football.
              البيانات المعروضة هي للاختبار فقط.
            </>
          ) : (
            <>
              <strong>Mode développement:</strong> Données simulées affichées en raison de problèmes CORS avec l'API Football.
              Les données affichées sont uniquement à des fins de test.
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetryRealAPI}
          className="ml-3 border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          {currentLanguage === 'ar' ? 'محاولة API حقيقية' : 'Essayer l\'API réelle'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default MockAPIAlert;
