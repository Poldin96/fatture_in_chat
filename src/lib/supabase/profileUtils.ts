import { createClient } from './server'
import { Profile, ProfileInsert } from './types'

/**
 * Ottiene o crea un profilo per l'utente autenticato
 * @returns Il profilo dell'utente
 */
export async function getOrCreateProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient()
    
    // Verifica l'autenticazione
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return null
    }

    // Prova a recuperare il profilo esistente
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingProfile) {
      return existingProfile
    }

    // Se non esiste un profilo, crealo
    if (profileError?.code === 'PGRST116') { // No rows returned
      const newProfile: ProfileInsert = {
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utente',
        type: 'user',
        body: {
          preferences: {
            theme: 'light',
            notifications: true
          }
        }
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) {
        console.error('Errore nella creazione del profilo:', createError)
        return null
      }

      return createdProfile
    }

    // Altri errori
    console.error('Errore nel recupero del profilo:', profileError)
    return null
  } catch (error) {
    console.error('Errore generico in getOrCreateProfile:', error)
    return null
  }
} 