export const getCurrentPremiumStatus = (status) => {
  const parts = String(status || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return parts[parts.length - 1] || "";
};

export const resolveUserPremiumStatus = (source = {}) => {
  const premiumActive =
    source?.premiumActive ??
    source?.premium_active ??
    source?.isPremiumActive ??
    source?.is_premium_active;

  if (premiumActive === true || premiumActive === 1 || String(premiumActive).toLowerCase() === "true") {
    return "APPROVED";
  }

  return getCurrentPremiumStatus(
    source?.premiumStatus ||
      source?.premium_status ||
      source?.userPremiumStatus ||
      source?.paymentStatus ||
      source?.payment_status ||
      source?.status
  );
};

