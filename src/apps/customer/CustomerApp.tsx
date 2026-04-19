import React, { useState, useEffect } from 'react';
import { Shirt, Trash2, CheckCircle, PlusCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
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
  
  const [taggedItems, setTaggedItems] = useState<TaggedProduct[]>([]);
  const [assignedRoom, setAssignedRoom] = useState<string | null>(null);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Prevent scrolling when swiping vertically heavily
    if (dragOffset.y < -20) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [dragOffset.y]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTagProduct = (productId: string) => {
    if (assignedRoom) setAssignedRoom(null);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    setTaggedItems(prev => {
      const newArr = [...prev, {
        productId: product.id,
        productName: product.name,
        color: product.colors[0],
        size: product.sizes[0],
      }];
      setCurrentIndex(newArr.length - 1); // Jump to new item
      return newArr;
    });
    showToast(t('Product Tagged!'));
  };

  const updateTaggedItem = (index: number, key: 'color' | 'size', value: string) => {
    setTaggedItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const removeTaggedItem = (index: number) => {
    setTaggedItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      if (currentIndex >= newItems.length && newItems.length > 0) {
        setCurrentIndex(newItems.length - 1);
      } else if (newItems.length === 0) {
        setCurrentIndex(0);
      }
      return newItems;
    });
  };

  const handleFittingRequest = () => {
    if (taggedItems.length === 0) return;
    
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
    setTaggedItems([]);
    setCurrentIndex(0);
    showToast(t('Fitting request submitted!'));
  };

  // Touch Handlers
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setTouchStart({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 });
  };
  
  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStart) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Simple lock: if user scrolls down a lot, ignore horizontal
    setDragOffset({
      x: clientX - touchStart.x,
      y: clientY - touchStart.y
    });
  };

  const handleEnd = () => {
    if (!touchStart) return;
    
    // Swipe Up: Dismiss
    if (dragOffset.y < -80 && Math.abs(dragOffset.y) > Math.abs(dragOffset.x)) {
      removeTaggedItem(currentIndex);
    } 
    // Swipe Right -> Prev
    else if (dragOffset.x > 60 && currentIndex > 0) {
      setCurrentIndex(curr => curr - 1);
    } 
    // Swipe Left -> Next
    else if (dragOffset.x < -60 && currentIndex < taggedItems.length - 1) {
      setCurrentIndex(curr => curr + 1);
    }
    
    setTouchStart(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="app-container" style={{ padding: '1rem', paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('KEEP')}</h1>
          <p className="text-xs text-muted mt-1">{t('NFC Tagging System')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      {assignedRoom && (
        <div className="card my-4 animate-slide-in" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2rem 1rem', textAlign: 'center', borderRadius: '1.5rem' }}>
          <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '16px' }} />
          <h2 className="text-2xl font-bold mb-2">{t('Fitting Room Assigned!')}</h2>
          <p className="text-lg">{t('Please go to Fitting Room')} <strong style={{ fontSize: '1.5em', margin: '0 0.2em' }}>{assignedRoom}</strong></p>
        </div>
      )}

      {/* Mock NFC Tagging Header */}
      {!assignedRoom && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted">
            <PlusCircle size={16} />
            {t('Mock NFC Tagging (Tap to simulate)')}
          </h2>
          <div className="mock-nfc-header">
            {mockProducts.map(product => (
              <button 
                key={product.id}
                className="mock-nfc-chip"
                onClick={() => handleTagProduct(product.id)}
              >
                <PlusCircle size={16} color="var(--primary)" />
                {product.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Carousel UI */}
      {!assignedRoom && taggedItems.length > 0 && (
        <div className="animate-slide-in flex-col items-center">
          <div className="flex justify-between w-full mb-2 px-2 text-muted text-sm font-medium">
            <span>{t('Tagged Products')}</span>
            <span>{currentIndex + 1} / {taggedItems.length}</span>
          </div>
          
          <div 
            className="mobile-carousel-container"
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onMouseDown={handleStart}
            onMouseMove={touchStart ? handleMove : undefined}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
          >
            <div 
              className="carousel-track"
              style={{ 
                transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset.x}px))`,
                transition: touchStart ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              {taggedItems.map((item, idx) => {
                const productDef = mockProducts.find(p => p.id === item.productId)!;
                const isCurrent = idx === currentIndex;
                const isSwipingUp = isCurrent && dragOffset.y < 0;
                
                return (
                  <div className="carousel-card-wrapper" key={`${item.productId}-${idx}`}>
                    <div 
                      className="toss-card" 
                      style={{
                        transform: isSwipingUp 
                          ? `translateY(${dragOffset.y}px) scale(${1 - Math.abs(dragOffset.y)/2000})` 
                          : (!isCurrent ? 'scale(0.92)' : 'scale(1)'),
                        opacity: isSwipingUp ? 1 - Math.abs(dragOffset.y)/300 : (!isCurrent ? 0.6 : 1),
                        transition: touchStart ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    >
                      <div className="toss-img-wrapper cursor-pointer">
                        <img src={productDef.imageUrl} alt={item.productName} draggable="false" />
                        <button 
                          className="toss-dismiss-hint" 
                          onClick={(e) => { e.stopPropagation(); removeTaggedItem(idx); }}
                        >
                          <X size={20} />
                        </button>
                        
                        {/* Swipe Hint Overlay */}
                        {isCurrent && dragOffset.y < -30 && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,0,0,0.2)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', backdropFilter: 'blur(2px)' }}>
                            <Trash2 size={32} />
                          </div>
                        )}
                      </div>
                      
                      <div className="toss-options" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">{item.productName}</h3>
                          <p className="text-sm text-muted mt-1 swipe-hint">
                            {t('Swipe left/right to browse, up to dismiss')}
                          </p>
                        </div>
                        
                        <div className="mt-2 text-center">
                          <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {productDef.colors.map(c => (
                              <button 
                                key={c}
                                onClick={() => updateTaggedItem(idx, 'color', c)}
                                className={`option-btn ${item.color === c ? 'selected' : ''}`}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                              >
                                {c}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-wrap justify-center gap-2">
                            {productDef.sizes.map(s => (
                              <button 
                                key={s}
                                onClick={() => updateTaggedItem(idx, 'size', s)}
                                className={`option-btn ${item.size === s ? 'selected' : ''}`}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
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
            </div>
          </div>

          <div className="indicator-dots">
            {taggedItems.map((_, idx) => (
              <div key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!assignedRoom && taggedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted" style={{ minHeight: '400px' }}>
          <Shirt size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
          <p className="text-lg font-medium">{t('No products tagged yet.')}</p>
          <p className="text-sm mt-2">{t('Tap a product above to tag it.')}</p>
        </div>
      )}

      {/* Floating Action Bar */}
      {!assignedRoom && taggedItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'var(--bg-color)', borderTop: '1px solid var(--border)', zIndex: 10 }}>
          <button 
            className="btn btn-primary"
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '1rem', fontWeight: 'bold' }}
            onClick={handleFittingRequest}
          >
            <Shirt size={20} /> {t('Confirm & Request Fitting')}
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
