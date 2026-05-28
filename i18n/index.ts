import { getLocales } from 'expo-localization';

const deviceLang: 'en' | 'es' =
  getLocales()[0]?.languageCode === 'en' ? 'en' : 'es';

const es = {
  // Navigation / headers
  back: 'Volver',

  // Tabs
  tabHome: 'Inicio',
  tabMap: 'Mapa',
  tabSubmit: 'Enviar',
  tabProfile: 'Perfil',

  // Home screen
  tagline: 'Agenda local de España',
  eventSingular: 'evento',
  eventPlural: 'eventos',
  clearFilters: 'Limpiar filtros',

  // Map screen
  mapRegionAll: '🇪🇸 Todas',
  mapRegionTeruel: '🏔️ Teruel',
  mapRegionCatalunya: '🌊 Catalunya',
  eventsCount: (n: number) => `${n} eventos`,
  viewDetails: 'Ver detalles →',

  // Event detail screen
  eventNotFound: 'Evento no encontrado',
  backLink: '← Volver',
  infoDate: 'Fecha',
  infoTime: 'Hora',
  infoPlace: 'Lugar',
  infoTown: 'Municipio',
  infoPrice: 'Precio',
  infoFree: 'Entrada gratuita',
  sectionAbout: 'Sobre el evento',
  sectionSource: 'Fuente del evento',
  demandTitle: 'Alta demanda prevista',
  demandTextBig: 'Este evento puede incrementar la ocupación hotelera en la zona. Considerado gran evento.',
  demandTextMedium: 'Este evento puede incrementar la ocupación hotelera en la zona. Considerado evento mediano.',
  saveFavorite: '🤍 Guardar en favoritos',
  savedFavorite: '❤️ Guardado en favoritos',
  shareVia: 'Via QuéHay – Agenda local',

  // Profile screen
  profileTitle: 'Mi perfil',
  accountConnected: 'Cuenta conectada',
  syncBadge: '✓ Sync',
  signOut: 'Cerrar sesión',
  signInTitle: 'Inicia sesión',
  signInSubtitle: 'Sincroniza tus favoritos en todos tus dispositivos',
  emailPlaceholder: 'tu@email.com',
  passwordPlaceholder: 'Contraseña',
  signInBtn: 'Entrar',
  signUpBtn: 'Crear cuenta',
  signUpConfirmEmail: 'Revisa tu email para confirmar tu cuenta y luego inicia sesión.',
  savedEventsLabel: 'Eventos guardados',
  emptyFavorites: 'Guarda eventos tocando el corazón en las tarjetas',
  infoLabel: 'Información',
  infoRegion: 'Cubrimos Teruel y Catalunya',
  infoUpdated: 'Actualizado diariamente',
  infoSources: 'Eventos de WhatsApp, Facebook, Instagram, Milanuncios y Ayuntamientos',
  infoShare: 'Comparte eventos de tu pueblo en la pestaña ➕',
  appVersion: 'QuéHay v1.0 · Hecho con ❤️ para el turismo rural',
  settingsLabel: 'Ajustes',
  languageLabel: 'Idioma',

  // Submit screen
  submitTitle: 'Comparte un evento',
  submitSubtitle: 'Sube el póster y extraemos los datos automáticamente',
  uploadTitle: 'Sube el póster del evento',
  uploadSubtitle: 'Foto de cartel, imagen de WhatsApp o redes sociales',
  galleryBtn: '📂 Galería',
  cameraBtn: '📷 Cámara',
  changeImage: 'Cambiar imagen',
  analyzeBtn: '🤖 Analizar póster automáticamente',
  analyzing: 'Analizando póster con IA...',
  extractedNote: '✨ Datos extraídos del póster. Revisa y corrige si es necesario.',
  fieldEventName: 'Nombre del evento *',
  fieldEventNamePlaceholder: 'Ej: Fiestas del Ángel',
  fieldDateStart: 'Fecha inicio *',
  fieldTime: 'Hora',
  fieldTown: 'Municipio *',
  fieldTownPlaceholder: 'Ej: Mora de Rubielos',
  fieldRegion: 'Región *',
  fieldCategory: 'Categoría *',
  fieldDescription: 'Descripción',
  fieldDescriptionPlaceholder: 'Describe brevemente el evento...',
  fieldIsFree: 'Precio',
  fieldIsFreeYes: 'Gratis',
  fieldIsFreeNo: 'De pago',
  fieldPrice: 'Precio (ej: 10€, Desde 5€)',
  sourceInfoTitle: '📱 Fuente del evento',
  sourceInfoText: 'Tu evento se publicará como "Compartido por la comunidad". Si eres el Ayuntamiento u organización oficial, contacta con nosotros para verificar tu cuenta.',
  submitBtn: 'Enviar evento →',
  submitDisclaimer: 'Al enviar confirmas que tienes permiso para compartir este evento y que los datos son correctos.',
  alertMissingData: 'Faltan datos',
  alertMissingDataMsg: 'Completa nombre, fecha, municipio, región y categoría.',
  alertError: 'Error',
  alertErrorMsg: 'No se pudo enviar el evento. Inténtalo de nuevo.',
  successTitle: '¡Evento enviado!',
  successSubtitle: 'Tu evento ha sido enviado para revisión. Aparecerá en la app en 24-48 horas.',
  submitAnother: 'Enviar otro evento',
  retryPoster: 'Otro póster',

  // Components
  searchPlaceholder: 'Buscar eventos, pueblos...',
  emptyStateTitle: 'No hay eventos',
  emptyStateSubtitle: 'Prueba a cambiar los filtros o busca en otra zona.',
  freeBadge: 'GRATIS',
  regionTeruel: 'Teruel',
  regionCatalunya: 'Catalunya',

  // Category labels
  catAll: 'Todos',
  catFestival: 'Festivales',
  catFiesta: 'Fiestas',
  catMercado: 'Mercados',
  catConcierto: 'Conciertos',
  catGastronomia: 'Gastronomía',
  catDeportes: 'Deportes',
  catComunidad: 'Comunidad',

  // Date filter labels
  dfAll: 'Todas',
  dfToday: 'Hoy',
  dfWeek: 'Esta semana',
  dfMonth: 'Este mes',

  // Region labels
  rAll: 'Toda España',
  rTeruel: 'Teruel',
  rCatalunya: 'Catalunya',

  // Size labels
  sizeBig: 'Gran evento',
  sizeMedium: 'Evento mediano',
  sizeSmall: 'Evento local',

  // Source labels
  srcTownHall: 'Ayuntamiento',
  srcCommunity: 'Comunidad',

  // Language picker
  langPickerTitle: '¿En qué idioma quieres la app?',
  langEs: 'Español',
  langEn: 'English',
};

