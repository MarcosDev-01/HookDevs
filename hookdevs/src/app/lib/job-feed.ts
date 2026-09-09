export interface JobPreview {
  title: string;
  company: string;
  location: string;
  provinceId?: string;
  department?: string;
  mode?: string;
  age?: string;
  publishedDaysAgo?: number;
  url: string;
  techs?: string[];
  isSearchPreview?: boolean;
}

export interface PortalFeed {
  name: string;
  kind: 'portal' | 'especializado';
  note: string;
  searchUrl: string;
  jobs: JobPreview[];
}

export const JOB_FEEDS: PortalFeed[] = [
  {
    name: 'Computrabajo', kind: 'portal', note: 'Búsqueda externa: abrí el portal para verificar disponibilidad y fecha.',
    searchUrl: 'https://ar.computrabajo.com/',
    jobs: [
      { title: 'Desarrollador Java Backend Senior', company: 'C&S informática s.a.', location: 'San Nicolás, CABA', provinceId: 'caba', department: 'Comunas 1–15', mode: 'Presencial y remoto', age: 'Hace 2 h', publishedDaysAgo: 1, url: 'https://ar.computrabajo.com/trabajo-de-desarrollador', techs: ['Java', 'Spring', 'Backend'] },
      { title: 'Desarrollador Backend Golang Sr.', company: 'SOLUTIX S.A.', location: 'Monserrat, CABA', provinceId: 'caba', department: 'Comunas 1–15', mode: 'Remoto', age: 'Hace 3 h', publishedDaysAgo: 1, url: 'https://ar.computrabajo.com/trabajo-de-desarrollador', techs: ['Golang', 'Backend', 'APIs'] },
      { title: 'Senior Backend Python Developer', company: 'Kaizen Recursos Humanos', location: 'Monserrat, CABA', provinceId: 'caba', department: 'Comunas 1–15', mode: 'Remoto', age: 'Hace 6 h', publishedDaysAgo: 1, url: 'https://ar.computrabajo.com/trabajo-de-desarrollador', techs: ['Python', 'Backend', 'APIs'] },
      { title: 'Desarrollador/a Full Stack', company: 'FIND.U', location: 'Gral. Pacheco, Buenos Aires', provinceId: 'buenos-aires', department: 'Tigre', mode: 'Presencial y remoto', age: 'Hace 13 h', publishedDaysAgo: 1, url: 'https://ar.computrabajo.com/trabajo-de-desarrollador', techs: ['Full Stack', 'JavaScript', 'Web'] },
      { title: 'Desarrollador Fullstack Senior (Java y React)', company: 'C&S informática s.a.', location: 'San Nicolás, CABA', provinceId: 'caba', department: 'Comunas 1–15', mode: 'Presencial y remoto', age: 'Ayer', publishedDaysAgo: 1, url: 'https://ar.computrabajo.com/trabajo-de-desarrollador', techs: ['Java', 'React', 'Full Stack'] },
    ],
  },
  {
    name: 'LinkedIn', kind: 'portal', note: 'Búsqueda externa con ubicación y fecha; el resultado final se verifica en LinkedIn.',
    searchUrl: 'https://www.linkedin.com/jobs/',
    jobs: [
      { title: 'Software Engineer III - Alojamientos', company: 'Despegar', location: 'Buenos Aires', provinceId: 'buenos-aires', department: 'La Plata', age: 'Hace 1 mes', publishedDaysAgo: 30, url: 'https://ar.linkedin.com/jobs/desarrollador-argentina-empleos', techs: ['Software', 'Backend', 'Cloud'] },
      { title: 'Full Stack Developer', company: 'Darwin AI', location: 'Buenos Aires y alrededores', provinceId: 'buenos-aires', department: 'General San Martín', age: 'Hace 1 mes', publishedDaysAgo: 30, url: 'https://ar.linkedin.com/jobs/desarrollador-argentina-empleos', techs: ['Full Stack', 'React', 'JavaScript'] },
      { title: 'Senior Software Engineer', company: 'Cloudbeds', location: 'Córdoba', provinceId: 'cordoba', department: 'Capital', age: 'Hace 4 días', publishedDaysAgo: 4, url: 'https://ar.linkedin.com/jobs/desarrollador-argentina-empleos', techs: ['Software', 'Cloud', 'Backend'] },
      { title: 'Software Engineer Backend', company: 'PedidosYa', location: 'Argentina', age: 'Hace 1 semana', publishedDaysAgo: 7, url: 'https://ar.linkedin.com/jobs/desarrollador-argentina-empleos', techs: ['Backend', 'APIs', 'Software'] },
      { title: 'Junior Software Engineer', company: 'Power Digital Marketing', location: 'Argentina', age: 'Hace 2 semanas', publishedDaysAgo: 14, url: 'https://ar.linkedin.com/jobs/desarrollador-argentina-empleos', techs: ['Software', 'JavaScript', 'Junior'] },
    ],
  },
  { name: 'Get on Board', kind: 'especializado', note: 'Especializado en tecnología y remoto.', searchUrl: 'https://www.getonbrd.com.ar/', jobs: [] },
  { name: 'EducaciónIT Empleos', kind: 'especializado', note: 'Bolsa IT con filtros por rol, nivel y modalidad.', searchUrl: 'https://empleos.educacionit.com/', jobs: [] },
  { name: 'ZonaJobs', kind: 'portal', note: 'Buscador general de empleo.', searchUrl: 'https://www.zonajobs.com.ar/', jobs: [] },
  { name: 'Bumeran', kind: 'portal', note: 'Buscador general para contrastar resultados.', searchUrl: 'https://www.bumeran.com.ar/', jobs: [] },
  { name: 'Indeed', kind: 'portal', note: 'Buscador general con filtros de fecha y ubicación.', searchUrl: 'https://ar.indeed.com/jobs?q=desarrollador&l=Argentina', jobs: [] },
];
