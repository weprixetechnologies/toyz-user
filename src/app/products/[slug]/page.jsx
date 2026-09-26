'use client';
import Image from "next/image";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import LoginModal from '../../../components/LoginModal';
import { ShoppingCart, Heart, ShieldCheck, Tag, Truck, Star, CheckCircle, Zap, MapPin, Copy, Search, Headset, ChevronRight, Plus, Minus, X } from 'lucide-react';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { user, isReseller } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dispatchNote, setDispatchNote] = useState('Shipped within 2-3 business days');
  
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [selectedOptions, setSelectedOptions] = useState({}); // { groupName: value }

  const [added, setAdded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const [pincode, setPincode] = useState('700090');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Offers state
  const [offers, setOffers] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const res = await api.get(`/products/${slug}`);
      if (res.success && res.data) {
        const prod = res.data.product || res.data;
        prod.images = res.data.images || [];
        if (!prod.images.length && prod.primary_image) {
          prod.images = [{ url: prod.primary_image }];
        }
        setProduct(prod);
        const moqVal = isReseller && prod.moq ? prod.moq : 1;
        setQuantity(moqVal);

        const varRes = await api.get(`/products/${prod.id}/variants`);
        if (varRes.success) {
          const varList = varRes.data?.variants || varRes.data || [];
          setVariants(varList);
          if (varList.length > 0) {
            // Auto-select first value for each group
            const autoSelect = {};
            const firstVar = varList[0];
            (firstVar.attributes || []).forEach(a => { autoSelect[a.group] = a.value; });
            setSelectedOptions(autoSelect);
            setSelectedVariant(firstVar);
          }
        }
      }
      // Fetch public settings and active offers in parallel
      const [settingsRes, offersRes] = await Promise.all([
        api.get('/settings'),
        api.get('/offers')
      ]);
      if (settingsRes.success) {
        const s = settingsRes.data?.settings || settingsRes.data || {};
        if (s.dispatch_note) setDispatchNote(s.dispatch_note);
      }
      if (offersRes.success) {
        const allOffers = offersRes.data?.offers || [];
        setOffers(allOffers.filter(o => o.is_active));
      }
      setLoading(false);
    }
    loadProduct();
  }, [slug, isReseller]);

  // Load reviews when the tab is opened
  useEffect(() => {
    if (activeTab === 'reviews' && product) {
      async function loadReviews() {
        setReviewsLoading(true);
        const [rvRes, statsRes] = await Promise.all([
          api.get(`/products/${product.id}/reviews`),
          api.get(`/products/${product.id}/reviews/stats`)
        ]);
        if (rvRes.success) setReviews(rvRes.data?.reviews || []);
        if (statsRes.success) setReviewStats(statsRes.data);
        setReviewsLoading(false);
      }
      loadReviews();
    }
  }, [activeTab, product]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { setShowLoginModal(true); return; }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    const res = await api.post(`/products/${product.id}/reviews`, reviewForm);
    if (res.success) {
      setReviewSuccess('Your review has been submitted and is pending approval. Thank you!');
      setReviewForm({ rating: 5, title: '', body: '' });
    } else {
      setReviewError(res.message || 'Failed to submit review.');
    }
    setReviewSubmitting(false);
  };

  if (loading) return <div className="p-20 text-center text-gray-500 font-bold">Loading product...</div>;
  if (!product) return <div className="p-20 text-center font-bold text-red-500">Product not found.</div>;

  const allImages = [...(product.images?.length ? product.images : [])];
  variants.forEach(v => {
    if (v.image && !allImages.find(img => img.url === v.image)) {
      allImages.push({ url: v.image });
    }
  });
  if (allImages.length === 0) {
    allImages.push(
      { url: "https://cly-pull-bunny.b-cdn.net/rc_car_1790409155961.jpg" },
      { url: "https://cly-pull-bunny.b-cdn.net/rc_car_1790409204292.jpg" }
    );
  }

  // Extract unique visual variants (for the top Available Variations section)
  const visualVariants = variants.reduce((acc, v) => {
    if (v.image && !acc.find(x => x.image === v.image)) acc.push(v);
    return acc;
  }, []);

  const handleVariantImageClick = (variant) => {
    const newOpts = { ...selectedOptions };
    (variant.attributes || []).forEach(a => {
      newOpts[a.group] = a.value;
    });
    setSelectedOptions(newOpts);
    setSelectedVariant(variant);
    if (variant.image) {
      const imgIdx = allImages.findIndex(img => img.url === variant.image);
      if (imgIdx >= 0) setActiveImage(imgIdx);
    }
  };

  // Build attribute groups from variant list: { Color: [{value, image}, ...], Size: [...] }
  const attributeGroups = {};
  variants.forEach(v => {
    (v.attributes || []).forEach(a => {
      if (!attributeGroups[a.group]) attributeGroups[a.group] = [];
      const existing = attributeGroups[a.group].find(x => x.value === a.value);
      if (!existing) {
        // For color group: pick image from first variant that has this color value and has an image
        const imgVariant = variants.find(vv =>
          (vv.attributes || []).some(aa => aa.group === a.group && aa.value === a.value) && vv.image
        );
        attributeGroups[a.group].push({ value: a.value, image: imgVariant?.image || null });
      }
    });
  });

  // Find the variant that matches all currently selected options
  const findMatchingVariant = (opts) => {
    return variants.find(v =>
      Object.entries(opts).every(([group, value]) =>
        (v.attributes || []).some(a => a.group === group && a.value === value)
      )
    ) || null;
  };
  const isValidOption = (targetGroup, targetValue) => {
    return variants.some(v => {
      const hasTarget = (v.attributes || []).some(a => a.group === targetGroup && a.value === targetValue);
      if (!hasTarget) return false;
      return Object.entries(selectedOptions).every(([group, value]) => {
        if (group === targetGroup || !value) return true;
        return (v.attributes || []).some(a => a.group === group && a.value === value);
      });
    });
  };


  const handleOptionSelect = (group, value) => {
    const newOpts = { ...selectedOptions, [group]: value };
    setSelectedOptions(newOpts);
    const matched = findMatchingVariant(newOpts);
    setSelectedVariant(matched);
    // If variant has an image, switch main gallery to it
    if (matched?.image) {
      const imgIdx = allImages.findIndex(img => img.url === matched.image);
      if (imgIdx >= 0) setActiveImage(imgIdx);
    }
  };

  // Determine active display image (variant image takes precedence)

  // If the variant has a sale price, use it. If not, but the main product has a sale price and the variant price matches the main base price, inherit the main sale price.
  // Otherwise, just use the variant price (which will show no discount).
  const currentPrice = selectedVariant
    ? (selectedVariant.sale_price 
        ? selectedVariant.sale_price 
        : (parseFloat(selectedVariant.price) === parseFloat(product.base_price) && product.sale_price 
            ? product.sale_price 
            : selectedVariant.price))
    : (isReseller && product.reseller_price ? product.reseller_price : (product.sale_price || product.base_price));

  const moq = isReseller && product.moq ? product.moq : 1;
  
  const originalPrice = selectedVariant
    ? (selectedVariant.price || product.base_price)
    : product.base_price;
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const saveAmount = originalPrice - currentPrice;

  const handleBuyNow = () => {
    if (quantity < moq) return alert(`Minimum Order Quantity is ${moq}`);
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const variantId = selectedVariant ? selectedVariant.id : "";
    router.push(`/checkout?buyNow=true&productId=${product.id}&variantId=${variantId}&qty=${quantity}`);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    const variantId = selectedVariant ? selectedVariant.id : "";
    router.push(`/checkout?buyNow=true&productId=${product.id}&variantId=${variantId}&qty=${quantity}`);
  };

  const handleAddToCart = async () => {
    if (quantity < moq) return alert(`Minimum Order Quantity is ${moq}`);
    const res = await addToCart(product.id, quantity, selectedVariant?.id);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };


  return (
    <div className="bg-white font-sans text-[#17202A] pb-12">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />}
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="text-[#1877F2] hover:underline">Home</Link>
          <ChevronRight size={12}/>
          <Link href="/categories/rc-cars" className="hover:text-gray-900">RC Cars</Link>
          <ChevronRight size={12}/>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-6 flex gap-4 lg:sticky lg:top-32 z-10">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2 w-16 md:w-20">
              {allImages.slice(0, 5).map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`bg-gray-50 rounded-lg border-2 overflow-hidden aspect-square flex items-center justify-center p-1 transition ${activeImage === idx ? 'border-[#F51F2D]' : 'border-transparent hover:border-gray-200'}`}
                >
                  <Image width={800} height={800} src={img.url} alt="thumbnail" className="object-contain w-full h-full mix-blend-multiply" />
                </button>
              ))}
              {allImages.length > 5 && (
                <button className="bg-gray-50 rounded-lg border border-gray-200 aspect-square flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition">
                  <span className="font-black text-lg">+{allImages.length - 5}</span>
                  <span className="text-[10px] font-semibold">More</span>
                </button>
              )}
            </div>

            {/* Main Image */}
            <div className="flex-1">
              <div className="bg-gray-50 rounded-2xl border border-gray-100 aspect-square flex items-center justify-center p-8 relative overflow-hidden group">
                <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
                  {discount > 0 && (
                    <div className="bg-[#F51F2D] text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase shadow-sm tracking-wide">
                      {discount}% OFF
                    </div>
                  )}
                  {product.badges && product.badges.length > 0 && (
                    product.badges.map(b => (
                      <span
                        key={b.id}
                        className="text-xs font-black px-3 py-1.5 rounded-lg uppercase shadow-sm tracking-wide"
                        style={{ backgroundColor: b.bg_color || '#ef4444', color: b.text_color || '#ffffff' }}
                      >
                        {b.badge_text}
                      </span>
                    ))
                  )}
                </div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }} className="absolute top-4 right-4 bg-white p-2.5 rounded-full text-gray-400 hover:text-[#F51F2D] shadow-sm hover:shadow transition z-10">
                  <Heart size={20} className={isInWishlist(product?.id) ? "fill-[#F51F2D] text-[#F51F2D]" : ""} />
                </button>
                <div className="w-full h-full relative cursor-pointer" onClick={() => { setIsLightboxOpen(true); setZoomLevel(1); }}>
                  <Image width={800} height={800} 
                    src={allImages[activeImage]?.url} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>
              </div>

              {/* Feature Badges below image */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="bg-gray-50 rounded-xl p-2 text-center flex flex-col items-center justify-center border border-gray-100 h-24">
                  <Image width={800} height={800} src="https://cly-pull-bunny.b-cdn.net/rc_car_1790409204292.jpg" className="h-10 object-contain mb-1 mix-blend-multiply opacity-80" />
                  <span className="text-[10px] font-bold leading-tight">4WD Power<br/><span className="font-normal text-gray-500">All Terrains</span></span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center flex flex-col items-center justify-center border border-gray-100 h-24">
                   <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1"><Zap size={20}/></div>
                  <span className="text-[10px] font-bold leading-tight">High Speed<br/><span className="font-normal text-gray-500">Up to 70+ KM/H</span></span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center flex flex-col items-center justify-center border border-gray-100 h-24">
                  <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1"><ShieldCheck size={20}/></div>
                  <span className="text-[10px] font-bold leading-tight">Shock Absorbers<br/><span className="font-normal text-gray-500">Smooth Ride</span></span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center flex flex-col items-center justify-center border border-gray-100 h-24">
                   <Image width={800} height={800} src="https://cly-pull-bunny.b-cdn.net/hero_banner_1790409173201.jpg" className="h-10 object-cover rounded mb-1 opacity-80" />
                  <span className="text-[10px] font-bold leading-tight">Durable Build<br/><span className="font-normal text-gray-500">Indoor & Outdoor</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Product Details & Actions */}
          <div className="lg:col-span-6 flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-[#FFF8DD] px-2 py-1 rounded">
                {[1,2,3,4,5].map(s => {
                  const rating = parseFloat(product.avg_rating) || 0;
                  const filled = s <= Math.floor(rating);
                  const half = !filled && s === Math.ceil(rating) && rating % 1 >= 0.5;
                  return <Star key={s} size={14} className={filled || half ? "fill-[#FFB800] text-[#FFB800]" : "fill-[#FFB800] text-[#FFB800] opacity-20"} />;
                })}
                <span className="text-xs font-bold text-gray-700 ml-1">
                  {product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : 'No rating'}
                  {product.review_count > 0 && (
                    <span className="font-normal text-gray-500 underline cursor-pointer ml-1">({product.review_count} Reviews)</span>
                  )}
                </span>
              </div>
              {product.review_count > 50 && <div className="bg-[#F51F2D] text-white text-[10px] font-black uppercase px-2 py-1 rounded">Best Seller</div>}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {product.short_desc || "High performance 4WD RC car with powerful motor, durable build and all-terrain tires. Perfect for kids and RC enthusiasts."}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 border-b border-gray-100 pb-6">
              <span>Brand: <span className="text-gray-900 font-semibold">{product.brand_name || 'ToyWorld'}</span></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Age: <span className="text-gray-900 font-semibold">6+ Years</span></span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>SKU: <span className="text-gray-900 font-semibold uppercase">{product.sku || 'TW-RC-001'}</span></span>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-black text-[#F51F2D]">₹{parseFloat(currentPrice).toLocaleString('en-IN')}</span>
                {saveAmount > 0 && (
                  <span className="text-lg font-semibold text-gray-400 line-through mb-1">₹{parseFloat(originalPrice).toLocaleString('en-IN')}</span>
                )}
                {saveAmount > 0 && (
                  <span className="bg-[#FFE0EA] text-[#F51F2D] text-xs font-bold px-2.5 py-1 rounded-full mb-2">Save ₹{saveAmount} ({discount}% OFF)</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Inclusive of all taxes</p>
            </div>

            {/* Available Variations (Visual Grid) */}
            {visualVariants.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-900 mb-2">Available Variations</h4>
                <div className="flex flex-wrap gap-3">
                  {visualVariants.map((v) => {
                    const isSelected = selectedVariant?.image === v.image;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleVariantImageClick(v)}
                        title={v.variant_label}
                        className={`w-16 h-16 rounded-xl border-2 p-1 transition ${
                          isSelected ? 'border-[#F51F2D] shadow-md' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <Image width={800} height={800} src={v.image} alt={v.variant_label} className="w-full h-full object-contain rounded-lg mix-blend-multiply" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Attribute Selectors */}
            {Object.keys(attributeGroups).length > 0 && (
              <div className="mb-6 space-y-4">
                {Object.entries(attributeGroups).map(([group, options]) => {
                  const isColor = group.toLowerCase() === 'color' || group.toLowerCase() === 'colour';
                  const selectedVal = selectedOptions[group];
                  return (
                    <div key={group}>
                      <h4 className="text-xs font-bold text-gray-900 mb-2">
                        {group}:{' '}
                        <span className="font-semibold text-gray-600">{selectedVal || '—'}</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {options.map(opt => {
                          const isSelected = selectedVal === opt.value;
                          const isValid = isValidOption(group, opt.value);
                          return (
                            <button
                              key={opt.value}
                              disabled={!isValid}
                              onClick={() => handleOptionSelect(group, opt.value)}
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-bold flex items-center gap-2 transition ${
                                !isValid 
                                  ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                                  : isSelected 
                                    ? 'border-[#F51F2D] bg-[#FFF0F1] text-[#F51F2D]' 
                                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {isColor && (
                                <span 
                                  className={`w-3 h-3 rounded-full border block ${!isValid ? 'border-gray-200 opacity-30' : 'border-gray-300'}`} 
                                  style={{ backgroundColor: opt.value.toLowerCase() }}
                                ></span>
                              )}
                              {opt.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-900 mb-2">Quantity:</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg h-10 w-28 font-bold">
                  <button onClick={() => setQuantity(Math.max(moq, quantity - 1))} className="flex-1 text-gray-500 hover:text-[#F51F2D]">-</button>
                  <div className="w-10 text-center border-x border-gray-200 text-sm">{quantity}</div>
                  <button onClick={() => setQuantity(quantity + 1)} className="flex-1 text-[#1877F2] hover:text-[#0b5cce]">+</button>
                </div>
                <div className="text-sm font-bold text-[#18A957]">
                  In Stock{' '}
                  <span className="font-normal text-gray-500">
                    ({selectedVariant ? (selectedVariant.stock_qty ?? '—') : (product.stock_qty || '50+')} available)
                  </span>
                </div>
              </div>
              {selectedVariant && (
                <p className="text-[11px] text-gray-400 mt-1">SKU: <span className="font-mono">{selectedVariant.sku || product.sku}</span></p>
              )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                className={`h-12 rounded-lg border-2 flex items-center justify-center gap-2 font-black transition ${added ? 'bg-[#18A957] border-[#18A957] text-white shadow-md' : 'border-[#F51F2D] text-[#F51F2D] hover:bg-[#FFF0F1]'}`}
              >
                {added ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                {added ? 'Added' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} className="h-12 bg-[#F51F2D] hover:bg-[#D41825] text-white rounded-lg flex items-center justify-center gap-2 font-black shadow-md hover:shadow-lg transition">
                <Zap size={18} className="fill-current" /> Buy Now
              </button>
            </div>

            {/* Offers */}
            {offers.length > 0 && (
              <div className="mb-6 border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <span className="w-5 h-5 bg-[#F51F2D] rounded-full text-white flex items-center justify-center font-black text-[10px]">%</span>
                  <h3 className="font-bold text-gray-900">Available Offers</h3>
                </div>
                <div className="space-y-3">
                  {offers.map(offer => (
                    <div key={offer.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:border-red-100 hover:bg-red-50/30 transition group">
                      <div className="mt-0.5 text-[#F51F2D] bg-[#FFF0F1] p-1.5 rounded-full shrink-0">
                        <Tag size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{offer.name}</h4>
                        {offer.description && (
                          <p className="text-[11px] text-gray-600 leading-snug">{offer.description}</p>
                        )}
                      </div>
                      {offer.offer_type === 'coupon' && offer.name && (
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(offer.name);
                            setCopiedCode(offer.name);
                            setTimeout(() => setCopiedCode(null), 2000);
                          }}
                          className={`shrink-0 hover:text-[#1877F2] transition-colors ${copiedCode === offer.name ? 'text-[#18A957]' : 'text-gray-400'}`}
                          title="Copy Code"
                        >
                          {copiedCode === offer.name ? <CheckCircle size={14} /> : <Copy size={14}/>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Strip */}
            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="text-gray-400"><ShieldCheck size={24}/></div>
                <div><h5 className="text-[11px] font-bold text-gray-900 leading-none mb-1">Secure Payment</h5><p className="text-[9px] text-gray-500 leading-none">100% Safe & Secure</p></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2 border-x border-gray-100">
                <div className="text-gray-400"><Truck size={24}/></div>
                <div><h5 className="text-[11px] font-bold text-gray-900 leading-none mb-1">Free Shipping</h5><p className="text-[9px] text-gray-500 leading-none">On Orders Above ₹999</p></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <div className="text-gray-400"><Headset size={24}/></div>
                <div><h5 className="text-[11px] font-bold text-gray-900 leading-none mb-1">Easy Returns</h5><p className="text-[9px] text-gray-500 leading-none">7 Days Return Policy</p></div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={18} className="text-[#1877F2]" />
                  <h3 className="font-bold text-gray-900">Delivery Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Truck size={15} className="text-[#1877F2]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">{dispatchNote}</h4>
                      <p className="text-[11px] text-gray-500">After order is confirmed and payment received</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle size={15} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5">Shipping calculated at checkout</h4>
                      <p className="text-[11px] text-gray-500">Based on your pincode & order type</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-xl bg-gradient-to-r from-[#071C2B] to-[#0d2d45] p-4 flex items-center gap-3">
                    <Headset size={20} className="text-white shrink-0" />
                    <div className="flex-1">
                      <p className="text-white text-[11px] font-black uppercase tracking-wider">Got a question about delivery?</p>
                      <p className="text-blue-200 text-[10px] mt-0.5">Our team is here to help anytime</p>
                    </div>
                    <a href="tel:+919999999999" className="bg-[#F51F2D] text-white text-[11px] font-black px-3 py-1.5 rounded-lg hover:bg-[#d41828] transition shrink-0">
                      Contact Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* TABS & HTML DESCRIPTION SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Tab Headers */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
          {[
            { id: 'details', label: 'Product Details' },
            { id: 'specs', label: 'Specifications' },
            { id: 'box', label: "What's in the Box" },
            { id: 'videos', label: 'Product Videos' },
            { id: 'reviews', label: `Reviews (${product.review_count || 0})` },
            { id: 'faq', label: 'Questions (24)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition ${activeTab === tab.id ? 'border-[#F51F2D] text-[#F51F2D]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Key Features Grid */}
              <div className="lg:col-span-3 border border-gray-200 rounded-xl p-6 bg-gray-50/50 h-fit">
                <h3 className="font-black text-gray-900 text-lg mb-6">Key Features</h3>
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Truck size={16}/></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">4WD All-Terrain Performance</h4>
                      <p className="text-[11px] text-gray-500">Conquer sand, mud, grass and rocky paths</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Zap size={16}/></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">High Speed Motor</h4>
                      <p className="text-[11px] text-gray-500">Up to 70+ KM/H speed</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><ShieldCheck size={16}/></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">Durable & Shockproof Design</h4>
                      <p className="text-[11px] text-gray-500">Built for rough and tough play</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Headset size={16}/></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">2.4GHz Remote Control</h4>
                      <p className="text-[11px] text-gray-500">Smooth and interference-free control</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Zap size={16}/></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">Rechargeable Battery</h4>
                      <p className="text-[11px] text-gray-500">Long playtime with USB charging</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Star size={16}/></div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">Perfect Gift for Kids</h4>
                      <p className="text-[11px] text-gray-500">Ideal for ages 6+ years</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center HTML Description */}
              <div className="lg:col-span-6">
                <h3 className="font-black text-gray-900 text-lg mb-4">Product Description</h3>
                
                {product.description ? (
                  <div 
                    className="prose prose-sm md:prose-base max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-li:marker:text-[#F51F2D]"
                    dangerouslySetInnerHTML={{ __html: product.description }} 
                  />
                ) : (
                  <div className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
                    <p>Experience the thrill of high-speed racing with the 1:16 Off-Road RC Car. Built with a powerful 4WD motor, durable shock absorbers, and all-terrain tires, this RC car is designed for adventure. Whether it's grass, sand, mud or rocky roads, this car delivers smooth and exciting performance. Perfect for kids, hobbyists and RC enthusiasts.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-[#F51F2D]">
                      <li>Realistic off-road design with high ground clearance</li>
                      <li>Strong and durable ABS body</li>
                      <li>High-speed performance up to 70+ KM/H</li>
                      <li>Rechargeable battery with USB charging</li>
                      <li>Perfect gift for birthdays and special occasions</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Promo Banner */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="rounded-xl overflow-hidden relative bg-[#071C2B] group cursor-pointer aspect-video md:aspect-auto h-full min-h-[250px]">
                   <Image width={800} height={800} src="https://cly-pull-bunny.b-cdn.net/hero_banner_1790409173201.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition duration-700" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center group-hover:bg-[#F51F2D] group-hover:border-[#F51F2D] transition shadow-lg">
                       <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                     </div>
                   </div>
                   <div className="absolute top-4 left-4">
                     <h4 className="text-xl font-black text-white italic tracking-tighter leading-none">BUILT FOR<br/><span className="text-[#FFD600] text-2xl">BIGGER ADVENTURES</span></h4>
                   </div>
                   <div className="absolute bottom-4 left-0 w-full px-4 grid grid-cols-4 gap-2 text-center text-white">
                     <div><div className="text-xs font-black">70+</div><div className="text-[8px] uppercase tracking-wider text-gray-300">KM/H Speed</div></div>
                     <div><div className="text-xs font-black">4WD</div><div className="text-[8px] uppercase tracking-wider text-gray-300">All Terrain</div></div>
                     <div><div className="text-xs font-black">2.4GHz</div><div className="text-[8px] uppercase tracking-wider text-gray-300">Remote Control</div></div>
                     <div><div className="text-xs font-black">USB</div><div className="text-[8px] uppercase tracking-wider text-gray-300">Rechargeable</div></div>
                   </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="py-6">
              {reviewsLoading ? (
                <div className="text-center py-12 text-gray-400">Loading reviews...</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                  {/* LEFT: Rating Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Rating</h3>
                      <div className="flex flex-col items-center mb-6">
                        <span className="text-6xl font-black text-gray-900">{reviewStats?.average ? parseFloat(reviewStats.average).toFixed(1) : '—'}</span>
                        <div className="flex gap-1 my-2">
                          {[1,2,3,4,5].map(s => {
                            const avg = parseFloat(reviewStats?.average) || 0;
                            return <Star key={s} size={20} className={s <= Math.round(avg) ? "fill-[#FFB800] text-[#FFB800]" : "fill-gray-200 text-gray-200"} />;
                          })}
                        </div>
                        <span className="text-sm text-gray-500">{reviewStats?.total || 0} reviews</span>
                      </div>
                      {/* Star breakdown bars */}
                      {[5,4,3,2,1].map(star => {
                        const count = parseInt(reviewStats?.[['','one','two','three','four','five'][star]] || 0);
                        const total = parseInt(reviewStats?.total || 1);
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 mb-2 text-xs">
                            <span className="w-4 text-right font-bold text-gray-600">{star}</span>
                            <Star size={11} className="fill-[#FFB800] text-[#FFB800] shrink-0" />
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div className="bg-[#FFB800] h-2 rounded-full transition-all" style={{width: `${pct}%`}} />
                            </div>
                            <span className="w-7 text-gray-400">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Write a Review Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Write a Review</h3>
                      <p className="text-xs text-gray-400 mb-4">Only verified buyers can leave reviews.</p>
                      {reviewSuccess && <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4">{reviewSuccess}</div>}
                      {reviewError && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{reviewError}</div>}
                      <form onSubmit={handleSubmitReview} className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Rating</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))}>
                                <Star size={22} className={s <= reviewForm.rating ? "fill-[#FFB800] text-[#FFB800]" : "fill-gray-200 text-gray-200"} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title</label>
                          <input
                            type="text"
                            placeholder="Summarise your review..."
                            value={reviewForm.title}
                            onChange={e => setReviewForm(f => ({...f, title: e.target.value}))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F51F2D]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Review</label>
                          <textarea
                            placeholder="Share your experience..."
                            value={reviewForm.body}
                            onChange={e => setReviewForm(f => ({...f, body: e.target.value}))}
                            rows={4}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F51F2D] resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="w-full bg-[#F51F2D] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#d41828] transition"
                        >
                          {reviewSubmitting ? 'Submitting...' : user ? 'Submit Review' : 'Login to Review'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* RIGHT: Review Cards */}
                  <div className="lg:col-span-2 space-y-5">
                    {reviews.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                        <Star size={40} className="fill-gray-100 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-semibold">No approved reviews yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Be the first to leave a review after receiving your order!</p>
                      </div>
                    ) : reviews.map(rv => (
                      <div key={rv.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-[#F51F2D] text-white flex items-center justify-center font-black text-sm shrink-0">
                            {(rv.reviewer_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-bold text-sm text-gray-900">{rv.reviewer_name || 'Anonymous'}</span>
                              <span className="text-[11px] text-gray-400">{new Date(rv.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={13} className={s <= rv.rating ? "fill-[#FFB800] text-[#FFB800]" : "fill-gray-200 text-gray-200"} />
                              ))}
                              <span className="text-xs font-bold text-gray-600 ml-1">{rv.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        {rv.title && <p className="font-bold text-gray-900 text-sm mb-1">{rv.title}</p>}
                        {rv.body && <p className="text-sm text-gray-600 leading-relaxed">{rv.body}</p>}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle size={10} /> Verified Purchase
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'faq' && (
             <div className="text-center py-12">
               <h3 className="text-xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
               <p className="text-gray-500">FAQ feature coming soon...</p>
             </div>
          )}
          
          {['specs', 'box', 'videos'].includes(activeTab) && (
             <div className="text-center py-12">
               <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab.replace('-', ' ')}</h3>
               <p className="text-gray-500">Content for this section is currently unavailable.</p>
             </div>
          )}
        </div>

      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center">
          <div className="absolute top-6 right-6 flex gap-4 z-50">
            <button onClick={() => setZoomLevel(z => Math.min(z + 0.5, 4))} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition">
              <Plus size={24} />
            </button>
            <button onClick={() => setZoomLevel(z => Math.max(z - 0.5, 1))} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition">
              <Minus size={24} />
            </button>
            <button onClick={() => setIsLightboxOpen(false)} className="bg-[#F51F2D] hover:bg-red-600 text-white p-3 rounded-full transition shadow-lg">
              <X size={24} />
            </button>
          </div>
          <div className="w-full h-full overflow-auto flex items-center justify-center p-8">
            <div className="flex items-center justify-center min-w-full min-h-full transition-transform duration-200" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}>
              <Image width={800} height={800} 
                src={allImages[activeImage]?.url} 
                alt={product.name} 
                className="max-w-full max-h-[90vh] object-contain cursor-move"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
