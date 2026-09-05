import { useMemo } from 'react';
import { useHome } from './hooks/useHome';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { CategoryGrid } from './components/CategoryGrid';
import { FlashSale } from './components/FlashSale';
import { FeaturedProducts } from './components/FeaturedProducts';
import { HomeContactBanner } from './components/HomeContactBanner';
import { ReviewsSlider } from './components/ReviewsSlider';
import { CallToAction } from './components/CallToAction';
import { PromotedProducts } from './components/PromotedProducts';
import { SkeletonHome } from '../../components/ui/Skeleton';

const Home = () => {
  const { 
    products, 
    promotedProducts,
    loading, 
    reviews, 
    activeReview, 
    nextReview, 
    prevReview 
  } = useHome();

  const flashSaleProducts = useMemo(() => products.slice(0, 6), [products]);
  const featuredProducts = useMemo(() => products.slice(0, 12), [products]);

  if (loading) return <SkeletonHome />;

  return (
    <div className="space-y-4 sm:space-y-10 pb-20 animate-fade-in px-4 sm:px-0">
      <Hero />
      <TrustBadges />
      {promotedProducts.length > 0 && <PromotedProducts products={promotedProducts} />}
      <CategoryGrid />
      <FlashSale products={flashSaleProducts} />
      <FeaturedProducts products={featuredProducts} />
      <HomeContactBanner />
      <ReviewsSlider 
        reviews={reviews} 
        activeReview={activeReview} 
        nextReview={nextReview} 
        prevReview={prevReview} 
      />
      <CallToAction />
    </div>
  );
};

export default Home;
