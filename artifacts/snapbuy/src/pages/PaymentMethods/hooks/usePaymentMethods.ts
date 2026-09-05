import { useTranslation } from 'react-i18next';

export const usePaymentMethods = () => {
  const { t } = useTranslation();

  return {
    t
  };
};
