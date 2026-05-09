export const slugifyCountry = (countryName: string) =>
  countryName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z-]/g, '')
