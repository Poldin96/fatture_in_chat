import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Mantieni la compatibilità con il codice esistente
export const supabase = createClient()
export default supabase

/**
 * Crea un client Supabase autenticato con un access token (JWT), utile per le API route.
 */
export function getSupabaseServerClient(accessToken?: string) {
  if (!accessToken) return supabase;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  );
}

/**
 * Restituisce i dati dell'utente autenticato, inclusi i dati custom (ad esempio nome).
 * Restituisce null se non autenticato.
 * Può accettare un accessToken per uso server-side.
 */
export async function getCurrentUser(accessToken?: string) {
  const client = accessToken ? getSupabaseServerClient(accessToken) : supabase;
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  // I dati custom (come nome) sono in user.user_metadata
  return {
    id: user.id,
    email: user.email,
    nome: user.user_metadata?.nome || null,
    ...user.user_metadata,
  };
} 