import { Event, AppFilters } from '../types';

export const MOCK_EVENTS: Event[] = [
  // ─── ARAGÓN ───────────────────────────────────────────────────────────────
  {
    id: 'ev001',
    name: 'Fiestas del Ángel de Teruel',
    dateStart: '2026-07-10',
    dateEnd: '2026-07-18',
    time: 'Todo el día',
    location: 'Centro histórico de Teruel',
    town: 'Teruel',
    region: 'aragon',
    coordinates: { latitude: 40.3456, longitude: -1.1065 },
    category: 'festival',
    size: 'grande',
    description:
      'Las fiestas más importantes de la capital turolense, en honor al Ángel custodio de la ciudad. Incluye procesiones, vaquillas, fuegos artificiales, conciertos y la tradicional bajada del Ángel desde el viaducto.',
    imageUrl: 'https://picsum.photos/seed/angel-teruel/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Ayuntamiento de Teruel',
    tags: ['vaquillas', 'procesión', 'fuegos artificiales', 'bajada del ángel'],
    isFree: true,
  },
  {
    id: 'ev002',
    name: 'Mercado Medieval de Albarracín',
    dateStart: '2026-08-01',
    dateEnd: '2026-08-04',
    time: '11:00 - 22:00',
    location: 'Casco histórico de Albarracín',
    town: 'Albarracín',
    region: 'aragon',
    coordinates: { latitude: 40.4076, longitude: -1.448 },
    category: 'mercado',
    size: 'mediano',
    description:
      'Un viaje al medievo en el pueblo medieval mejor conservado de España. Artesanos, juglares, caballeros y mercaderes llenan las calles de la villa amurallada sobre el río Guadalaviar.',
    imageUrl: 'https://picsum.photos/seed/medieval-albarracin/800/450',
    source: 'facebook',
    sourceDetail: 'Compartido desde Facebook · Turismo Albarracín',
    tags: ['artesanía', 'medieval', 'juglares', 'caballeros'],
    isFree: true,
  },
  {
    id: 'ev003',
    name: 'Festival de Jazz Mora de Rubielos',
    dateStart: '2026-06-06',
    dateEnd: '2026-06-08',
    time: '19:00 - 23:00',
    location: 'Castillo-Colegiata de Mora de Rubielos',
    town: 'Mora de Rubielos',
    region: 'aragon',
    coordinates: { latitude: 40.252, longitude: -0.7476 },
    category: 'concierto',
    size: 'mediano',
    description:
      'Festival de jazz en el marco incomparable del castillo medieval. Artistas nacionales e internacionales se presentan bajo las estrellas del Maestrazgo turolense.',
    imageUrl: 'https://picsum.photos/seed/jazz-mora-rubielos/800/450',
    source: 'instagram',
    sourceDetail: 'Compartido desde Instagram · @festivaljazmora',
    tags: ['jazz', 'música', 'castillo', 'verano'],
    isFree: false,
    price: 'Desde 12€',
  },
  {
    id: 'ev004',
    name: 'Feria Agroalimentaria de Teruel',
    dateStart: '2026-05-23',
    dateEnd: '2026-05-25',
    time: '10:00 - 20:00',
    location: 'Recinto Ferial de Teruel',
    town: 'Teruel',
    region: 'aragon',
    coordinates: { latitude: 40.3456, longitude: -1.1065 },
    category: 'gastronomia',
    size: 'mediano',
    description:
      'Feria de productos locales de la provincia: jamón DOP Teruel, trufa negra, aceite de oliva del Bajo Aragón, quesos artesanales y vinos del Jiloca.',
    imageUrl: 'https://picsum.photos/seed/agroalimentaria-teruel/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Diputación Provincial de Teruel',
    tags: ['jamón DOP', 'trufa', 'aceite', 'quesos', 'gastronomía local'],
    isFree: true,
  },
  {
    id: 'ev005',
    name: 'Fiestas de San Pascual - Valderrobres',
    dateStart: '2026-05-20',
    dateEnd: '2026-05-22',
    time: 'Todo el día',
    location: 'Plaza Mayor de Valderrobres',
    town: 'Valderrobres',
    region: 'aragon',
    coordinates: { latitude: 40.886, longitude: 0.1574 },
    category: 'fiesta',
    size: 'pequeño',
    description:
      'Fiestas patronales del municipio de Valderrobres con danzas tradicionales, gigantes y cabezudos, conciertos en la plaza y la tradicional volta del sant.',
    imageUrl: 'https://picsum.photos/seed/san-pascual-valderrobres/800/450',
    source: 'whatsapp',
    sourceDetail: 'Compartido desde WhatsApp · Grupo Peña La Troya',
    tags: ['gigantes', 'danza', 'patronales', 'Matarraña'],
    isFree: true,
  },
  {
    id: 'ev006',
    name: 'Mercado Artesanal de Rubielos de Mora',
    dateStart: '2026-06-15',
    time: '09:00 - 14:00',
    location: 'Plaza del Portal, Rubielos de Mora',
    town: 'Rubielos de Mora',
    region: 'aragon',
    coordinates: { latitude: 40.2027, longitude: -0.6867 },
    category: 'mercado',
    size: 'pequeño',
    description:
      'Mercado mensual de artesanía y productos locales en el precioso portal medieval. Cerámica, tejidos, mermeladas artesanas y productos de la tierra.',
    imageUrl: 'https://picsum.photos/seed/mercado-rubielos-mora/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Ayuntamiento de Rubielos de Mora',
    tags: ['artesanía', 'mercado mensual', 'cerámica', 'local'],
    isFree: true,
  },
  {
    id: 'ev007',
    name: 'Festival de Guitarra Clásica de Beceite',
    dateStart: '2026-07-20',
    time: '20:00',
    location: 'Casa de la Cultura, Beceite',
    town: 'Beceite',
    region: 'aragon',
    coordinates: { latitude: 40.8077, longitude: 0.1768 },
    category: 'concierto',
    size: 'pequeño',
    description:
      'Concierto de guitarra clásica española en el corazón del Matarraña. Ambiente íntimo en un municipio declarado uno de los más bonitos de España.',
    imageUrl: 'https://picsum.photos/seed/guitarra-beceite/800/450',
    source: 'facebook',
    sourceDetail: 'Compartido desde Facebook · Asociación Cultural Beceite',
    tags: ['guitarra clásica', 'música', 'Matarraña', 'pueblo bonito'],
    isFree: false,
    price: '8€',
  },
  {
    id: 'ev008',
    name: 'Triatlón Popular Ciudad de Teruel',
    dateStart: '2026-09-14',
    time: '08:00',
    location: 'Zona Deportiva Municipal, Teruel',
    town: 'Teruel',
    region: 'aragon',
    coordinates: { latitude: 40.3456, longitude: -1.1065 },
    category: 'deportes',
    size: 'pequeño',
    description:
      'Triatlón popular para deportistas de todos los niveles. Modalidades sprint (750m nado / 20km bici / 5km carrera) y olímpica. Inscripciones hasta el 10 de septiembre.',
    imageUrl: 'https://picsum.photos/seed/triatlon-teruel/800/450',
    source: 'usuario',
    sourceDetail: 'Enviado por Club Triatlón Teruel',
    tags: ['triatlón', 'deporte', 'inscripciones abiertas'],
    isFree: false,
    price: '25€ (sprint) / 35€ (olímpico)',
  },
  {
    id: 'ev009',
    name: 'Romería Virgen del Tremedal',
    dateStart: '2026-09-07',
    time: '09:00',
    location: 'Ermita del Tremedal, Orihuela del Tremedal',
    town: 'Orihuela del Tremedal',
    region: 'aragon',
    coordinates: { latitude: 40.5547, longitude: -1.647 },
    category: 'festival',
    size: 'mediano',
    description:
      'Una de las romerías más concurridas de la provincia. Miles de peregrinos suben al santuario de la Virgen del Tremedal en una jornada de fe y tradición popular.',
    imageUrl: 'https://picsum.photos/seed/tremedal-romeria/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Ayuntamiento de Orihuela del Tremedal',
    tags: ['romería', 'virgen', 'tradición', 'senderismo'],
    isFree: true,
  },
  {
    id: 'ev010',
    name: 'Fiestas Patronales de Alcañiz',
    dateStart: '2026-09-05',
    dateEnd: '2026-09-08',
    time: 'Todo el día',
    location: 'Centro de Alcañiz',
    town: 'Alcañiz',
    region: 'aragon',
    coordinates: { latitude: 41.0481, longitude: -0.1296 },
    category: 'fiesta',
    size: 'mediano',
    description:
      'Las fiestas del Pilar en Alcañiz, la segunda ciudad de Teruel. Toros, peñas, conciertos y el espectacular pregón desde el castillo Calatravo.',
    imageUrl: 'https://picsum.photos/seed/fiestas-alcaniz/800/450',
    source: 'whatsapp',
    sourceDetail: 'Compartido desde WhatsApp · Ayuntamiento de Alcañiz',
    tags: ['toros', 'peñas', 'castillo', 'patronales'],
    isFree: true,
  },
  {
    id: 'ev011',
    name: 'Gran Carrera de Montaña Gúdar-Javalambre',
    dateStart: '2026-06-29',
    time: '07:30',
    location: 'Salida desde Gúdar, llegada a Javalambre',
    town: 'Gúdar',
    region: 'aragon',
    coordinates: { latitude: 40.25, longitude: -0.7167 },
    category: 'deportes',
    size: 'mediano',
    description:
      'Ultra trail de 42 km por las sierras de Gúdar y Javalambre con 2.800m de desnivel positivo. Categorías: ultra (42km), maratón (28km) y familiar (10km).',
    imageUrl: 'https://picsum.photos/seed/carrera-gudar/800/450',
    source: 'usuario',
    sourceDetail: 'Enviado por Asociación Trail Gúdar-Javalambre',
    tags: ['ultra trail', '42km', 'sierra', 'montaña'],
    isFree: false,
    price: 'Desde 35€',
  },
  {
    id: 'ev012',
    name: 'Nits de Cine a la Fresca · Mora de Rubielos',
    dateStart: '2026-07-04',
    dateEnd: '2026-08-28',
    time: '22:00',
    location: 'Patio del Castillo, Mora de Rubielos',
    town: 'Mora de Rubielos',
    region: 'aragon',
    coordinates: { latitude: 40.252, longitude: -0.7476 },
    category: 'comunidad',
    size: 'pequeño',
    description:
      'Cine de verano al aire libre en el patio del castillo. Todos los viernes de julio y agosto, películas en versión original con subtítulos en español.',
    imageUrl: 'https://picsum.photos/seed/cine-verano-mora/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Ayuntamiento de Mora de Rubielos',
    tags: ['cine de verano', 'versión original', 'viernes', 'semanal'],
    isFree: false,
    price: '3€',
  },

  // ─── CATALUÑA ─────────────────────────────────────────────────────────────
  {
    id: 'ev013',
    name: 'Festa Major de Gràcia',
    dateStart: '2026-08-15',
    dateEnd: '2026-08-21',
    time: 'Todo el día',
    location: 'Barrio de Gràcia, Barcelona',
    town: 'Barcelona',
    region: 'cataluña',
    coordinates: { latitude: 41.3982, longitude: 2.154 },
    category: 'festival',
    size: 'grande',
    description:
      'Una de las fiestas más populares de Barcelona: las calles del barrio de Gràcia se transforman con decoraciones vecinales, conciertos, castellers, gegants y actividades para todas las edades.',
    imageUrl: 'https://picsum.photos/seed/gracia-barcelona/800/450',
    source: 'instagram',
    sourceDetail: 'Compartido desde Instagram · @festamajordegracia',
    tags: ['calles decoradas', 'castellers', 'gegants', 'barrio'],
    isFree: true,
  },
  {
    id: 'ev014',
    name: 'Festival Internacional de Música de Peralada',
    dateStart: '2026-07-18',
    dateEnd: '2026-08-02',
    time: '21:30',
    location: 'Jardins del Castell de Peralada',
    town: 'Peralada',
    region: 'cataluña',
    coordinates: { latitude: 42.3007, longitude: 3.0178 },
    category: 'concierto',
    size: 'grande',
    description:
      'Uno de los festivales de música clásica y ópera más prestigiosos del mundo, en el espectacular entorno del castillo de Peralada. Grandes solistas y orquestas internacionales.',
    imageUrl: 'https://picsum.photos/seed/peralada-festival/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Festival de Música de Peralada',
    tags: ['ópera', 'clásica', 'internacional', 'castillo'],
    isFree: false,
    price: 'Desde 45€',
  },
  {
    id: 'ev015',
    name: 'Mercat Medieval de Vic',
    dateStart: '2026-06-06',
    dateEnd: '2026-06-08',
    time: '10:00 - 21:00',
    location: 'Centre històric de Vic',
    town: 'Vic',
    region: 'cataluña',
    coordinates: { latitude: 41.9302, longitude: 2.2546 },
    category: 'mercado',
    size: 'grande',
    description:
      'El mercado medieval más grande de Catalunya con más de 400 puestos. Artesanos, caballeros medievales, juglares, música de época y gastronomía medieval.',
    imageUrl: 'https://picsum.photos/seed/mercat-medieval-vic/800/450',
    source: 'facebook',
    sourceDetail: 'Compartido desde Facebook · Mercat Medieval de Vic',
    tags: ['medieval', 'artesanía', '400 puestos', 'caballeros'],
    isFree: true,
  },
  {
    id: 'ev016',
    name: 'Festa Major de Sitges',
    dateStart: '2026-08-23',
    dateEnd: '2026-08-26',
    time: 'Todo el día',
    location: 'Sitges – centre i passeig marítim',
    town: 'Sitges',
    region: 'cataluña',
    coordinates: { latitude: 41.2359, longitude: 1.8125 },
    category: 'festival',
    size: 'mediano',
    description:
      'La festa major de esta joya mediterránea con gegants, castellers, correbous, conciertos en la playa y el tradicional ball de diables con fuego.',
    imageUrl: 'https://picsum.photos/seed/festa-sitges/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Ajuntament de Sitges',
    tags: ['gegants', 'castellers', 'correbous', 'playa'],
    isFree: true,
  },
  {
    id: 'ev017',
    name: 'Fira del Vi de Falset – DO Montsant',
    dateStart: '2026-10-04',
    dateEnd: '2026-10-05',
    time: '11:00 - 19:00',
    location: 'Plaça de la Quartera, Falset',
    town: 'Falset',
    region: 'cataluña',
    coordinates: { latitude: 41.15, longitude: 0.8246 },
    category: 'gastronomia',
    size: 'mediano',
    description:
      'Feria de vinos de la DO Montsant con más de 30 bodegas participantes. Catas guiadas, maridajes con productos locales y visitas en burro a los viñedos.',
    imageUrl: 'https://picsum.photos/seed/fira-vi-falset/800/450',
    source: 'instagram',
    sourceDetail: 'Compartido desde Instagram · @domontsant',
    tags: ['vino', 'DO Montsant', 'cata', 'bodegas'],
    isFree: false,
    price: 'Copa degustació 6€',
  },
  {
    id: 'ev018',
    name: 'Festa de la Sardana de Ripoll',
    dateStart: '2026-06-28',
    dateEnd: '2026-06-29',
    time: '17:00 - 22:00',
    location: "Plaça de l'Abat Oliba, Ripoll",
    town: 'Ripoll',
    region: 'cataluña',
    coordinates: { latitude: 42.2006, longitude: 2.1909 },
    category: 'festival',
    size: 'mediano',
    description:
      "Festival dedicado a la sardana, el baile tradicional catalán. Aplecs de sardanistes de toda Catalunya, coblas en vivo, concurso de sardanas y actividades culturales.",
    imageUrl: 'https://picsum.photos/seed/sardana-ripoll/800/450',
    source: 'facebook',
    sourceDetail: 'Compartido desde Facebook · Ajuntament de Ripoll',
    tags: ['sardana', 'baile tradicional', 'cobla', 'patrimonio'],
    isFree: true,
  },
  {
    id: 'ev019',
    name: 'Festival Cruïlla Barcelona',
    dateStart: '2026-07-10',
    dateEnd: '2026-07-12',
    time: '17:00 - 02:00',
    location: 'Parc de la Ciutadella, Barcelona',
    town: 'Barcelona',
    region: 'cataluña',
    coordinates: { latitude: 41.387, longitude: 2.186 },
    category: 'concierto',
    size: 'grande',
    description:
      'Festival de música urbana, reggae, soul y funk en el corazón de Barcelona. Headliners internacionales, food trucks y un ambiente multicultural inigualable.',
    imageUrl: 'https://picsum.photos/seed/cruilla-barcelona/800/450',
    source: 'instagram',
    sourceDetail: 'Compartido desde Instagram · @cruillabcn',
    tags: ['reggae', 'soul', 'urbano', 'Barcelona', 'festival grande'],
    isFree: false,
    price: 'Abono 3 días: 120€',
  },
  {
    id: 'ev020',
    name: 'Verbena de Sant Joan – Barcelona',
    dateStart: '2026-06-23',
    time: '21:00',
    location: 'Tota Barcelona i el litoral',
    town: 'Barcelona',
    region: 'cataluña',
    coordinates: { latitude: 41.3851, longitude: 2.1734 },
    category: 'fiesta',
    size: 'grande',
    description:
      'La noche más mágica del año: fuegos artificiales en la playa, hogueras, coca de Sant Joan y la verbena en cada barrio. Una tradición que une a toda Catalunya.',
    imageUrl: 'https://picsum.photos/seed/sant-joan-barcelona/800/450',
    source: 'facebook',
    sourceDetail: 'Compartido desde Facebook · Ajuntament de Barcelona',
    tags: ['fuegos artificiales', 'hogueras', 'Sant Joan', 'nocturno'],
    isFree: true,
  },
  {
    id: 'ev021',
    name: 'Mercat de Pagès d\'Olot – Cada Sábado',
    dateStart: '2026-05-23',
    time: '08:00 - 14:00',
    location: 'Plaça del Mercat, Olot',
    town: 'Olot',
    region: 'cataluña',
    coordinates: { latitude: 42.1811, longitude: 2.4878 },
    category: 'mercado',
    size: 'pequeño',
    description:
      'Mercado semanal de agricultores y productores locales de la Garrotxa. Verduras de temporada ecológicas, quesos de cabra, embutidos caseros y flores.',
    imageUrl: 'https://picsum.photos/seed/mercat-pages-olot/800/450',
    source: 'whatsapp',
    sourceDetail: "Compartido desde WhatsApp · Productors de la Garrotxa",
    tags: ['agricultor', 'ecológico', 'semanal', 'local', 'sábado'],
    isFree: true,
  },
  {
    id: 'ev022',
    name: 'Cursa Popular de la Garrotxa',
    dateStart: '2026-06-14',
    time: '09:00',
    location: 'Parc Natural de la Zona Volcànica, Olot',
    town: 'Olot',
    region: 'cataluña',
    coordinates: { latitude: 42.1811, longitude: 2.4878 },
    category: 'deportes',
    size: 'pequeño',
    description:
      'Carrera popular por los senderos volcánicos de la Garrotxa. 10 km y 5 km, apta para todos los niveles. Paisaje único de volcanes extintos y hayedos.',
    imageUrl: 'https://picsum.photos/seed/cursa-garrotxa/800/450',
    source: 'usuario',
    sourceDetail: 'Enviado por Club Atletisme Olot',
    tags: ['carrera', 'volcanes', 'trail', 'naturaleza'],
    isFree: false,
    price: '12€',
  },
  {
    id: 'ev023',
    name: 'Fira de Primavera de Reus',
    dateStart: '2026-05-30',
    dateEnd: '2026-06-01',
    time: '10:00 - 21:00',
    location: 'Recinto Firal de Reus',
    town: 'Reus',
    region: 'cataluña',
    coordinates: { latitude: 41.1543, longitude: 1.1071 },
    category: 'mercado',
    size: 'mediano',
    description:
      'Feria multisectorial de Reus con artesanía, moda, gastronomía y cultura. La ciudad natal de Gaudí se viste de fiesta con más de 200 expositores.',
    imageUrl: 'https://picsum.photos/seed/fira-primavera-reus/800/450',
    source: 'facebook',
    sourceDetail: 'Compartido desde Facebook · Fira de Reus',
    tags: ['artesanía', 'moda', 'Gaudí', '200 expositores'],
    isFree: true,
  },
  {
    id: 'ev024',
    name: 'Mercat del Ram de Vic',
    dateStart: '2026-05-25',
    dateEnd: '2026-05-28',
    time: '10:00 - 20:00',
    location: 'Plaça Major i entorns, Vic',
    town: 'Vic',
    region: 'cataluña',
    coordinates: { latitude: 41.9302, longitude: 2.2546 },
    category: 'mercado',
    size: 'mediano',
    description:
      'Mercado tradicional de Vic, uno de los más importantes de Catalunya. Ganadería, flores, artesanía y los famosos embutidos y quesos de Osona.',
    imageUrl: 'https://picsum.photos/seed/mercat-ram-vic/800/450',
    source: 'ayuntamiento',
    sourceDetail: 'Ajuntament de Vic',
    tags: ['ganadería', 'flores', 'embutidos', 'tradicional'],
    isFree: true,
  },
  {
    id: 'ev025',
    name: 'Fira de Santpedor',
    dateStart: '2026-09-13',
    dateEnd: '2026-09-14',
    time: '10:00 - 20:00',
    location: 'Centre de Santpedor',
    town: 'Santpedor',
    region: 'cataluña',
    coordinates: { latitude: 41.738, longitude: 1.8741 },
    category: 'comunidad',
    size: 'pequeño',
    description:
      'Fira anual de Santpedor con productos artesanales, alimentación local, maquinaria agrícola y actividades familiares para todos los públicos.',
    imageUrl: 'https://picsum.photos/seed/fira-santpedor/800/450',
    source: 'whatsapp',
    sourceDetail: 'Compartido desde WhatsApp · Ajuntament de Santpedor',
    tags: ['fira', 'familiar', 'artesanía', 'local'],
    isFree: true,
  },
];

