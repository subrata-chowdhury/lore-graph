import { countries, continents, TCountryCode, TContinentCode } from "countries-list";

export const getCountryDetails = (code: string) => {
  // 1. Safety check: ensure code is uppercase
  const upperCode = code.toUpperCase() as TCountryCode;

  // 2. Get country data
  const country = countries[upperCode];

  if (!country) {
    return { name: code, region: "Unknown", label: code };
  }

  // 3. Get full continent name (e.g., "AS" -> "Asia")
  // The library returns continent codes like "NA", "EU", "AS"
  const continentName = continents[country.continent as TContinentCode];

  return {
    name: country.name, // "India"
    region: continentName, // "Asia"
    label: `${continentName} / ${country.name}`, // "Asia / India"
  };
};
