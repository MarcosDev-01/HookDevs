function slugify(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

export type JobFilters = { keyword: string; province?: string; department?: string; daysAgo?: number };
export type JobSiteLink = { name: string; url: string; nota?: string; tipo?: 'portal' | 'especializado' };

export function buildJobLinks(filters: JobFilters): JobSiteLink[] {
  const kw = filters.keyword.trim() || 'empleo';
  const days = filters.daysAgo || 14;
  const location = [filters.department, filters.province].filter(Boolean).join(', ');
  const params = (base: string, extra: Record<string,string> = {}) => `${base}?${new URLSearchParams({ q: kw, ...(location ? { l: location } : {}), ...extra }).toString()}`;
  const links: JobSiteLink[] = [];
  links.push({ name:'Computrabajo', tipo:'portal', url:`https://ar.computrabajo.com/trabajo-de-${slugify(kw)}${filters.province ? `-en-${slugify(filters.province)}` : ''}`, nota:'La fecha y localidad se verifican en el portal.' });
  links.push({ name:'Indeed', tipo:'portal', url:params('https://ar.indeed.com/jobs', { fromage:String(days) }), nota:'Consulta por rol, localidad y antigüedad.' });
  links.push({ name:'LinkedIn', tipo:'portal', url:`https://www.linkedin.com/jobs/search/?${new URLSearchParams({ keywords:kw, ...(location ? { location } : {}), f_TPR:`r${days*86400}` }).toString()}`, nota:'Consulta por palabras clave, ubicación y ventana temporal.' });
  links.push({ name:'Bumeran', tipo:'portal', url:`https://www.bumeran.com.ar/empleos-busqueda-${slugify(kw)}.html`, nota:'Abrí el resultado para ajustar ubicación.' });
  links.push({ name:'ZonaJobs', tipo:'portal', url:'https://www.zonajobs.com.ar/', nota:'Portal general; completá la ubicación dentro del sitio.' });
  links.push({ name:'Get on Board', tipo:'especializado', url:`https://www.getonbrd.com.ar/?query=${encodeURIComponent(kw)}`, nota:'Especializado en tecnología y remoto.' });
  links.push({ name:'EducaciónIT Empleos', tipo:'especializado', url:`https://empleos.educacionit.com/?s=${encodeURIComponent(kw)}`, nota:'Bolsa IT con filtros propios.' });
  return links;
}
