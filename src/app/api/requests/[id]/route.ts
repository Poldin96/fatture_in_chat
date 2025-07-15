import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: ottieni i dettagli di una singola richiesta
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔍 GET /api/requests/[id] - Inizio richiesta per ID:", id);
    
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

    // Recupera l'entity_id dal query parameter
    const url = new URL(req.url);
    const entityId = url.searchParams.get('entity_id');
    
    if (!entityId) {
      console.log("❌ Entity ID mancante");
      return NextResponse.json({ error: "Entity ID richiesto" }, { status: 400 });
    }

    // Verifica che l'entity appartenga all'utente
    console.log("🏢 Verifica ownership entity...");
    const { data: entity, error: entityError } = await supabase
      .from("entities")
      .select("id")
      .eq("id", entityId)
      .single();

    if (entityError || !entity) {
      console.log("❌ Entity non trovata o non autorizzata:", entityError);
      return NextResponse.json({ error: "Entity non autorizzata" }, { status: 403 });
    }

    // Recupera la richiesta specifica
    console.log("📋 Recupero richiesta con ID:", id);
    const { data: request, error: requestError } = await supabase
      .from("requests")
      .select("*")
      .eq("id", id)
      .eq("entity_id", entityId)
      .single();

    if (requestError || !request) {
      console.log("❌ Richiesta non trovata:", requestError);
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    console.log("✅ Richiesta recuperata con successo");
    
    return NextResponse.json(request);
  } catch (error) {
    console.error("❌ Errore nel recupero della richiesta:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
} 