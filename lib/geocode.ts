type Coords = { lat: number; lng: number };

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[''']/g, ' ')          // apostrophes → space
    .replace(/\s+/g, ' ')            // collapse spaces
    .trim();
}

// Keys are pre-normalized (lowercase, no accents, apostrophes replaced by space).
const TOWN_COORDS: Record<string, Coords> = {
  // ── Teruel province ────────────────────────────────────────────────────
  'teruel':                     { lat: 40.3456, lng: -1.1065 },
  'albarracin':                 { lat: 40.4076, lng: -1.4480 },
  'alcaniz':                    { lat: 41.0481, lng: -0.1296 },
  'mora de rubielos':           { lat: 40.2520, lng: -0.7476 },
  'rubielos de mora':           { lat: 40.2027, lng: -0.6867 },
  'valderrobres':               { lat: 40.8860, lng:  0.1574 },
  'beceite':                    { lat: 40.8077, lng:  0.1768 },
  'orihuela del tremedal':      { lat: 40.5547, lng: -1.6470 },
  'gudar':                      { lat: 40.2500, lng: -0.7167 },
  'cantavieja':                 { lat: 40.5253, lng: -0.4000 },
  'la iglesuela del cid':       { lat: 40.4333, lng: -0.3667 },
  'mirambel':                   { lat: 40.5833, lng: -0.4000 },
  'calaceite':                  { lat: 41.0000, lng:  0.1833 },
  'mazaleon':                   { lat: 41.0167, lng:  0.1167 },
  'cretas':                     { lat: 40.9333, lng:  0.2000 },
  'penarroya de tastavins':     { lat: 40.7833, lng:  0.3000 },
  'calamocha':                  { lat: 40.9178, lng: -1.2939 },
  'monreal del campo':          { lat: 40.7887, lng: -1.3491 },
  'utrillas':                   { lat: 40.7878, lng: -0.8292 },
  'montalban':                  { lat: 40.8339, lng: -0.7950 },
  'andorra':                    { lat: 40.9782, lng: -0.4253 },
  'hijar':                      { lat: 41.1722, lng: -0.4496 },
  'castellote':                 { lat: 40.7833, lng: -0.3333 },
  'aguaviva':                   { lat: 40.7833, lng: -0.2833 },
  'mas de las matas':           { lat: 40.8333, lng: -0.2167 },
  'mosqueruela':                { lat: 40.3667, lng: -0.4667 },
  'linares de mora':            { lat: 40.3000, lng: -0.6333 },
  'fortanete':                  { lat: 40.5167, lng: -0.5167 },
  'villarluengo':               { lat: 40.6333, lng: -0.4833 },
  'sarrion':                    { lat: 40.1547, lng: -0.8236 },
  'puebla de valverde':         { lat: 40.1067, lng: -0.9433 },
  'manzanera':                  { lat: 40.0506, lng: -0.9208 },
  'cedrillas':                  { lat: 40.3833, lng: -0.8500 },
  'fuentes de rubielos':        { lat: 40.1961, lng: -0.7200 },
  'galve':                      { lat: 40.6500, lng: -0.9833 },
  'bezas':                      { lat: 40.3833, lng: -1.3167 },
  'allepuz':                    { lat: 40.4667, lng: -0.7000 },
  'samper de calanda':          { lat: 41.1167, lng: -0.4000 },
  'valljunquera':               { lat: 40.8667, lng:  0.0833 },
  // ── Catalunya – Barcelona ──────────────────────────────────────────────
  'barcelona':                  { lat: 41.3851, lng:  2.1734 },
  'badalona':                   { lat: 41.4489, lng:  2.2472 },
  'l hospitalet de llobregat':  { lat: 41.3597, lng:  2.0997 },
  'hospitalet de llobregat':    { lat: 41.3597, lng:  2.0997 },
  'cornella de llobregat':      { lat: 41.3542, lng:  2.0761 },
  'santa coloma de gramenet':   { lat: 41.4519, lng:  2.2092 },
  // ── Catalunya – Vallès ────────────────────────────────────────────────
  'sabadell':                   { lat: 41.5433, lng:  2.1092 },
  'terrassa':                   { lat: 41.5631, lng:  2.0089 },
  'mollet del valles':          { lat: 41.5394, lng:  2.2156 },
  'granollers':                 { lat: 41.6088, lng:  2.2879 },
  'cerdanyola del valles':      { lat: 41.4908, lng:  2.1417 },
  'sant cugat del valles':      { lat: 41.4731, lng:  2.0847 },
  'caldes de montbui':          { lat: 41.6281, lng:  2.1697 },
  'la garriga':                 { lat: 41.6808, lng:  2.2961 },
  'cardedeu':                   { lat: 41.6369, lng:  2.3606 },
  'llinars del valles':         { lat: 41.6219, lng:  2.3939 },
  'sant celoni':                { lat: 41.6919, lng:  2.4997 },
  // ── Catalunya – Maresme ──────────────────────────────────────────────
  'mataro':                     { lat: 41.5381, lng:  2.4445 },
  'arenys de mar':              { lat: 41.5858, lng:  2.5494 },
  'canet de mar':               { lat: 41.5931, lng:  2.5894 },
  'calella':                    { lat: 41.6128, lng:  2.6583 },
  'pineda de mar':              { lat: 41.6267, lng:  2.6794 },
  'blanes':                     { lat: 41.6742, lng:  2.7894 },
  // ── Catalunya – Garraf / Baix Llobregat ──────────────────────────────
  'sitges':                     { lat: 41.2359, lng:  1.8125 },
  'vilanova i la geltru':       { lat: 41.2234, lng:  1.7253 },
  'el vendrell':                { lat: 41.2175, lng:  1.5358 },
  'vilafranca del penedes':     { lat: 41.3428, lng:  1.6989 },
  // ── Catalunya – Camp de Tarragona ────────────────────────────────────
  'tarragona':                  { lat: 41.1189, lng:  1.2445 },
  'reus':                       { lat: 41.1543, lng:  1.1071 },
  'cambrils':                   { lat: 41.0647, lng:  1.0581 },
  'salou':                      { lat: 41.0742, lng:  1.1324 },
  'valls':                      { lat: 41.2860, lng:  1.2489 },
  'montblanc':                  { lat: 41.3792, lng:  1.1636 },
  'calafell':                   { lat: 41.1903, lng:  1.5675 },
  'torredembarra':              { lat: 41.1453, lng:  1.4017 },
  // ── Catalunya – Baix Ebre / Ribera d'Ebre / Terra Alta ───────────────
  'tortosa':                    { lat: 40.8122, lng:  0.5211 },
  'amposta':                    { lat: 40.7124, lng:  0.5814 },
  'mora d ebre':                { lat: 41.0847, lng:  0.6381 },
  'gandesa':                    { lat: 41.0583, lng:  0.4463 },
  'falset':                     { lat: 41.1500, lng:  0.8246 },
  // ── Catalunya – Anoia / Bages / Berguedà ─────────────────────────────
  'igualada':                   { lat: 41.5784, lng:  1.6209 },
  'manresa':                    { lat: 41.7286, lng:  1.8273 },
  'santpedor':                  { lat: 41.7380, lng:  1.8741 },
  'berga':                      { lat: 42.1003, lng:  1.8456 },
  'cardona':                    { lat: 41.9197, lng:  1.6806 },
  'sallent':                    { lat: 41.8253, lng:  1.8936 },
  'solsona':                    { lat: 41.9986, lng:  1.5197 },
  // ── Catalunya – Osona ────────────────────────────────────────────────
  'vic':                        { lat: 41.9302, lng:  2.2546 },
  'manlleu':                    { lat: 42.0000, lng:  2.2833 },
  'torello':                    { lat: 42.0467, lng:  2.2631 },
  // ── Catalunya – Ripollès / Garrotxa ──────────────────────────────────
  'ripoll':                     { lat: 42.2006, lng:  2.1909 },
  'ribes de freser':            { lat: 42.3008, lng:  2.1647 },
  'sant joan de les abadesses': { lat: 42.2353, lng:  2.2606 },
  'olot':                       { lat: 42.1811, lng:  2.4878 },
  'besalu':                     { lat: 42.1994, lng:  2.7000 },
  'banyoles':                   { lat: 42.1183, lng:  2.7647 },
  // ── Catalunya – Girona / Empordà ─────────────────────────────────────
  'girona':                     { lat: 41.9794, lng:  2.8214 },
  'figueres':                   { lat: 42.2672, lng:  2.9585 },
  'peralada':                   { lat: 42.3007, lng:  3.0178 },
  'roses':                      { lat: 42.2667, lng:  3.1792 },
  'cadaques':                   { lat: 42.2883, lng:  3.2847 },
  'castello d empuries':        { lat: 42.2556, lng:  3.0756 },
  'la bisbal d emporda':        { lat: 41.9619, lng:  2.9883 },
  'sant feliu de guixols':      { lat: 41.7831, lng:  2.9997 },
  'palafrugell':                { lat: 41.9167, lng:  3.1631 },
  'palamos':                    { lat: 41.8453, lng:  3.1283 },
  'torroella de montgri':       { lat: 42.0411, lng:  3.1267 },
  'l escala':                   { lat: 42.1264, lng:  3.1372 },
  'lloret de mar':              { lat: 41.6992, lng:  2.8453 },
  'tossa de mar':               { lat: 41.7228, lng:  2.9331 },
  // ── Catalunya – Lleida ────────────────────────────────────────────────
  'lleida':                     { lat: 41.6176, lng:  0.6200 },
  'balaguer':                   { lat: 41.7897, lng:  0.8083 },
  'tarrega':                    { lat: 41.6472, lng:  1.1414 },
  'mollerussa':                 { lat: 41.6275, lng:  0.8969 },
  'cervera':                    { lat: 41.6681, lng:  1.2728 },
  // ── Catalunya – Pirineus ─────────────────────────────────────────────
  'la seu d urgell':            { lat: 42.3589, lng:  1.4561 },
  'sort':                       { lat: 42.4072, lng:  1.1286 },
  'tremp':                      { lat: 42.1660, lng:  0.8972 },
  'puigcerda':                  { lat: 42.4328, lng:  1.9264 },
  'vielha':                     { lat: 42.6989, lng:  0.7950 },
  // ── Aragón – Zaragoza & Huesca ────────────────────────────────────────
  'zaragoza':                   { lat: 41.6488, lng: -0.8891 },
  'huesca':                     { lat: 42.1403, lng: -0.4089 },
  'calatayud':                  { lat: 41.3558, lng: -1.6418 },
  'tarazona':                   { lat: 41.9044, lng: -1.7261 },
  'borja':                      { lat: 41.8369, lng: -1.5297 },
  'ejea de los caballeros':     { lat: 42.1276, lng: -1.1391 },
  'barbastro':                  { lat: 42.0383, lng:  0.1253 },
  'monzon':                     { lat: 41.9097, lng:  0.1917 },
  'fraga':                      { lat: 41.5245, lng:  0.3529 },
  'jaca':                       { lat: 42.5699, lng: -0.5503 },
  'ainsa':                      { lat: 42.4172, lng:  0.1319 },
  'sarinena':                   { lat: 41.7875, lng: -0.1639 },
  'graus':                      { lat: 42.1876, lng:  0.3367 },
  // ── Madrid ────────────────────────────────────────────────────────────
  'madrid':                     { lat: 40.4168, lng: -3.7038 },
  'alcala de henares':          { lat: 40.4823, lng: -3.3637 },
  'getafe':                     { lat: 40.3072, lng: -3.7329 },
  'mostoles':                   { lat: 40.3228, lng: -3.8646 },
  'alcorcon':                   { lat: 40.3454, lng: -3.8237 },
  'leganes':                    { lat: 40.3283, lng: -3.7603 },
  'torrejon de ardoz':          { lat: 40.4597, lng: -3.4797 },
  'aranjuez':                   { lat: 40.0339, lng: -3.6033 },
  'el escorial':                { lat: 40.5777, lng: -4.1492 },
  'navalcarnero':               { lat: 40.2872, lng: -4.0120 },
  'chinchon':                   { lat: 40.1394, lng: -3.4353 },
  'san lorenzo de el escorial': { lat: 40.5940, lng: -4.1480 },
  // ── Andalucía ─────────────────────────────────────────────────────────
  'sevilla':                    { lat: 37.3891, lng: -5.9845 },
  'malaga':                     { lat: 36.7213, lng: -4.4214 },
  'granada':                    { lat: 37.1773, lng: -3.5986 },
  'cordoba':                    { lat: 37.8882, lng: -4.7794 },
  'cadiz':                      { lat: 36.5271, lng: -6.2886 },
  'almeria':                    { lat: 36.8381, lng: -2.4597 },
  'jaen':                       { lat: 37.7796, lng: -3.7849 },
  'huelva':                     { lat: 37.2571, lng: -6.9496 },
  'ronda':                      { lat: 36.7447, lng: -5.1619 },
  'jerez de la frontera':       { lat: 36.6853, lng: -6.1283 },
  'marbella':                   { lat: 36.5101, lng: -4.8824 },
  'torremolinos':                { lat: 36.6215, lng: -4.4997 },
  'nerja':                      { lat: 36.7543, lng: -3.8704 },
  'antequera':                  { lat: 37.0185, lng: -4.5598 },
  'ubeda':                      { lat: 38.0072, lng: -3.3706 },
  'baeza':                      { lat: 37.9943, lng: -3.4691 },
  'motril':                     { lat: 36.7467, lng: -3.5165 },
  'algeciras':                  { lat: 36.1408, lng: -5.4531 },
  'linares':                    { lat: 38.0953, lng: -3.6322 },
  // ── Valencia ──────────────────────────────────────────────────────────
  'valencia':                   { lat: 39.4699, lng: -0.3763 },
  'alicante':                   { lat: 38.3452, lng: -0.4810 },
  'castellon de la plana':      { lat: 39.9864, lng: -0.0513 },
  'castellon':                  { lat: 39.9864, lng: -0.0513 },
  'benidorm':                   { lat: 38.5394, lng: -0.1302 },
  'gandia':                     { lat: 38.9656, lng: -0.1836 },
  'denia':                      { lat: 38.8407, lng:  0.1023 },
  'xativa':                     { lat: 38.9889, lng: -0.5188 },
  'torrevieja':                 { lat: 37.9783, lng: -0.6847 },
  'elche':                      { lat: 38.2669, lng: -0.6985 },
  'alcoy':                      { lat: 38.6990, lng: -0.4742 },
  'peniscola':                  { lat: 40.3597, lng:  0.4058 },
  'vila-real':                  { lat: 39.9357, lng: -0.1024 },
  'sagunto':                    { lat: 39.6831, lng: -0.2731 },
  'ontinyent':                  { lat: 38.8217, lng: -0.6048 },
  'alcira':                     { lat: 39.1519, lng: -0.4345 },
  // ── País Vasco ────────────────────────────────────────────────────────
  'bilbao':                     { lat: 43.2630, lng: -2.9350 },
  'san sebastian':              { lat: 43.3183, lng: -1.9812 },
  'donostia':                   { lat: 43.3183, lng: -1.9812 },
  'vitoria-gasteiz':            { lat: 42.8465, lng: -2.6724 },
  'vitoria':                    { lat: 42.8465, lng: -2.6724 },
  'gasteiz':                    { lat: 42.8465, lng: -2.6724 },
  'getxo':                      { lat: 43.3558, lng: -2.9919 },
  'barakaldo':                  { lat: 43.2959, lng: -2.9936 },
  'leioa':                      { lat: 43.3283, lng: -2.9892 },
  'guernica':                   { lat: 43.3125, lng: -2.6792 },
  'bermeo':                     { lat: 43.4197, lng: -2.7239 },
  'irun':                       { lat: 43.3396, lng: -1.7889 },
  'hondarribia':                { lat: 43.3673, lng: -1.7954 },
  'zarautz':                    { lat: 43.2840, lng: -2.1706 },
  // ── Galicia ───────────────────────────────────────────────────────────
  'santiago de compostela':     { lat: 42.8782, lng: -8.5448 },
  'vigo':                       { lat: 42.2328, lng: -8.7226 },
  'a coruna':                   { lat: 43.3713, lng: -8.3961 },
  'la coruna':                  { lat: 43.3713, lng: -8.3961 },
  'pontevedra':                 { lat: 42.4333, lng: -8.6483 },
  'lugo':                       { lat: 43.0097, lng: -7.5567 },
  'ourense':                    { lat: 42.3367, lng: -7.8639 },
  'ferrol':                     { lat: 43.4869, lng: -8.2318 },
  'orense':                     { lat: 42.3367, lng: -7.8639 },
  // ── Castilla y León ───────────────────────────────────────────────────
  'valladolid':                 { lat: 41.6523, lng: -4.7245 },
  'burgos':                     { lat: 42.3430, lng: -3.6966 },
  'salamanca':                  { lat: 40.9700, lng: -5.6635 },
  'leon':                       { lat: 42.5987, lng: -5.5671 },
  'segovia':                    { lat: 40.9487, lng: -4.1184 },
  'avila':                      { lat: 40.6566, lng: -4.6872 },
  'zamora':                     { lat: 41.5044, lng: -5.7455 },
  'soria':                      { lat: 41.7637, lng: -2.4651 },
  'palencia':                   { lat: 42.0097, lng: -4.5286 },
  'miranda de ebro':            { lat: 42.6900, lng: -2.9447 },
  'aranda de duero':            { lat: 41.6713, lng: -3.6882 },
  'ponferrada':                 { lat: 42.5464, lng: -6.5961 },
  // ── Murcia ────────────────────────────────────────────────────────────
  'murcia':                     { lat: 37.9922, lng: -1.1307 },
  'cartagena':                  { lat: 37.6058, lng: -0.9817 },
  'lorca':                      { lat: 37.6710, lng: -1.6985 },
  'mazarron':                   { lat: 37.5989, lng: -1.3177 },
  'molina de segura':           { lat: 38.0561, lng: -1.2100 },
  'caravaca de la cruz':        { lat: 38.1073, lng: -1.8617 },
  'aguilas':                    { lat: 37.4071, lng: -1.5825 },
  // ── Extremadura ───────────────────────────────────────────────────────
  'caceres':                    { lat: 39.4753, lng: -6.3724 },
  'badajoz':                    { lat: 38.8794, lng: -6.9706 },
  'merida':                     { lat: 38.9168, lng: -6.3460 },
  'plasencia':                  { lat: 40.0279, lng: -6.0845 },
  'trujillo':                   { lat: 39.4636, lng: -5.8815 },
  'almendralejo':               { lat: 38.6869, lng: -6.4064 },
  'don benito':                 { lat: 38.9572, lng: -5.8617 },
  // ── Canarias ──────────────────────────────────────────────────────────
  'las palmas de gran canaria': { lat: 28.1235, lng:-15.4363 },
  'las palmas':                 { lat: 28.1235, lng:-15.4363 },
  'santa cruz de tenerife':     { lat: 28.4682, lng:-16.2546 },
  'la laguna':                  { lat: 28.4853, lng:-16.3179 },
  'puerto de la cruz':          { lat: 28.4139, lng:-16.5474 },
  'arrecife':                   { lat: 28.9620, lng:-13.5478 },
  'puerto del rosario':         { lat: 28.4989, lng:-13.8596 },
  'maspalomas':                 { lat: 27.7604, lng:-15.5836 },
  'playa del ingles':           { lat: 27.7567, lng:-15.5726 },
  'los cristianos':             { lat: 28.0477, lng:-16.7136 },
  'adeje':                      { lat: 28.1229, lng:-16.7259 },
  // ── Baleares ──────────────────────────────────────────────────────────
  'palma de mallorca':          { lat: 39.5696, lng:  2.6502 },
  'palma':                      { lat: 39.5696, lng:  2.6502 },
  'ibiza':                      { lat: 38.9068, lng:  1.4206 },
  'eivissa':                    { lat: 38.9068, lng:  1.4206 },
  'mahon':                      { lat: 39.8883, lng:  4.2633 },
  'mao':                        { lat: 39.8883, lng:  4.2633 },
  'manacor':                    { lat: 39.5704, lng:  3.2168 },
  'calvia':                     { lat: 39.5576, lng:  2.5147 },
  'soller':                     { lat: 39.7665, lng:  2.7140 },
  'pollenca':                   { lat: 39.8708, lng:  3.0131 },
  'alcudia':                    { lat: 39.8520, lng:  3.1232 },
  'llucmajor':                  { lat: 39.4833, lng:  2.8892 },
};

function lookupTown(town: string): Coords | null {
  return TOWN_COORDS[normalize(town)] ?? null;
}

async function geocodeTown(town: string): Promise<Coords | null> {
  const query = encodeURIComponent(`${town}, Spain`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&countrycodes=es&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'QuéHay/1.0 (lang.martin.nz@gmail.com)' },
    });
    if (!res.ok) {
      console.warn(`[geocode] Nominatim HTTP ${res.status} for "${town}"`);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (e) {
    console.warn(`[geocode] Nominatim fetch failed for "${town}":`, e);
    return null;
  }
}

export async function resolveCoordinates(town: string): Promise<Coords> {
  const trimmed = town.trim();
  if (!trimmed) return { lat: 0, lng: 0 };

  const cached = lookupTown(trimmed);
  if (cached) {
    console.log(`[geocode] table hit "${trimmed}" →`, cached);
    return cached;
  }

  console.log(`[geocode] "${trimmed}" not in table — trying Nominatim...`);
  const geocoded = await geocodeTown(trimmed);
  if (geocoded) {
    console.log(`[geocode] Nominatim resolved "${trimmed}" →`, geocoded);
    return geocoded;
  }

  console.warn(`[geocode] no coords found for "${trimmed}", defaulting to 0,0`);
  return { lat: 0, lng: 0 };
}