const TODAY = new Date('2026-05-18');

export function getFilteredEvents(filters: AppFilters): Event[] {
  return MOCK_EVENTS.filter((event) => {
    if (filters.category !== 'all' && event.category !== filters.category) return false;
    if (filters.region !== 'todas' && event.region !== filters.region) return false;

    const eventDate = new Date(event.dateStart);
    if (filters.dateFilter === 'hoy') {
      if (event.dateStart !== '2026-05-18') return false;
    } else if (filters.dateFilter === 'semana') {
      const weekEnd = new Date(TODAY);
      weekEnd.setDate(weekEnd.getDate() + 7);
      if (eventDate < TODAY || eventDate > weekEnd) return false;
    } else if (filters.dateFilter === 'mes') {
      const monthEnd = new Date(TODAY);
      monthEnd.setDate(monthEnd.getDate() + 30);
      if (eventDate < TODAY || eventDate > monthEnd) return false;
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (
        !event.name.toLowerCase().includes(q) &&
        !event.town.toLowerCase().includes(q) &&
        !event.description.toLowerCase().includes(q) &&
        !event.tags.some((t) => t.toLowerCase().includes(q))
      )
        return false;
    }

    return true;
  }).sort((a, b) => a.dateStart.localeCompare(b.dateStart));
}

export function getEventById(id: string): Event | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

export function getEventsNearLocation(lat: number, lng: number, radiusKm: number): Event[] {
  return MOCK_EVENTS.filter((event) => {
    const dist = getDistanceKm(lat, lng, event.coordinates.latitude, event.coordinates.longitude);
    return dist <= radiusKm;
  }).sort((a, b) => {
    const distA = getDistanceKm(lat, lng, a.coordinates.latitude, a.coordinates.longitude);
    const distB = getDistanceKm(lat, lng, b.coordinates.latitude, b.coordinates.longitude);
    return distA - distB;
  });
}

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDateRange(dateStart: string, dateEnd?: string): string {
  function fmt(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
  // Parse as local midnight using the year/month/day constructor — avoids UTC-shift bugs
  const toLocal = (s: string) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  const start = toLocal(dateStart);
  const result = !dateEnd ? fmt(start) : `Del ${fmt(start)} al ${fmt(toLocal(dateEnd))}`;
  console.log('[fmt] raw:', JSON.stringify(dateStart), JSON.stringify(dateEnd), '→', result);
  return result;
}
