const normalizeBoolean = (value) =>
  value === true ||
  value === 1 ||
  String(value || "").trim().toLowerCase() === "true";

export const isPropertyRented = (property) => {
  if (!property) return false;

  if (
    normalizeBoolean(property.rented) ||
    normalizeBoolean(property.isRented) ||
    normalizeBoolean(property.is_rented)
  ) {
    return true;
  }

  const availabilityStatus = String(
    property.availabilityStatus ||
      property.availability_status ||
      property.propertyAvailabilityStatus ||
      property.status ||
      ""
  )
    .trim()
    .toUpperCase();

  return availabilityStatus === "RENTED";
};
