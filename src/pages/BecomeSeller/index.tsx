import { useBecomeSeller } from './hooks/useBecomeSeller';
import { BecomeSellerHeader } from './components/BecomeSellerHeader';
import { BenefitGrid } from './components/BenefitGrid';
import { CreateShopForm } from './components/CreateShopForm';

const BecomeSeller = () => {
  const {
    shops,
    loading,
    shopName,
    setShopName,
    description,
    setDescription,
    quotaCode,
    setQuotaCode,
    handleCreateShop
  } = useBecomeSeller();

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12 animate-fade-in px-4">
      <BecomeSellerHeader shopsCount={shops.length} />
      <BenefitGrid />
      <CreateShopForm 
        loading={loading}
        shopName={shopName}
        setShopName={setShopName}
        description={description}
        setDescription={setDescription}
        handleCreateShop={handleCreateShop}
        shopsCount={shops.length}
        quotaCode={quotaCode}
        setQuotaCode={setQuotaCode}
      />
    </div>
  );
};

export default BecomeSeller;
