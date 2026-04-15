import { useState, useMemo } from 'react';
import { Heart, ShoppingBag, Shirt } from 'lucide-react';
import { mockProducts } from '../../mock/products';
import { useFittingStore } from '../../store/useFittingStore';
import { useUserStore } from '../../store/useUserStore';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import type { Product } from '../../types';

export const CustomerApp = () => {
  const { t } = useTranslation();
  const addRequest = useFittingStore((state) => state.addRequest);
  const { likedProductIds, cart } = useUserStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFittingRequest = (product: Product, color: string, size: string) => {
    if (!color || !size) {
      showToast(t('Please select color and size'));
      return;
    }
    const sessionId = localStorage.getItem('sessionId') || `session-${Math.random().toString(36).substring(2, 9)}`;
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', sessionId);
    }

    addRequest({
      requestId: `req-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      color,
      size,
      status: 'PENDING',
      sessionId,
    });
    showToast(t('Fitting request submitted!'));
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">{t('KEEP')}</h1>
          <p className="text-muted mt-2">{t('Discover and request your perfect fit.')}</p>
        </div>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <LanguageToggle />
          <button className="btn-icon">
            <Heart size={20} />
            {likedProductIds.length > 0 && <span className="badge">{likedProductIds.length}</span>}
          </button>
          <button className="btn-icon">
            <ShoppingBag size={20} />
            {totalCartCount > 0 && <span className="badge">{totalCartCount}</span>}
          </button>
        </div>
      </div>

      <div className="grid-cols-4">
        {mockProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onRequestFitting={handleFittingRequest}
            showToast={showToast}
          />
        ))}
      </div>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ 
  product, 
  onRequestFitting, 
  showToast 
}: {
  product: Product;
  onRequestFitting: (product: Product, color: string, size: string) => void;
  showToast: (msg: string) => void;
}) => {
  const { t } = useTranslation();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  
  const { likedProductIds, toggleLike, addToCart, cart } = useUserStore();
  const isLiked = likedProductIds.includes(product.id);

  // Check if this specific configuration is in cart
  const cartItem = cart.find(c => c.productId === product.id && c.color === selectedColor && c.size === selectedSize);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity: 1
    });
    showToast(t('Added to Cart!'));
  };

  return (
    <div className="card flex-col animate-slide-in">
      <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button 
          style={{ 
            position: 'absolute', top: '10px', right: '10px', 
            background: 'var(--surface)', padding: '8px', 
            borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}
          onClick={() => toggleLike(product.id)}
        >
          <Heart size={20} fill={isLiked ? '#fb7185' : 'none'} color={isLiked ? '#fb7185' : 'var(--text-primary)'} />
        </button>
      </div>

      <div className="p-4 flex-col gap-4" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="font-medium text-muted mt-2">₩{product.price.toLocaleString()}</p>
        </div>

        <div>
          <p className="text-xs font-medium mb-2 text-muted">{t('COLOR')}</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`option-btn ${selectedColor === c ? 'selected' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium mb-2 text-muted">{t('SIZE')}</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(s => (
              <button 
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`option-btn ${selectedSize === s ? 'selected' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button 
            className="btn btn-secondary w-full"
            style={{ width: '100%', borderColor: isInCart ? 'var(--primary)' : 'var(--border)' }}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} /> {isInCart ? `${t('In Cart')} (${cartItem.quantity})` : t('Add to Cart')}
          </button>
          <button 
            className="btn btn-primary w-full"
            style={{ width: '100%' }}
            onClick={() => onRequestFitting(product, selectedColor, selectedSize)}
          >
            <Shirt size={18} /> {t('Request Fitting')}
          </button>
        </div>
      </div>
    </div>
  );
};
