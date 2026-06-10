-- QuéHay – Supabase Schema
-- Run this entire file in the Supabase SQL Editor:
-- dashboard.supabase.com → your project → SQL Editor → New query

-- ─────────────────────────── EVENTS ────────────────────────────────────
create table if not exists public.events (
  id            text primary key,
  name          text not null,
  date_start    date not null,
  date_end      date,
  time          text not null default 'Por confirmar',
  location      text not null,
  town          text not null,
  region        text not null,
  lat           float8 not null,
  lng           float8 not null,
  category      text not null,
  size          text not null check (size in ('pequeño', 'mediano', 'grande')),
  description   text not null default '',
  image_url     text not null,
  source        text not null,
  source_detail text not null,
  tags          text[] not null default '{}',
  is_free       boolean not null default true,
  price         text,
  is_verified   boolean not null default false,
  submitted_by  uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Events are publicly readable"
  on public.events for select using (true);

create policy "Anyone can submit events"
  on public.events for insert with check (true);

-- ─────────────────────────── PROFILES ──────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  mode                text not null default 'viajero' check (mode in ('viajero', 'anfitrion')),
  host_property_name  text,
  host_property_town  text,
  host_property_lat   float8,
  host_property_lng   float8,
  host_radius         integer not null default 25,
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ─────────────────────────── FAVORITES ─────────────────────────────────
create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_id   text not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.favorites enable row level security;

create policy "Users can manage their own favorites"
  on public.favorites for all using (auth.uid() = user_id);

-- ─────────────────── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── MIGRATION (run this if the table already exists) ───────────────────
-- ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_region_check;
-- UPDATE public.events SET region = 'aragon' WHERE region = 'teruel';

-- ─────────────────────────── SEED DATA ─────────────────────────────────
insert into public.events
  (id, name, date_start, date_end, time, location, town, region, lat, lng,
   category, size, description, image_url, source, source_detail, tags, is_free, price)
values
  ('ev001','Fiestas del Ángel de Teruel','2026-07-10','2026-07-18','Todo el día',
   'Centro histórico de Teruel','Teruel','aragon',40.3456,-1.1065,'festival','grande',
   'Las fiestas más importantes de la capital turolense, en honor al Ángel custodio de la ciudad. Incluye procesiones, vaquillas, fuegos artificiales, conciertos y la tradicional bajada del Ángel desde el viaducto.',
   'https://picsum.photos/seed/angel-teruel/800/450','ayuntamiento','Ayuntamiento de Teruel',
   ARRAY['vaquillas','procesión','fuegos artificiales','bajada del ángel'],true,null),

  ('ev002','Mercado Medieval de Albarracín','2026-08-01','2026-08-04','11:00 - 22:00',
   'Casco histórico de Albarracín','Albarracín','aragon',40.4076,-1.448,'mercado','mediano',
   'Un viaje al medievo en el pueblo medieval mejor conservado de España. Artesanos, juglares, caballeros y mercaderes llenan las calles de la villa amurallada sobre el río Guadalaviar.',
   'https://picsum.photos/seed/medieval-albarracin/800/450','facebook','Compartido desde Facebook · Turismo Albarracín',
   ARRAY['artesanía','medieval','juglares','caballeros'],true,null),

  ('ev003','Festival de Jazz Mora de Rubielos','2026-06-06','2026-06-08','19:00 - 23:00',
   'Castillo-Colegiata de Mora de Rubielos','Mora de Rubielos','aragon',40.252,-0.7476,'concierto','mediano',
   'Festival de jazz en el marco incomparable del castillo medieval. Artistas nacionales e internacionales se presentan bajo las estrellas del Maestrazgo turolense.',
   'https://picsum.photos/seed/jazz-mora-rubielos/800/450','instagram','Compartido desde Instagram · @festivaljazmora',
   ARRAY['jazz','música','castillo','verano'],false,'Desde 12€'),

  ('ev004','Feria Agroalimentaria de Teruel','2026-05-23','2026-05-25','10:00 - 20:00',
   'Recinto Ferial de Teruel','Teruel','aragon',40.3456,-1.1065,'gastronomia','mediano',
   'Feria de productos locales de la provincia: jamón DOP Teruel, trufa negra, aceite de oliva del Bajo Aragón, quesos artesanales y vinos del Jiloca.',
   'https://picsum.photos/seed/agroalimentaria-teruel/800/450','ayuntamiento','Diputación Provincial de Teruel',
   ARRAY['jamón DOP','trufa','aceite','quesos','gastronomía local'],true,null),

  ('ev005','Fiestas de San Pascual - Valderrobres','2026-05-20','2026-05-22','Todo el día',
   'Plaza Mayor de Valderrobres','Valderrobres','aragon',40.886,0.1574,'fiesta','pequeño',
   'Fiestas patronales del municipio de Valderrobres con danzas tradicionales, gigantes y cabezudos, conciertos en la plaza y la tradicional volta del sant.',
   'https://picsum.photos/seed/san-pascual-valderrobres/800/450','whatsapp','Compartido desde WhatsApp · Grupo Peña La Troya',
   ARRAY['gigantes','danza','patronales','Matarraña'],true,null),

  ('ev006','Mercado Artesanal de Rubielos de Mora','2026-06-15',null,'09:00 - 14:00',
   'Plaza del Portal, Rubielos de Mora','Rubielos de Mora','aragon',40.2027,-0.6867,'mercado','pequeño',
   'Mercado mensual de artesanía y productos locales en el precioso portal medieval. Cerámica, tejidos, mermeladas artesanas y productos de la tierra.',
   'https://picsum.photos/seed/mercado-rubielos-mora/800/450','ayuntamiento','Ayuntamiento de Rubielos de Mora',
   ARRAY['artesanía','mercado mensual','cerámica','local'],true,null),

  ('ev007','Festival de Guitarra Clásica de Beceite','2026-07-20',null,'20:00',
   'Casa de la Cultura, Beceite','Beceite','aragon',40.8077,0.1768,'concierto','pequeño',
   'Concierto de guitarra clásica española en el corazón del Matarraña. Ambiente íntimo en un municipio declarado uno de los más bonitos de España.',
   'https://picsum.photos/seed/guitarra-beceite/800/450','facebook','Compartido desde Facebook · Asociación Cultural Beceite',
   ARRAY['guitarra clásica','música','Matarraña','pueblo bonito'],false,'8€'),

  ('ev008','Triatlón Popular Ciudad de Teruel','2026-09-14',null,'08:00',
   'Zona Deportiva Municipal, Teruel','Teruel','aragon',40.3456,-1.1065,'deportes','pequeño',
   'Triatlón popular para deportistas de todos los niveles. Modalidades sprint (750m nado / 20km bici / 5km carrera) y olímpica. Inscripciones hasta el 10 de septiembre.',
   'https://picsum.photos/seed/triatlon-teruel/800/450','usuario','Enviado por Club Triatlón Teruel',
   ARRAY['triatlón','deporte','inscripciones abiertas'],false,'25€ (sprint) / 35€ (olímpico)'),

  ('ev009','Romería Virgen del Tremedal','2026-09-07',null,'09:00',
   'Ermita del Tremedal, Orihuela del Tremedal','Orihuela del Tremedal','aragon',40.5547,-1.647,'festival','mediano',
   'Una de las romerías más concurridas de la provincia. Miles de peregrinos suben al santuario de la Virgen del Tremedal en una jornada de fe y tradición popular.',
   'https://picsum.photos/seed/tremedal-romeria/800/450','ayuntamiento','Ayuntamiento de Orihuela del Tremedal',
   ARRAY['romería','virgen','tradición','senderismo'],true,null),

  ('ev010','Fiestas Patronales de Alcañiz','2026-09-05','2026-09-08','Todo el día',
   'Centro de Alcañiz','Alcañiz','aragon',41.0481,-0.1296,'fiesta','mediano',
   'Las fiestas del Pilar en Alcañiz, la segunda ciudad de Teruel. Toros, peñas, conciertos y el espectacular pregón desde el castillo Calatravo.',
   'https://picsum.photos/seed/fiestas-alcaniz/800/450','whatsapp','Compartido desde WhatsApp · Ayuntamiento de Alcañiz',
   ARRAY['toros','peñas','castillo','patronales'],true,null),

  ('ev011','Gran Carrera de Montaña Gúdar-Javalambre','2026-06-29',null,'07:30',
   'Salida desde Gúdar, llegada a Javalambre','Gúdar','aragon',40.25,-0.7167,'deportes','mediano',
   'Ultra trail de 42 km por las sierras de Gúdar y Javalambre con 2.800m de desnivel positivo. Categorías: ultra (42km), maratón (28km) y familiar (10km).',
   'https://picsum.photos/seed/carrera-gudar/800/450','usuario','Enviado por Asociación Trail Gúdar-Javalambre',
   ARRAY['ultra trail','42km','sierra','montaña'],false,'Desde 35€'),

  ('ev012','Nits de Cine a la Fresca · Mora de Rubielos','2026-07-04','2026-08-28','22:00',
   'Patio del Castillo, Mora de Rubielos','Mora de Rubielos','aragon',40.252,-0.7476,'comunidad','pequeño',
   'Cine de verano al aire libre en el patio del castillo. Todos los viernes de julio y agosto, películas en versión original con subtítulos en español.',
   'https://picsum.photos/seed/cine-verano-mora/800/450','ayuntamiento','Ayuntamiento de Mora de Rubielos',
   ARRAY['cine de verano','versión original','viernes','semanal'],false,'3€'),

  ('ev013','Festa Major de Gràcia','2026-08-15','2026-08-21','Todo el día',
   'Barrio de Gràcia, Barcelona','Barcelona','cataluña',41.3982,2.154,'festival','grande',
   'Una de las fiestas más populares de Barcelona: las calles del barrio de Gràcia se transforman con decoraciones vecinales, conciertos, castellers, gegants y actividades para todas las edades.',
   'https://picsum.photos/seed/gracia-barcelona/800/450','instagram','Compartido desde Instagram · @festamajordegracia',
   ARRAY['calles decoradas','castellers','gegants','barrio'],true,null),

  ('ev014','Festival Internacional de Música de Peralada','2026-07-18','2026-08-02','21:30',
   'Jardins del Castell de Peralada','Peralada','cataluña',42.3007,3.0178,'concierto','grande',
   'Uno de los festivales de música clásica y ópera más prestigiosos del mundo, en el espectacular entorno del castillo de Peralada. Grandes solistas y orquestas internacionales.',
   'https://picsum.photos/seed/peralada-festival/800/450','ayuntamiento','Festival de Música de Peralada',
   ARRAY['ópera','clásica','internacional','castillo'],false,'Desde 45€'),

  ('ev015','Mercat Medieval de Vic','2026-06-06','2026-06-08','10:00 - 21:00',
   'Centre històric de Vic','Vic','cataluña',41.9302,2.2546,'mercado','grande',
   'El mercado medieval más grande de Catalunya con más de 400 puestos. Artesanos, caballeros medievales, juglares, música de época y gastronomía medieval.',
   'https://picsum.photos/seed/mercat-medieval-vic/800/450','facebook','Compartido desde Facebook · Mercat Medieval de Vic',
   ARRAY['medieval','artesanía','400 puestos','caballeros'],true,null),

  ('ev016','Festa Major de Sitges','2026-08-23','2026-08-26','Todo el día',
   'Sitges – centre i passeig marítim','Sitges','cataluña',41.2359,1.8125,'festival','mediano',
   'La festa major de esta joya mediterránea con gegants, castellers, correbous, conciertos en la playa y el tradicional ball de diables con fuego.',
   'https://picsum.photos/seed/festa-sitges/800/450','ayuntamiento','Ajuntament de Sitges',
   ARRAY['gegants','castellers','correbous','playa'],true,null),

  ('ev017','Fira del Vi de Falset – DO Montsant','2026-10-04','2026-10-05','11:00 - 19:00',
   'Plaça de la Quartera, Falset','Falset','cataluña',41.15,0.8246,'gastronomia','mediano',
   'Feria de vinos de la DO Montsant con más de 30 bodegas participantes. Catas guiadas, maridajes con productos locales y visitas en burro a los viñedos.',
   'https://picsum.photos/seed/fira-vi-falset/800/450','instagram','Compartido desde Instagram · @domontsant',
   ARRAY['vino','DO Montsant','cata','bodegas'],false,'Copa degustació 6€'),

  ('ev018','Festa de la Sardana de Ripoll','2026-06-28','2026-06-29','17:00 - 22:00',
   'Plaça de l''Abat Oliba, Ripoll','Ripoll','cataluña',42.2006,2.1909,'festival','mediano',
   'Festival dedicado a la sardana, el baile tradicional catalán. Aplecs de sardanistes de toda Catalunya, coblas en vivo, concurso de sardanas y actividades culturales.',
   'https://picsum.photos/seed/sardana-ripoll/800/450','facebook','Compartido desde Facebook · Ajuntament de Ripoll',
   ARRAY['sardana','baile tradicional','cobla','patrimonio'],true,null),

  ('ev019','Festival Cruïlla Barcelona','2026-07-10','2026-07-12','17:00 - 02:00',
   'Parc de la Ciutadella, Barcelona','Barcelona','cataluña',41.387,2.186,'concierto','grande',
   'Festival de música urbana, reggae, soul y funk en el corazón de Barcelona. Headliners internacionales, food trucks y un ambiente multicultural inigualable.',
   'https://picsum.photos/seed/cruilla-barcelona/800/450','instagram','Compartido desde Instagram · @cruillabcn',
   ARRAY['reggae','soul','urbano','Barcelona','festival grande'],false,'Abono 3 días: 120€'),

  ('ev020','Verbena de Sant Joan – Barcelona','2026-06-23',null,'21:00',
   'Tota Barcelona i el litoral','Barcelona','cataluña',41.3851,2.1734,'fiesta','grande',
   'La noche más mágica del año: fuegos artificiales en la playa, hogueras, coca de Sant Joan y la verbena en cada barrio. Una tradición que une a toda Catalunya.',
   'https://picsum.photos/seed/sant-joan-barcelona/800/450','facebook','Compartido desde Facebook · Ajuntament de Barcelona',
   ARRAY['fuegos artificiales','hogueras','Sant Joan','nocturno'],true,null),

  ('ev021','Mercat de Pagès d''Olot – Cada Sábado','2026-05-23',null,'08:00 - 14:00',
   'Plaça del Mercat, Olot','Olot','cataluña',42.1811,2.4878,'mercado','pequeño',
   'Mercado semanal de agricultores y productores locales de la Garrotxa. Verduras de temporada ecológicas, quesos de cabra, embutidos caseros y flores.',
   'https://picsum.photos/seed/mercat-pages-olot/800/450','whatsapp','Compartido desde WhatsApp · Productors de la Garrotxa',
   ARRAY['agricultor','ecológico','semanal','local','sábado'],true,null),

  ('ev022','Cursa Popular de la Garrotxa','2026-06-14',null,'09:00',
   'Parc Natural de la Zona Volcànica, Olot','Olot','cataluña',42.1811,2.4878,'deportes','pequeño',
   'Carrera popular por los senderos volcánicos de la Garrotxa. 10 km y 5 km, apta para todos los niveles. Paisaje único de volcanes extintos y hayedos.',
   'https://picsum.photos/seed/cursa-garrotxa/800/450','usuario','Enviado por Club Atletisme Olot',
   ARRAY['carrera','volcanes','trail','naturaleza'],false,'12€'),

  ('ev023','Fira de Primavera de Reus','2026-05-30','2026-06-01','10:00 - 21:00',
   'Recinto Firal de Reus','Reus','cataluña',41.1543,1.1071,'mercado','mediano',
   'Feria multisectorial de Reus con artesanía, moda, gastronomía y cultura. La ciudad natal de Gaudí se viste de fiesta con más de 200 expositores.',
   'https://picsum.photos/seed/fira-primavera-reus/800/450','facebook','Compartido desde Facebook · Fira de Reus',
   ARRAY['artesanía','moda','Gaudí','200 expositores'],true,null),

  ('ev024','Mercat del Ram de Vic','2026-05-25','2026-05-28','10:00 - 20:00',
   'Plaça Major i entorns, Vic','Vic','cataluña',41.9302,2.2546,'mercado','mediano',
   'Mercado tradicional de Vic, uno de los más importantes de Catalunya. Ganadería, flores, artesanía y los famosos embutidos y quesos de Osona.',
   'https://picsum.photos/seed/mercat-ram-vic/800/450','ayuntamiento','Ajuntament de Vic',
   ARRAY['ganadería','flores','embutidos','tradicional'],true,null),

  ('ev025','Fira de Santpedor','2026-09-13','2026-09-14','10:00 - 20:00',
   'Centre de Santpedor','Santpedor','cataluña',41.738,1.8741,'comunidad','pequeño',
   'Fira anual de Santpedor con productos artesanales, alimentación local, maquinaria agrícola y actividades familiares para todos los públicos.',
   'https://picsum.photos/seed/fira-santpedor/800/450','whatsapp','Compartido desde WhatsApp · Ajuntament de Santpedor',
   ARRAY['fira','familiar','artesanía','local'],true,null)

on conflict (id) do nothing;
