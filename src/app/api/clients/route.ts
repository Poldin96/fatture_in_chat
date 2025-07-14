import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ENTITY_TYPES } from "@/lib/supabase/entityTypes";

// GET: ottieni tutti i clienti dell'utente
export async function GET(req: NextRequest) {
  try {
    console.log("🔍 GET /api/clients - Inizio richiesta");
    
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

    // Recupera entity_id dai parametri query
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entity_id");
    
    console.log("🏢 Entity ID richiesto:", entityId);
    
    if (!entityId) {
      console.log("❌ Entity ID mancante");
      return NextResponse.json({ error: "Entity ID è obbligatorio" }, { status: 400 });
    }

    // Recupera i clienti filtrati per entity_id
    console.log("👥 Recupero clienti per entity:", entityId);
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("*")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (clientsError) {
      console.log("❌ Errore recupero clienti:", clientsError);
      return NextResponse.json({ error: "Errore recupero clienti" }, { status: 500 });
    }

    console.log("✅ Clienti trovati:", clients?.length || 0);

    console.log("📤 Invio risposta con", clients?.length || 0, "clienti");
    return NextResponse.json({ clients: clients || [] });
  } catch (error) {
    console.error("💥 Errore API GET clients:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// POST: crea nuovo cliente
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/clients - Inizio richiesta");
    
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

    const { name, body, entity_id } = await req.json();
    console.log("📝 Dati ricevuti:", { name, body, entity_id });
    
    if (!name) {
      console.log("❌ Nome mancante");
      return NextResponse.json({ error: "Nome è obbligatorio" }, { status: 400 });
    }

    if (!body) {
      console.log("❌ Body mancante");
      return NextResponse.json({ error: "Dati del cliente sono obbligatori" }, { status: 400 });
    }

    if (!entity_id) {
      console.log("❌ Entity ID mancante");
      return NextResponse.json({ error: "Entity ID è obbligatorio" }, { status: 400 });
    }

    // Validazione tipo società se presente
    if (body.companyType && !ENTITY_TYPES.includes(body.companyType)) {
      console.log("❌ Tipologia società non valida:", body.companyType);
      return NextResponse.json({ error: "Tipologia società non valida" }, { status: 400 });
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

    // Crea il nuovo cliente
    console.log("👤 Creazione nuovo cliente...");
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        body,
        entity_id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (clientError || !client) {
      console.log("❌ Errore creazione cliente:", clientError);
      return NextResponse.json({ error: "Errore creazione cliente" }, { status: 500 });
    }

    console.log("✅ Cliente creato:", client.id);

    console.log("📤 Invio risposta con cliente creato");
    return NextResponse.json(client);
  } catch (error) {
    console.error("💥 Errore API POST clients:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// PATCH: aggiorna cliente esistente
export async function PATCH(req: NextRequest) {
  try {
    console.log("🔍 PATCH /api/clients - Inizio richiesta");
    
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

    const { id, name, body } = await req.json();
    console.log("📝 Dati ricevuti:", { id, name, body });
    
    if (!id) {
      console.log("❌ ID mancante");
      return NextResponse.json({ error: "ID è obbligatorio" }, { status: 400 });
    }

    if (!name) {
      console.log("❌ Nome mancante");
      return NextResponse.json({ error: "Nome è obbligatorio" }, { status: 400 });
    }

    if (!body) {
      console.log("❌ Body mancante");
      return NextResponse.json({ error: "Dati del cliente sono obbligatori" }, { status: 400 });
    }

    // Validazione tipo società se presente
    if (body.companyType && !ENTITY_TYPES.includes(body.companyType)) {
      console.log("❌ Tipologia società non valida:", body.companyType);
      return NextResponse.json({ error: "Tipologia società non valida" }, { status: 400 });
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

    // Aggiorna il cliente
    console.log("🔄 Aggiornamento cliente...");
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .update({
        name,
        body,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (clientError || !client) {
      console.log("❌ Errore aggiornamento cliente:", clientError);
      return NextResponse.json({ error: "Errore aggiornamento cliente" }, { status: 500 });
    }

    console.log("✅ Cliente aggiornato:", client.id);

    console.log("📤 Invio risposta con cliente aggiornato");
    return NextResponse.json(client);
  } catch (error) {
    console.error("💥 Errore API PATCH clients:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// DELETE: elimina cliente
export async function DELETE(req: NextRequest) {
  try {
    console.log("🔍 DELETE /api/clients - Inizio richiesta");
    
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
    const entityId = searchParams.get("entity_id");
    
    console.log("📝 ID cliente da eliminare:", id);
    console.log("🏢 Entity ID:", entityId);
    
    if (!id) {
      console.log("❌ ID cliente mancante");
      return NextResponse.json({ error: "ID cliente mancante" }, { status: 400 });
    }

    if (!entityId) {
      console.log("❌ Entity ID mancante");
      return NextResponse.json({ error: "Entity ID è obbligatorio" }, { status: 400 });
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

    // Elimina il cliente (solo se appartiene all'entity specificata)
    console.log("🗑️ Eliminazione cliente...");
    const { error: deleteError } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("entity_id", entityId);

    if (deleteError) {
      console.log("❌ Errore eliminazione cliente:", deleteError);
      return NextResponse.json({ error: "Errore eliminazione cliente" }, { status: 500 });
    }

    console.log("✅ Cliente eliminato");
    console.log("📤 Invio risposta successo");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Errore API DELETE clients:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
} 