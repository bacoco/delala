import { Station } from '@/types'

// Sample French train stations data
// In production, this would come from SNCF API
export const STATIONS_DATA: Station[] = [
  // Paris stations
  { name: 'Paris Gare de Lyon', code: 'FRPLY', region: 'Île-de-France' },
  { name: 'Paris Gare du Nord', code: 'FRPNO', region: 'Île-de-France' },
  { name: 'Paris Gare de l\'Est', code: 'FRPES', region: 'Île-de-France' },
  { name: 'Paris Montparnasse', code: 'FRPMO', region: 'Île-de-France' },
  { name: 'Paris Saint-Lazare', code: 'FRPSL', region: 'Île-de-France' },
  { name: 'Paris Austerlitz', code: 'FRPAU', region: 'Île-de-France' },
  
  // Major cities
  { name: 'Lyon Part-Dieu', code: 'FRLPD', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Lyon Perrache', code: 'FRLPE', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Marseille Saint-Charles', code: 'FRMSC', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Lille Europe', code: 'FRLLE', region: 'Hauts-de-France' },
  { name: 'Lille Flandres', code: 'FRLLF', region: 'Hauts-de-France' },
  { name: 'Toulouse Matabiau', code: 'FRTLS', region: 'Occitanie' },
  { name: 'Nice Ville', code: 'FRNIC', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Nantes', code: 'FRNTE', region: 'Pays de la Loire' },
  { name: 'Strasbourg', code: 'FRXWG', region: 'Grand Est' },
  { name: 'Montpellier Saint-Roch', code: 'FRMPL', region: 'Occitanie' },
  { name: 'Bordeaux Saint-Jean', code: 'FRBOJ', region: 'Nouvelle-Aquitaine' },
  { name: 'Rennes', code: 'FRRNS', region: 'Bretagne' },
  { name: 'Reims', code: 'FRREI', region: 'Grand Est' },
  { name: 'Rouen Rive Droite', code: 'FRROU', region: 'Normandie' },
  { name: 'Toulon', code: 'FRTLN', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Grenoble', code: 'FRGRE', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Dijon Ville', code: 'FRDIJ', region: 'Bourgogne-Franche-Comté' },
  { name: 'Angers Saint-Laud', code: 'FRANG', region: 'Pays de la Loire' },
  { name: 'Nîmes', code: 'FRNIM', region: 'Occitanie' },
  { name: 'Clermont-Ferrand', code: 'FRCFD', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Aix-en-Provence TGV', code: 'FRAIX', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Avignon TGV', code: 'FRAVG', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Le Mans', code: 'FRLMS', region: 'Pays de la Loire' },
  { name: 'Tours', code: 'FRTRS', region: 'Centre-Val de Loire' },
  { name: 'Metz Ville', code: 'FRETZ', region: 'Grand Est' },
  { name: 'Nancy Ville', code: 'FRNCY', region: 'Grand Est' },
  { name: 'Besançon Viotte', code: 'FRBES', region: 'Bourgogne-Franche-Comté' },
  { name: 'Perpignan', code: 'FRPPG', region: 'Occitanie' },
  { name: 'Orléans', code: 'FRORL', region: 'Centre-Val de Loire' },
  { name: 'Mulhouse Ville', code: 'FRMUL', region: 'Grand Est' },
  { name: 'Caen', code: 'FRCAE', region: 'Normandie' },
  { name: 'Brest', code: 'FRBRS', region: 'Bretagne' },
  { name: 'Le Havre', code: 'FRLEH', region: 'Normandie' },
  { name: 'Amiens', code: 'FRAMI', region: 'Hauts-de-France' },
  { name: 'Limoges Bénédictins', code: 'FRLIM', region: 'Nouvelle-Aquitaine' },
  { name: 'Poitiers', code: 'FRPOI', region: 'Nouvelle-Aquitaine' },
  { name: 'Cannes', code: 'FRCAN', region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Saint-Étienne Châteaucreux', code: 'FRSTE', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Annecy', code: 'FRANN', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Chambéry', code: 'FRCHY', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Valence TGV', code: 'FRVAL', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Angoulême', code: 'FRANL', region: 'Nouvelle-Aquitaine' },
  { name: 'Biarritz', code: 'FRBIA', region: 'Nouvelle-Aquitaine' },
  { name: 'Quimper', code: 'FRQUI', region: 'Bretagne' },
  { name: 'La Rochelle Ville', code: 'FRLRH', region: 'Nouvelle-Aquitaine' },
  { name: 'Vannes', code: 'FRVAN', region: 'Bretagne' },
  { name: 'Arras', code: 'FRARS', region: 'Hauts-de-France' },
  { name: 'Dunkerque', code: 'FRDKK', region: 'Hauts-de-France' },
  { name: 'Saint-Malo', code: 'FRSML', region: 'Bretagne' },
  { name: 'Belfort', code: 'FRBEL', region: 'Bourgogne-Franche-Comté' },
  { name: 'Colmar', code: 'FRCMR', region: 'Grand Est' },
  { name: 'Marne-la-Vallée Chessy (Disneyland)', code: 'FRMLV', region: 'Île-de-France' },
  { name: 'Massy TGV', code: 'FRMTG', region: 'Île-de-France' },
  { name: 'Charles de Gaulle 2 TGV', code: 'FRCDG', region: 'Île-de-France' },
]

// Normalize string for search (remove accents, lowercase)
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Search stations by name
export function searchStations(query: string): Station[] {
  const normalizedQuery = normalizeString(query)
  
  if (normalizedQuery.length < 2) {
    return []
  }

  return STATIONS_DATA
    .filter(station => {
      const normalizedName = normalizeString(station.name)
      const normalizedRegion = station.region ? normalizeString(station.region) : ''
      
      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedRegion.includes(normalizedQuery)
      )
    })
    .sort((a, b) => {
      // Prioritize exact matches and start-of-word matches
      const aNorm = normalizeString(a.name)
      const bNorm = normalizeString(b.name)
      
      if (aNorm.startsWith(normalizedQuery) && !bNorm.startsWith(normalizedQuery)) {
        return -1
      }
      if (!aNorm.startsWith(normalizedQuery) && bNorm.startsWith(normalizedQuery)) {
        return 1
      }
      
      return a.name.localeCompare(b.name)
    })
    .slice(0, 10) // Limit to 10 results
}

// Get station by code
export function getStationByCode(code: string): Station | undefined {
  return STATIONS_DATA.find(station => station.code === code)
}

// Get station by name
export function getStationByName(name: string): Station | undefined {
  const normalizedName = normalizeString(name)
  return STATIONS_DATA.find(
    station => normalizeString(station.name) === normalizedName
  )
}