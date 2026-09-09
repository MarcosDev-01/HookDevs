// Filtro simple de apodos: bloquea términos vulgares/sexuales explícitos
// (en español y algunos en inglés) para que el nombre público sea
// razonable en una app de perfil profesional/anónimo.
//
// Es un filtro básico por coincidencia de texto, no es infalible (se puede
// evadir con variaciones raras), pero cubre los casos comunes pedidos.

const BANNED_TERMS: string[] = [
  // términos en español
  "pito",
  "poronga",
  "pija",
  "verga",
  "choto",
  "chota",
  "vagina",
  "concha",
  "conchuda",
  "conchudo",
  "coño",
  "cono",
  "pelotudo",
  "pelotuda",
  "boludo",
  "boluda",
  "forro",
  "forra",
  "puta",
  "puto",
  "culo",
  "teta",
  "tetas",
  "pendejo",
  "pendeja",
  // términos en inglés
  "dick",
  "pussy",
  "cock",
  "penis",
  "vagina",
  "boobs",
  "tits",
  "fuck",
  "bitch",
  "asshole",
  "cunt",
  "whore",
  "slut",
];

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca tildes
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // saca espacios, guiones, números intercalados no
}

export function isCleanUsername(username: string): boolean {
  const normalized = normalize(username);
  return !BANNED_TERMS.some((term) => normalized.includes(term));
}

export function usernameError(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < 3) return "El apodo tiene que tener al menos 3 caracteres.";
  if (trimmed.length > 24) return "El apodo es demasiado largo (máximo 24 caracteres).";
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return "Usá solo letras, números, guiones, puntos o guiones bajos.";
  }
  if (!isCleanUsername(trimmed)) {
    return "Ese apodo no está permitido. Elegí otro.";
  }
  return null;
}
