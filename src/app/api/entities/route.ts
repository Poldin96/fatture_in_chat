import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ENTITY_TYPES } from "@/lib/supabase/entityTypes";


// GET: ottieni tutte le entità dell'utente tramite la tabella junction
export async function GET(req: NextRequest) {
  try {
    console.log("🔍 GET /api/entities - Inizio richiesta");
    
    const supabase = await createClient();
    
    // Prova prima con l'header Authorization, poi fallback ai cookie
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let authError = null;
    
    console.log("🔐 Controllo autenticazione...");
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log("🎫 Usando token Authorization");
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
    } else {
      console.log("🍪 Usando cookie");
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }
    
    if (authError || !user) {
      console.log("❌ Errore autenticazione:", authError);
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    
    console.log("✅ Utente autenticato:", user.id);

    // Recupera il profilo dell'utente
    console.log("👤 Recupero profilo utente...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.log("❌ Errore recupero profilo:", profileError);
      return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 });
    }

    console.log("✅ Profilo trovato:", profile.id);

    // Recupera le entità collegate al profilo tramite la tabella junction
    console.log("🔗 Recupero entità tramite link_entities_profiles...");
    const { data: entityLinks, error: linksError } = await supabase
      .from("link_entities_profiles")
      .select(`
        role,
        entity_id,
        entities (
          id,
          name,
          body,
          created_at,
          updated_at
        )
      `)
      .eq("profile_id", profile.id);

    if (linksError) {
      console.log("❌ Errore recupero links:", linksError);
      return NextResponse.json({ error: "Errore recupero entità" }, { status: 500 });
    }

    console.log("✅ Links trovati:", entityLinks?.length || 0);

    // Trasforma i dati per il frontend (TypeScript inferisce automaticamente il tipo dalla query)
    const entities = entityLinks?.map((link) => {
      const entity = Array.isArray(link.entities) ? link.entities[0] : link.entities; 
      return {
        id: entity?.id,
        name: entity?.name,
        body: entity?.body,
        created_at: entity?.created_at,
        updated_at: entity?.updated_at,
        role: link.role 
      };
    }).filter(entity => entity.id) || []; // Filtra entità valide

    console.log("📤 Invio risposta con", entities.length, "entità");
    return NextResponse.json({ entities });
  } catch (error) {
    console.error("💥 Errore API GET entities:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// POST: crea nuova entità e collega al profilo
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/entities - Inizio richiesta");
    
    const supabase = await createClient();
    
    // Prova prima con l'header Authorization, poi fallback ai cookie
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let authError = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
    } else {
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }
    
    if (authError || !user) {
      console.log("❌ Errore autenticazione:", authError);
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { name, partita_iva, tipo, role = "owner" } = await req.json();
    console.log("📝 Dati ricevuti:", { name, partita_iva, tipo, role });
    
    if (!name || !partita_iva || !tipo) {
      console.log("❌ Dati mancanti");
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    if (!ENTITY_TYPES.includes(tipo)) {
      console.log("❌ Tipologia non valida:", tipo);
      return NextResponse.json({ error: "Tipologia non valida" }, { status: 400 });
    }

    // Recupera il profilo dell'utente
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.log("❌ Errore recupero profilo:", profileError);
      return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 });
    }

    console.log("✅ Profilo trovato:", profile.id);

    // Crea la nuova entità
    console.log("🏢 Creazione nuova entità...");
    const { data: entity, error: entityError } = await supabase
      .from("entities")
      .insert({
        name,
        body: { partita_iva, tipo }
      })
      .select()
      .single();

    if (entityError || !entity) {
      console.log("❌ Errore creazione entità:", entityError);
      return NextResponse.json({ error: "Errore creazione entità" }, { status: 500 });
    }

    console.log("✅ Entità creata:", entity.id);

    // Collega l'entità al profilo
    console.log("🔗 Creazione collegamento entità-profilo...");
    const { data: link, error: linkError } = await supabase
      .from("link_entities_profiles")
      .insert({
        entity_id: entity.id,
        profile_id: profile.id,
        role: role
      })
      .select()
      .single();

    if (linkError) {
      console.log("❌ Errore creazione collegamento:", linkError);
      // Rollback: elimina l'entità creata
      await supabase.from("entities").delete().eq("id", entity.id);
      return NextResponse.json({ error: "Errore collegamento entità" }, { status: 500 });
    }

    console.log("✅ Collegamento creato:", link.id);

    // Restituisci l'entità con il ruolo
    const entityWithRole = {
      ...entity,
      role: role
    };

    console.log("📤 Invio risposta con entità creata");
    return NextResponse.json(entityWithRole);
  } catch (error) {
    console.error("💥 Errore API POST entities:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// PATCH: aggiorna entità esistente
export async function PATCH(req: NextRequest) {
  try {
    console.log("🔍 PATCH /api/entities - Inizio richiesta");
    
    const supabase = await createClient();
    
    // Prova prima con l'header Authorization, poi fallback ai cookie
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let authError = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
    } else {
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }
    
    if (authError || !user) {
      console.log("❌ Errore autenticazione:", authError);
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { id, entity_id, name, partita_iva, tipo, role } = await req.json();
    const entityId = id || entity_id; // Supporta entrambi i formati
    
    console.log("📝 Dati ricevuti:", { entityId, name, partita_iva, tipo, role });
    
    if (!entityId || !name || !partita_iva || !tipo) {
      console.log("❌ Dati mancanti");
      return NextResponse.json({ error: "Dati mancanti" }, { status: 400 });
    }

    if (!ENTITY_TYPES.includes(tipo)) {
      console.log("❌ Tipologia non valida:", tipo);
      return NextResponse.json({ error: "Tipologia non valida" }, { status: 400 });
    }

    // Recupera il profilo dell'utente
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.log("❌ Errore recupero profilo:", profileError);
      return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 });
    }

    console.log("✅ Profilo trovato:", profile.id);

    // Verifica che l'utente abbia accesso all'entità
    console.log("🔍 Verifica accesso all'entità...");
    const { data: existingLink, error: linkError } = await supabase
      .from("link_entities_profiles")
      .select("id, role")
      .eq("entity_id", entityId)
      .eq("profile_id", profile.id)
      .single();

    if (linkError || !existingLink) {
      console.log("❌ Accesso negato all'entità:", linkError);
      return NextResponse.json({ error: "Accesso negato all'entità" }, { status: 403 });
    }

    console.log("✅ Accesso confermato, ruolo attuale:", existingLink.role);

    // Aggiorna l'entità
    console.log("🔄 Aggiornamento entità...");
    const { data: entity, error: entityError } = await supabase
      .from("entities")
      .update({
        name,
        body: { partita_iva, tipo },
        updated_at: new Date().toISOString()
      })
      .eq("id", entityId)
      .select()
      .single();

    if (entityError || !entity) {
      console.log("❌ Errore aggiornamento entità:", entityError);
      return NextResponse.json({ error: "Errore aggiornamento entità" }, { status: 500 });
    }

    console.log("✅ Entità aggiornata:", entity.id);

    // Se è stato specificato un nuovo ruolo, aggiorna anche il collegamento
    if (role && role !== existingLink.role) {
      console.log("🔄 Aggiornamento ruolo da", existingLink.role, "a", role);
      const { error: roleUpdateError } = await supabase
        .from("link_entities_profiles")
        .update({ role })
        .eq("id", existingLink.id);

      if (roleUpdateError) {
        console.log("⚠️ Errore aggiornamento ruolo:", roleUpdateError);
        // Non bloccare la risposta, solo un warning
      }
    }

    // Restituisci l'entità con il ruolo
    const entityWithRole = {
      ...entity,
      role: role || existingLink.role
    };

    console.log("📤 Invio risposta con entità aggiornata");
    return NextResponse.json(entityWithRole);
  } catch (error) {
    console.error("💥 Errore API PATCH entities:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// DELETE: elimina collegamento entità (non l'entità stessa)
export async function DELETE(req: NextRequest) {
  try {
    console.log("🔍 DELETE /api/entities - Inizio richiesta");
    
    const supabase = await createClient();
    
    // Prova prima con l'header Authorization, poi fallback ai cookie
    const authHeader = req.headers.get('Authorization');
    let user = null;
    let authError = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
    } else {
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }
    
    if (authError || !user) {
      console.log("❌ Errore autenticazione:", authError);
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    console.log("📝 ID entità da scollegare:", id);
    
    if (!id) {
      console.log("❌ ID entità mancante");
      return NextResponse.json({ error: "ID entità mancante" }, { status: 400 });
    }

    // Recupera il profilo dell'utente
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.log("❌ Errore recupero profilo:", profileError);
      return NextResponse.json({ error: "Profilo non trovato" }, { status: 404 });
    }

    console.log("✅ Profilo trovato:", profile.id);

    // Elimina il collegamento (non l'entità)
    console.log("🗑️ Eliminazione collegamento entità-profilo...");
    const { error: deleteError } = await supabase
      .from("link_entities_profiles")
      .delete()
      .eq("entity_id", id)
      .eq("profile_id", profile.id);

    if (deleteError) {
      console.log("❌ Errore eliminazione collegamento:", deleteError);
      return NextResponse.json({ error: "Errore eliminazione collegamento" }, { status: 500 });
    }

    console.log("✅ Collegamento eliminato");
    console.log("📤 Invio risposta successo");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Errore API DELETE entities:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
} 