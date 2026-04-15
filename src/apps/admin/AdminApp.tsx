import { useFittingStore } from '../../store/useFittingStore';
import { format } from 'date-fns';
import { LayoutDashboard, Users, Activity, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';

export const AdminApp = () => {
  const { t } = useTranslation();
  const { requests } = useFittingStore();

  const todayRequests = requests.filter(req => 
    new Date(req.createdAt).toDateString() === new Date().toDateString()
  ).length;
  
  const pendingRequests = requests.filter(req => req.status === 'PENDING').length;
  
  const completedRequests = requests.filter(req => req.status === 'COMPLETED').length;
  
  const completionRate = requests.length > 0 
    ? Math.round((completedRequests / requests.length) * 100) 
    : 0;

  return (
    <div className="app-container" style={{ maxWidth: '1400px' }}>
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">{t('KEEP Admin Dashboard')}</h1>
          <p className="text-muted mt-2">{t('Real-time overview of fitting requests and operations.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
          <button className="btn btn-secondary">
            <LayoutDashboard size={18} /> {t('Export Data')}
          </button>
        </div>
      </div>

      <div className="grid-cols-4 mb-8">
        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '0ms' }}>
          <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '50%', color: '#4f46e5' }}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t("Today's Requests")}</p>
            <h2 className="text-2xl font-bold">{todayRequests}</h2>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '50ms' }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t('Awaiting Prep')}</p>
            <h2 className="text-2xl font-bold">{pendingRequests}</h2>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t('Completion Rate')}</p>
            <h2 className="text-2xl font-bold">{completionRate}%</h2>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">{t('Live Request Log')}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('Time')}</th>
              <th>{t('Req ID')}</th>
              <th>{t('Product')}</th>
              <th>{t('Spec')}</th>
              <th>{t('Status')}</th>
              <th>{t('Elapsed')}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const elapsedMins = Math.floor((Date.now() - req.createdAt) / 60000);
              return (
                <tr key={req.requestId}>
                  <td className="font-medium">{format(req.createdAt, 'HH:mm:ss')}</td>
                  <td className="text-sm text-muted">{req.requestId.slice(-6)}</td>
                  <td className="font-semibold">{req.productName}</td>
                  <td className="text-sm">{req.color} / {req.size}</td>
                  <td>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>{t(req.status)}</span>
                  </td>
                  <td className="text-sm text-muted">
                    {req.status === 'COMPLETED' ? t('Done') : `${elapsedMins} ${t('min ago')}`}
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  {t('No request logs strictly available.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
