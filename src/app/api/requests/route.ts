import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { REQUEST_TYPES, RequestType } from "@/lib/supabase/requestTypes";

// GET: ottieni tutte le richieste dell'entity
export async function GET(req: NextRequest) {
  try {
    console.log("🔍 GET /api/requests - Inizio richiesta");
    
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

    // Recupera le richieste filtrate per entity_id
    console.log("📋 Recupero richieste per entity:", entityId);
    const { data: requests, error: requestsError } = await supabase
      .from("requests")
      .select("*")
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (requestsError) {
      console.log("❌ Errore recupero richieste:", requestsError);
      return NextResponse.json({ error: "Errore recupero richieste" }, { status: 500 });
    }

    console.log("✅ Richieste trovate:", requests?.length || 0);

    console.log("📤 Invio risposta con", requests?.length || 0, "richieste");
    return NextResponse.json({ requests: requests || [] });
  } catch (error) {
    console.error("💥 Errore API GET requests:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// POST: crea nuova richiesta
export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/requests - Inizio richiesta");
    
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

    const { type, body, entity_id } = await req.json();
    console.log("📝 Dati ricevuti:", { type, body, entity_id });
    
    if (!type) {
      console.log("❌ Tipo richiesta mancante");
      return NextResponse.json({ error: "Tipo richiesta è obbligatorio" }, { status: 400 });
    }

    if (!body) {
      console.log("❌ Body mancante");
      return NextResponse.json({ error: "Dati della richiesta sono obbligatori" }, { status: 400 });
    }

    if (!entity_id) {
      console.log("❌ Entity ID mancante");
      return NextResponse.json({ error: "Entity ID è obbligatorio" }, { status: 400 });
    }

    // Validazione tipo richiesta
    if (!Object.values(REQUEST_TYPES).includes(type as RequestType)) {
      console.log("❌ Tipo richiesta non valido:", type);
      return NextResponse.json({ error: "Tipo richiesta non valido" }, { status: 400 });
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

    // Crea la nuova richiesta
    console.log("📋 Creazione nuova richiesta...");
    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        type,
        body,
        entity_id,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (requestError || !request) {
      console.log("❌ Errore creazione richiesta:", requestError);
      return NextResponse.json({ error: "Errore creazione richiesta" }, { status: 500 });
    }

    console.log("✅ Richiesta creata:", request.id);

    console.log("📤 Invio risposta con richiesta creata");
    return NextResponse.json(request);
  } catch (error) {
    console.error("💥 Errore API POST requests:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// PATCH: aggiorna richiesta esistente
export async function PATCH(req: NextRequest) {
  try {
    console.log("🔍 PATCH /api/requests - Inizio richiesta");
    
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

    const { id, status, body, entity_id } = await req.json();
    console.log("📝 Dati ricevuti:", { id, status, body, entity_id });
    
    if (!id) {
      console.log("❌ ID mancante");
      return NextResponse.json({ error: "ID è obbligatorio" }, { status: 400 });
    }

    if (!entity_id) {
      console.log("❌ Entity ID mancante");
      return NextResponse.json({ error: "Entity ID è obbligatorio" }, { status: 400 });
    }

    // Validazione status se fornito
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      console.log("❌ Status non valido:", status);
      return NextResponse.json({ error: "Status non valido" }, { status: 400 });
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

    // Aggiorna la richiesta (solo se appartiene all'entity specificata)
    console.log("📝 Aggiornamento richiesta...");
    const updateData: {
      updated_at: string;
      status?: string;
      body?: unknown;
    } = {
      updated_at: new Date().toISOString()
    };
    
    if (status) updateData.status = status;
    if (body) updateData.body = body;

    const { data: request, error: requestError } = await supabase
      .from("requests")
      .update(updateData)
      .eq("id", id)
      .eq("entity_id", entity_id)
      .select()
      .single();

    if (requestError || !request) {
      console.log("❌ Errore aggiornamento richiesta:", requestError);
      return NextResponse.json({ error: "Errore aggiornamento richiesta" }, { status: 500 });
    }

    console.log("✅ Richiesta aggiornata:", request.id);

    console.log("📤 Invio risposta con richiesta aggiornata");
    return NextResponse.json(request);
  } catch (error) {
    console.error("💥 Errore API PATCH requests:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
}

// DELETE: elimina richiesta
export async function DELETE(req: NextRequest) {
  try {
    console.log("🔍 DELETE /api/requests - Inizio richiesta");
    
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
    
    console.log("📝 ID richiesta da eliminare:", id);
    console.log("🏢 Entity ID:", entityId);
    
    if (!id) {
      console.log("❌ ID richiesta mancante");
      return NextResponse.json({ error: "ID richiesta mancante" }, { status: 400 });
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

    // Elimina la richiesta (solo se appartiene all'entity specificata)
    console.log("🗑️ Eliminazione richiesta...");
    const { error: deleteError } = await supabase
      .from("requests")
      .delete()
      .eq("id", id)
      .eq("entity_id", entityId);

    if (deleteError) {
      console.log("❌ Errore eliminazione richiesta:", deleteError);
      return NextResponse.json({ error: "Errore eliminazione richiesta" }, { status: 500 });
    }

    console.log("✅ Richiesta eliminata");
    console.log("📤 Invio risposta successo");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Errore API DELETE requests:", error);
    return NextResponse.json({ error: "Errore interno del server" }, { status: 500 });
  }
} 