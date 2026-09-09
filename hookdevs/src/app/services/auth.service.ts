import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { usernameError } from '../lib/profanity';

const SESSION_KEY = 'hookdevs_session';

// La verificación de usuario/contraseña ahora la hace el servidor
// (funciones register_account / login_account en Postgres, ver
// supabase/schema.sql), no el navegador. Lo único que vive en
// localStorage es la SESIÓN ya validada (id + apodo), para no tener que
// volver a loguearse cada vez que se abre la app en el mismo dispositivo.
// Iniciar sesión desde otro dispositivo funciona igual, porque la cuenta
// de verdad vive en la base de datos, no en el navegador.

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = signal<{ id: string; username: string } | null>(this.loadSession());

  constructor(private supabase: SupabaseService) {}

  private loadSession(): { id: string; username: string } | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setSession(session: { id: string; username: string }) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  async register(username: string, password: string): Promise<string | null> {
    const nameError = usernameError(username);
    if (nameError) return nameError;
    if (password.length < 4) return 'La contraseña tiene que tener al menos 4 caracteres.';

    const { data, error } = await this.supabase.client.rpc('register_account', {
      p_username: username,
      p_password: password,
    });

    if (error) {
      if (error.message.includes('apodo_en_uso')) return 'Ese apodo ya está en uso. Elegí otro.';
      if (error.message.includes('apodo_invalido')) return 'Apodo inválido (entre 3 y 24 caracteres).';
      if (error.message.includes('password_invalida')) return 'La contraseña tiene que tener al menos 4 caracteres.';
      return 'No se pudo crear el apodo: ' + error.message;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return 'No se pudo crear el apodo.';
    this.setSession({ id: row.id, username: row.username });
    return null;
  }

  async login(username: string, password: string): Promise<string | null> {
    const { data, error } = await this.supabase.client.rpc('login_account', {
      p_username: username,
      p_password: password,
    });

    if (error) return 'No se pudo iniciar sesión: ' + error.message;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return 'Apodo o contraseña incorrectos.';

    this.setSession({ id: row.id, username: row.username });
    return null;
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
    this.session.set(null);
  }

  isLoggedIn(): boolean {
    return this.session() !== null;
  }
}
