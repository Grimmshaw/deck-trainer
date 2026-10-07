import type { Region as Buoyage } from './buoyage/marks'

// Where the user studies. Today this sets the IALA buoyage region.
// Later it will also choose language and local rules (for example US Inland Rules).

export interface StudyRegion {
  id: string
  name: string
  buoyage: Buoyage
  language: 'en'
  note?: string
}

export const REGIONS: StudyRegion[] = [
  { id: 'intl', name: 'International', buoyage: 'A', language: 'en' },
  { id: 'nordic', name: 'Nordic countries', buoyage: 'A', language: 'en' },
  { id: 'europe', name: 'Europe (other)', buoyage: 'A', language: 'en' },
  { id: 'uk', name: 'United Kingdom & Ireland', buoyage: 'A', language: 'en' },
  { id: 'india', name: 'India', buoyage: 'A', language: 'en' },
  { id: 'philippines', name: 'Philippines', buoyage: 'B', language: 'en' },
  { id: 'usa', name: 'United States', buoyage: 'B', language: 'en', note: 'US Inland Rules planned' },
  { id: 'canada', name: 'Canada', buoyage: 'B', language: 'en' },
  { id: 'americas', name: 'Central & South America', buoyage: 'B', language: 'en' },
  { id: 'japan', name: 'Japan', buoyage: 'B', language: 'en' },
  { id: 'korea', name: 'South Korea', buoyage: 'B', language: 'en' },
  { id: 'china', name: 'China', buoyage: 'A', language: 'en' },
  { id: 'asia', name: 'Asia (other)', buoyage: 'A', language: 'en' },
  { id: 'oceania', name: 'Australia & New Zealand', buoyage: 'A', language: 'en' },
  { id: 'africa', name: 'Africa & Middle East', buoyage: 'A', language: 'en' },
]

export function findRegion(id: string): StudyRegion {
  return REGIONS.find((r) => r.id === id) ?? REGIONS[0]
}
