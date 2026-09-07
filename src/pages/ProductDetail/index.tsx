import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProductDetail } from './hooks/useProductDetail';
import { ProductGallery } from './components/ProductGallery';
import { ProductInfo } from './components/ProductInfo';
import { ProductTabs } from './components/ProductTabs';
import { RelatedProducts } from './components/RelatedProducts';
import { ReviewModal } from './components/ReviewModal';
import { VariantModal } from './components/VariantModal';
import { ImageViewer } from './components/ImageViewer';
import { SkeletonProductDetail } from '../../components/ui/Skeleton';

const ProductDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    product,
    loading,
    quantity,
    setQuantity,
    selectedVariant,
    setSelectedVariant,
    activeImage,
    setActiveImage,
    reviews,
    relatedProducts,
    loadingMoreRelated,
    hasMoreRelated,
    handleLoadMoreRelated,
    activeTab,
    setActiveTab,
    showReviewModal,
    setShowReviewModal,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewFiles,
    setReviewFiles,
    submittingReview,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    selectedReviewImages,
    setSelectedReviewImages,
    showVariantModal,
    setShowVariantModal,
    activeReviewImageIndex,
    setActiveReviewImageIndex,
    handleReviewSubmit,
    handleAddToCart,
    handleBuyNow,
    isOwnProduct
  } = useProductDetail();

  const handleVariantConfirm = () => {
    setShowVariantModal(false);
  };

  if (loading) return <SkeletonProductDetail />;

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8 animate-fade-in text-left">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors font-bold uppercase text-[10px] sm:text-xs tracking-widest mb-6"
      >
        <ChevronLeft size={16} /> {t('back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        <ProductGallery
          images={product.images}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          productName={product.name}
          setSelectedReviewImages={setSelectedReviewImages}
          setActiveReviewImageIndex={setActiveReviewImageIndex}
        />

        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          reviewsCount={reviews.length}
          setShowVariantModal={setShowVariantModal}
          isOwnProduct={isOwnProduct}
        />
      </div>

      <ProductTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        product={product}
        reviews={reviews}
        isDescriptionExpanded={isDescriptionExpanded}
        setIsDescriptionExpanded={setIsDescriptionExpanded}
        setShowReviewModal={setShowReviewModal}
        setSelectedReviewImages={setSelectedReviewImages}
        setActiveReviewImageIndex={setActiveReviewImageIndex}
      />

      <RelatedProducts
        relatedProducts={relatedProducts}
        onLoadMore={handleLoadMoreRelated}
        hasMore={hasMoreRelated}
        loading={loadingMoreRelated}
      />

      <ReviewModal
        showReviewModal={showReviewModal}
        setShowReviewModal={setShowReviewModal}
        reviewRating={reviewRating}
        setReviewRating={setReviewRating}
        reviewComment={reviewComment}
        setReviewComment={setReviewComment}
        reviewFiles={reviewFiles}
        setReviewFiles={setReviewFiles}
        submittingReview={submittingReview}
        handleReviewSubmit={handleReviewSubmit}
      />

      <VariantModal
        show={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        setActiveImage={setActiveImage}
        onConfirm={handleVariantConfirm}
      />

      <ImageViewer
        selectedReviewImages={selectedReviewImages}
        setSelectedReviewImages={setSelectedReviewImages}
        activeReviewImageIndex={activeReviewImageIndex}
        setActiveReviewImageIndex={setActiveReviewImageIndex}
      />
    </div>
  );
};

export default ProductDetail;
