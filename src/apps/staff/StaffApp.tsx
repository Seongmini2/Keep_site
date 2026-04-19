import { useFittingStore } from '../../store/useFittingStore';
import { Clock, CheckSquare, Shirt, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { mockProducts } from '../../mock/products';

export const StaffApp = () => {
  const { t, i18n } = useTranslation();
  const { requests, updateRequestStatus } = useFittingStore();

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">{t('KEEP Staff Portal')}</h1>
          <p className="text-muted mt-2">{t('Manage fitting requests for NFC customers.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="flex-col gap-4">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
            {t('No fitting requests at the moment.')}
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.requestId} className="card p-4 flex-col gap-4 animate-slide-in">
              <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">{t('Fitting Room')} {req.fittingRoomId}</span>
                    <span className={`status-badge ${req.status}`}>{t(req.status)}</span>
                  </div>
                  <div className="text-sm text-muted flex items-center gap-1">
                    <Clock size={14}/> {formatDistanceToNow(req.requestTime, { addSuffix: true, locale: i18n.language === 'ko' ? ko : enUS })}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {req.status === 'pending' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => updateRequestStatus(req.requestId, 'assigned')}
                    >
                      {t('Start Preparing')}
                    </button>
                  )}
                  {req.status === 'assigned' && (
                    <button 
                      className="btn btn-secondary"
                      style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}
                      onClick={() => updateRequestStatus(req.requestId, 'completed')}
                    >
                      <CheckSquare size={18} /> {t('Complete')}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
                  <Shirt size={16} /> {t('Requested Items')} ({req.products.length})
                </h4>
                <div className="flex flex-col gap-3">
                  {req.products.map((item, idx) => {
                    const productDef = mockProducts.find(p => p.id === item.productId);
                    return (
                      <div key={idx} className="flex gap-3 items-center p-3" style={{ background: 'var(--surface)', borderRadius: '8px' }}>
                        {productDef && <img src={productDef.imageUrl} alt={item.productName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted flex gap-2 mt-1">
                            <span>{t('Color')}: <strong style={{ color: 'var(--text-primary)' }}>{item.color}</strong></span>
                            <span>|</span>
                            <span>{t('Size')}: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong></span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
