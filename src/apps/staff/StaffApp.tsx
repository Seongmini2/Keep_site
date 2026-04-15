import { useFittingStore } from '../../store/useFittingStore';
import { Clock, CheckSquare, Shirt } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ThemeToggle } from '../../components/ThemeToggle';

export const StaffApp = () => {
  const { requests, updateRequestStatus } = useFittingStore();

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">KEEP Staff Portal</h1>
          <p className="text-muted mt-2">Manage incoming fitting requests.</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex-col gap-4">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
            No fitting requests at the moment.
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.requestId} className="card p-4 flex justify-between items-center flex-wrap gap-4 animate-slide-in">
              <div className="flex gap-4 items-center flex-wrap">
                <img 
                  src={req.imageUrl} 
                  alt={req.productName} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted">ID: {req.requestId.slice(-6)}</span>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{req.productName}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted">
                    <span className="flex items-center gap-1"><Shirt size={14}/> {req.color} / {req.size}</span>
                    <span className="flex items-center gap-1"><Clock size={14}/> {formatDistanceToNow(req.createdAt)} ago</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full" style={{ justifyContent: 'flex-start', flex: '1 1 auto', minWidth: 'fit-content' }}>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  {req.status === 'PENDING' && (
                    <button 
                      className="btn btn-primary"
                      onClick={() => updateRequestStatus(req.requestId, 'PREPARING')}
                    >
                      Start Preparing
                    </button>
                  )}
                  {req.status === 'PREPARING' && (
                    <button 
                      className="btn btn-secondary"
                      style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}
                      onClick={() => updateRequestStatus(req.requestId, 'READY')}
                    >
                      <CheckSquare size={18} /> Mark as Ready
                    </button>
                  )}
                  {req.status === 'READY' && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => updateRequestStatus(req.requestId, 'COMPLETED')}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
