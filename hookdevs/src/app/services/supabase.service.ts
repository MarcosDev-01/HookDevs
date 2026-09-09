import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Este cliente se usa SOLO para guardar el apodo público (para que el chat
// pueda encontrar gente) y los mensajes. No usa el sistema de Auth de
// Supabase: la "sesión" real vive en el navegador (ver AuthService).
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );
}