const en: typeof es = {
  back: 'Back',
  tabHome: 'Home',
  tabMap: 'Map',
  tabSubmit: 'Submit',
  tabProfile: 'Profile',
  tagline: 'Local events in Spain',
  eventSingular: 'event',
  eventPlural: 'events',
  clearFilters: 'Clear filters',
  mapRegionAll: '🇪🇸 All',
  mapRegionTeruel: '🏔️ Teruel',
  mapRegionCatalunya: '🌊 Catalunya',
  eventsCount: (n: number) => `${n} event${n !== 1 ? 's' : ''}`,
  viewDetails: 'View details →',
  eventNotFound: 'Event not found',
  backLink: '← Back',
  infoDate: 'Date',
  infoTime: 'Time',
  infoPlace: 'Venue',
  infoTown: 'Town',
  infoPrice: 'Price',
  infoFree: 'Free entry',
  sectionAbout: 'About this event',
  sectionSource: 'Event source',
  demandTitle: 'High demand expected',
  demandTextBig: 'This event is expected to increase hotel occupancy in the area. Classified as a major event.',
  demandTextMedium: 'This event is expected to increase hotel occupancy in the area. Classified as a medium event.',
  saveFavorite: '🤍 Save to favourites',
  savedFavorite: '❤️ Saved to favourites',
  shareVia: 'Via QuéHay – Local events',
  profileTitle: 'My profile',
  accountConnected: 'Account connected',
  syncBadge: '✓ Sync',
  signOut: 'Sign out',
  signInTitle: 'Sign in',
  signInSubtitle: 'Sync your favourites across all your devices',
  emailPlaceholder: 'you@email.com',
  passwordPlaceholder: 'Password',
  signInBtn: 'Sign in',
  signUpBtn: 'Create account',
  signUpConfirmEmail: 'Check your email to confirm your account, then sign in.',
  savedEventsLabel: 'Saved events',
  emptyFavorites: 'Save events by tapping the heart on cards',
  infoLabel: 'Information',
  infoRegion: 'We cover Teruel and Catalunya',
  infoUpdated: 'Updated daily',
  infoSources: 'Events from WhatsApp, Facebook, Instagram, Milanuncios and Town Halls',
  infoShare: 'Share events from your town in the ➕ tab',
  appVersion: 'QuéHay v1.0 · Made with ❤️ for rural tourism',
  settingsLabel: 'Settings',
  languageLabel: 'Language',
  submitTitle: 'Share an event',
  submitSubtitle: 'Upload the poster and we extract the details automatically',
  uploadTitle: 'Upload the event poster',
  uploadSubtitle: 'Photo of a flyer, WhatsApp image or social media post',
  galleryBtn: '📂 Gallery',
  cameraBtn: '📷 Camera',
  changeImage: 'Change image',
  analyzeBtn: '🤖 Analyse poster automatically',
  analyzing: 'Analysing poster with AI...',
  extractedNote: '✨ Details extracted from poster. Review and correct if needed.',
  fieldEventName: 'Event name *',
  fieldEventNamePlaceholder: 'e.g. Angel Festival',
  fieldDateStart: 'Start date *',
  fieldTime: 'Time',
  fieldTown: 'Town *',
  fieldTownPlaceholder: 'e.g. Mora de Rubielos',
  fieldRegion: 'Region *',
  fieldCategory: 'Category *',
  fieldDescription: 'Description',
  fieldDescriptionPlaceholder: 'Briefly describe the event...',
  fieldIsFree: 'Price',
  fieldIsFreeYes: 'Free',
  fieldIsFreeNo: 'Paid',
  fieldPrice: 'Price (e.g. €10, From €5)',
  sourceInfoTitle: '📱 Event source',
  sourceInfoText: 'Your event will be published as "Shared by the community". If you are the Town Hall or an official organisation, contact us to verify your account.',
  submitBtn: 'Submit event →',
  submitDisclaimer: 'By submitting you confirm you have permission to share this event and that the details are correct.',
  alertMissingData: 'Missing data',
  alertMissingDataMsg: 'Please fill in name, date, town, region and category.',
  alertError: 'Error',
  alertErrorMsg: 'Could not submit the event. Please try again.',
  successTitle: 'Event submitted!',
  successSubtitle: 'Your event has been submitted for review. It will appear in the app within 24-48 hours.',
  submitAnother: 'Submit another event',
  retryPoster: 'Try another poster',
  searchPlaceholder: 'Search events, towns...',
  emptyStateTitle: 'No events',
  emptyStateSubtitle: 'Try changing the filters or search in another area.',
  freeBadge: 'FREE',
  regionTeruel: 'Teruel',
  regionCatalunya: 'Catalunya',
  catAll: 'All',
  catFestival: 'Festivals',
  catFiesta: 'Fiestas',
  catMercado: 'Markets',
  catConcierto: 'Concerts',
  catGastronomia: 'Food & Drink',
  catDeportes: 'Sports',
  catComunidad: 'Community',
  dfAll: 'All',
  dfToday: 'Today',
  dfWeek: 'This week',
  dfMonth: 'This month',
  rAll: 'All Spain',
  rTeruel: 'Teruel',
  rCatalunya: 'Catalunya',
  sizeBig: 'Major event',
  sizeMedium: 'Medium event',
  sizeSmall: 'Local event',
  srcTownHall: 'Town Hall',
  srcCommunity: 'Community',
  langPickerTitle: 'What language do you want?',
  langEs: 'Español',
  langEn: 'English',
};

export type Translations = typeof es;

const translationMap: Record<'en' | 'es', Translations> = { es, en };

let _currentT: Translations = translationMap[deviceLang];

export function getCurrentT(): Translations {
  return _currentT;
}

export function setCurrentT(lang: 'en' | 'es'): void {
  _currentT = translationMap[lang];
}

export function getDefaultLang(): 'en' | 'es' {
  return deviceLang;
}

export { es, en };
