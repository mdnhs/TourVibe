export interface TourPricingVariant {
  basePrice: number;
  baseHours: number;
  extraHourlyRate: number;
  maxPersons: number;
}

export function calculateVariantPrice({
  basePrice,
  baseHours,
  extraHourlyRate,
  durationHours,
}: {
  basePrice: number;
  baseHours: number;
  extraHourlyRate: number;
  durationHours: number;
}) {
  const hours = Math.max(1, durationHours);
  const extraHours = Math.max(0, hours - baseHours);
  const extraPrice = Math.round(extraHours * extraHourlyRate * 100) / 100;
  const totalPrice = Math.round((basePrice + extraPrice) * 100) / 100;

  return {
    totalPrice,
    basePrice,
    baseHours,
    extraHours,
    extraHourlyRate,
    extraPrice,
  };
}

export function resolveTourVariant(
  tour: {
    price: number;
    hourlyRate: number;
    durationHours: number;
    maxPersons: number;
    price2?: number | null;
    hourlyRate2?: number | null;
    baseHours2?: number | null;
    maxPersons2?: number | null;
  },
  persons: number
): TourPricingVariant {
  const isV2 =
    tour.price2 != null &&
    tour.maxPersons2 != null &&
    persons > (tour.maxPersons || 1);

  if (isV2) {
    return {
      basePrice: tour.price2!,
      baseHours: tour.baseHours2 || tour.durationHours || 1,
      extraHourlyRate: tour.hourlyRate2 ?? 0,
      maxPersons: tour.maxPersons2!,
    };
  }

  return {
    basePrice: tour.price,
    baseHours: tour.durationHours || 1,
    extraHourlyRate: tour.hourlyRate || 0,
    maxPersons: tour.maxPersons || 1,
  };
}
