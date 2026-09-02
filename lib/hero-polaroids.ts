export type HeroPolaroid = {
  media_path?: string | null;
  media_url?: string | null;
  caption: string;
  subtitle: string;
};

export const defaultHeroPolaroids: HeroPolaroid[] = [
  { caption: 'Nuestra aventura', subtitle: 'El comienzo de todo' },
  { caption: 'Siempre tú', subtitle: 'Mi lugar favorito' },
  { caption: 'Nosotros', subtitle: 'Mi mejor casualidad' },
  { caption: 'Mil recuerdos', subtitle: 'Y todos contigo' },
  { caption: 'Nuestra historia', subtitle: 'Solo acaba de empezar' },
  { caption: 'Mi persona', subtitle: 'En cualquier lugar' },
  { caption: 'Para siempre', subtitle: 'Tú y yo' },
];

export function normalizeHeroPolaroids(value: unknown): HeroPolaroid[] {
  const source = Array.isArray(value) ? value : [];
  return defaultHeroPolaroids.map((fallback, index) => {
    const item = source[index];
    if (!item || typeof item !== 'object') return fallback;
    const record = item as Record<string, unknown>;
    return {
      media_path:
        typeof record.media_path === 'string' ? record.media_path : null,
      caption:
        typeof record.caption === 'string' ? record.caption : fallback.caption,
      subtitle:
        typeof record.subtitle === 'string'
          ? record.subtitle
          : fallback.subtitle,
    };
  });
}
