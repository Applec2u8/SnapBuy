interface ShopQuotaState {
  has_special_quota?: boolean;
  special_quota_expires_at?: string | null;
  quota_expires_at?: string | null;
  product_limit?: number;
}

interface RedeemedQuotaLike {
  is_special_quota?: boolean;
}

export function computeHasActiveSpecialQuota(
  shop: ShopQuotaState | null | undefined,
  redeemedCodes: RedeemedQuotaLike[] = []
): boolean {
  if (!shop || (shop.product_limit || 0) <= 0) return false;

  const isQuotaExpired = shop.quota_expires_at
    ? new Date(shop.quota_expires_at) < new Date()
    : false;
  if (isQuotaExpired) return false;

  const isSpecialQuotaExpired = shop.special_quota_expires_at
    ? new Date(shop.special_quota_expires_at) < new Date()
    : false;
  const fromShop = Boolean(
    shop.has_special_quota && (!shop.special_quota_expires_at || !isSpecialQuotaExpired)
  );
  const fromRedeemedCodes = redeemedCodes.some(code => code.is_special_quota);

  return fromShop || fromRedeemedCodes;
}

export function countQuotaTypes(redeemedCodes: RedeemedQuotaLike[]) {
  const special = redeemedCodes.filter(code => code.is_special_quota).length;
  return { special, normal: redeemedCodes.length - special };
}
