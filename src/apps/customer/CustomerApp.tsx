import { useState } from 'react';
import { Shirt, Trash2, CheckCircle, PlusCircle } from 'lucide-react';
import { mockProducts } from '../../mock/products';
import { useFittingStore } from '../../store/useFittingStore';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import type { TaggedProduct } from '../../types';

export const CustomerApp = () => {
  const { t } = useTranslation();
  const addRequest = useFittingStore((state) => state.addRequest);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Local state for NFC tagged products
  const [taggedItems, setTaggedItems] = useState<TaggedProduct[]>([]);
  const [assignedRoom, setAssignedRoom] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock NFC Tagging Action
  const handleTagProduct = (productId: string) => {
    if (assignedRoom) setAssignedRoom(null); // Reset when starting a new session
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    setTaggedItems(prev => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        color: product.colors[0],
        size: product.sizes[0],
      }
    ]);
    showToast(t('Product Tagged!'));
  };

  const updateTaggedItem = (index: number, key: 'color' | 'size', value: string) => {
    setTaggedItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const removeTaggedItem = (index: number) => {
    setTaggedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleFittingRequest = () => {
    if (taggedItems.length === 0) {
      showToast(t('Please tag products first'));
      return;
    }
    
    // Assign a mock fitting room (e.g., 1 to 4)
    const randomRoomId = Math.floor(Math.random() * 4) + 1;
    const roomStr = randomRoomId.toString();

    const sessionId = localStorage.getItem('sessionId') || `session-${Math.random().toString(36).substring(2, 9)}`;
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', sessionId);
    }

    addRequest({
      requestId: `req-${Date.now()}`,
      products: [...taggedItems],
      fittingRoomId: roomStr,
      status: 'pending',
      sessionId,
    });
    
    setAssignedRoom(roomStr);
    setTaggedItems([]); // Clear selected items
    showToast(t('Fitting request submitted!'));
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">{t('KEEP')}</h1>
          <p className="text-muted mt-2">{t('NFC Fitting Request System')}</p>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      {assignedRoom && (
        <div className="card my-4" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1.5rem', textAlign: 'center', borderRadius: '12px' }}>
          <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '10px' }} />
          <h2 className="text-2xl font-bold">{t('Fitting Room Assigned!')}</h2>
          <p className="text-xl mt-2">{t('Please go to Fitting Room')} <strong>{assignedRoom}</strong></p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* MOCK NFC TAGGING SECTION */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PlusCircle size={20} />
            {t('Mock NFC Tagging')}
          </h2>
          <div className="flex flex-col gap-3">
            {mockProducts.map(product => (
              <button 
                key={product.id}
                className="card animate-slide-in hover:border-primary cursor-pointer text-left flex items-center gap-4"
                style={{ transition: 'all 0.2s ease', padding: '1rem' }}
                onClick={() => handleTagProduct(product.id)}
              >
                <img src={product.imageUrl} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted">Tap to Tag</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* TAGGED PRODUCTS LIST */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shirt size={20} />
            {t('Tagged Products')}
          </h2>
          
          {taggedItems.length === 0 ? (
            <div className="card flex items-center justify-center text-muted" style={{ minHeight: '200px' }}>
              {t('No products tagged yet. Tap a product to tag.')}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {taggedItems.map((item, index) => {
                const productDef = mockProducts.find(p => p.id === item.productId)!;
                return (
                  <div key={index} className="card p-4 animate-slide-in flex gap-4 items-start">
                    <img src={productDef.imageUrl} alt={item.productName} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{item.productName}</h3>
                        <button className="btn-icon" onClick={() => removeTaggedItem(index)}>
                          <Trash2 size={18} color="var(--error)" />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted w-12">{t('COLOR')}:</span>
                          <div className="flex gap-2">
                            {productDef.colors.map(c => (
                              <button 
                                key={c}
                                onClick={() => updateTaggedItem(index, 'color', c)}
                                className={`option-btn ${item.color === c ? 'selected' : ''}`}
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted w-12">{t('SIZE')}:</span>
                          <div className="flex gap-2">
                            {productDef.sizes.map(s => (
                              <button 
                                key={s}
                                onClick={() => updateTaggedItem(index, 'size', s)}
                                className={`option-btn ${item.size === s ? 'selected' : ''}`}
                                style={{ padding: '4px 12px', fontSize: '12px' }}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button 
                className="btn btn-primary w-full mt-4"
                style={{ padding: '1rem', fontSize: '1.1rem' }}
                onClick={handleFittingRequest}
              >
                <Shirt size={20} /> {t('Confirm & Request Fitting')}
              </button>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
