import {
  parseAsInteger,
  parseAsString,
  createSearchParamsCache,
} from "nuqs/server";

export const toursSearchParams = {
  q: parseAsString.withDefault(""),
  minPrice: parseAsInteger,
  maxPrice: parseAsInteger,
  sort: parseAsString.withDefault("newest"),
  vehicle: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const toursSearchParamsCache = createSearchParamsCache(toursSearchParams);
