"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import supabase from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

// Funzione per convertire errori Supabase in messaggi user-friendly
function getErrorMessage(error: { message?: string } | null | undefined): string {
  if (!error || !error.message) {
    return 'Si è verificato un errore. Riprova o contatta il supporto.';
  }
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('already registered') || errorMessage.includes('email already exists')) {
    return 'Questo indirizzo email è già registrato. Prova ad accedere.';
  }
  
  if (errorMessage.includes('invalid email')) {
    return 'Indirizzo email non valido.';
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('short')) {
    return 'La password deve essere di almeno 6 caratteri.';
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return 'La password è troppo debole. Usa lettere, numeri e simboli.';
  }
  
  if (errorMessage.includes('signup') && errorMessage.includes('disabled')) {
    return 'Le registrazioni sono temporaneamente disabilitate.';
  }
  
  return 'Si è verificato un errore durante la registrazione. Riprova.';
}

// Componente che usa useSearchParams()
function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type');
  const isCommercialista = userType === 'commercialista';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    const form = e.currentTarget;
    const nome = (form.elements.namedItem("nome") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const repeat = (form.elements.namedItem("repeat") as HTMLInputElement).value;
    
    // Validazione base
    if (!nome || !email || !password || !repeat) {
      setError('Tutti i campi sono obbligatori.');
      setLoading(false);
      return;
    }
    
    if (password !== repeat) {
      setError("Le password non coincidono.");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri.");
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            nome,
            user_type: userType || 'azienda' // Salva il tipo di utente
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });
      
      if (error) {
        setError(getErrorMessage(error));
      } else if (data.user) {
        setSuccess(true);
        // Redirect dopo 3 secondi per dare tempo di leggere il messaggio
        setTimeout(() => {
          router.push("/richieste");
        }, 3000);
      }
    } catch (err) {
      console.error('Errore imprevisto durante la registrazione:', err);
      setError('Si è verificato un errore imprevisto. Riprova.');
    }
    
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo e branding */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Image 
            src="/favicon.ico" 
            alt="fatture in chat" 
            width={48} 
            height={48}
            className="w-12 h-12"
          />
        </div>
        <h1 className="text-3xl font-thin text-gray-900 dark:text-white mb-2">
          {isCommercialista ? 'Registrati come commercialista' : 'Registrati'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isCommercialista 
            ? 'Crea il tuo account per professionisti e accedi alle tariffe agevolate'
            : 'Crea il tuo account e inizia subito'
          }
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome completo
            </label>
            <input 
              id="nome"
              name="nome" 
              type="text" 
              placeholder="Il tuo nome"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              disabled={loading}
              autoComplete="given-name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input 
              id="email"
              name="email" 
              type="email" 
              placeholder="nome@azienda.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Almeno 6 caratteri"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="repeat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Conferma password
            </label>
            <div className="relative">
              <input
                id="repeat"
                name="repeat"
                type={showRepeat ? "text" : "password"}
                placeholder="Ripeti la password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowRepeat((v) => !v)}
                tabIndex={-1}
                aria-label={showRepeat ? "Nascondi password" : "Mostra password"}
              >
                {showRepeat ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {loading ? 'Registrazione in corso...' : 'Crea account'}
          </button>

          {error && (
            <div className="text-red-600 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              <span>Registrazione completata! Controlla la tua email per confermare. Reindirizzamento in corso...</span>
            </div>
          )}
        </form>
      </div>

      {/* Link al login */}
      <div className="text-center mt-8">
        <p className="text-gray-600 dark:text-gray-400">
          Hai già un account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}

// Componente di fallback per il loading
function RegisterFormFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <Image 
            src="/favicon.ico" 
            alt="fatture in chat" 
            width={48} 
            height={48}
            className="w-12 h-12"
          />
        </div>
        <h1 className="text-3xl font-thin text-gray-900 dark:text-white mb-2">
          Registrati
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea il tuo account e inizia subito
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-12 bg-blue-300 dark:bg-blue-600 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header con back button */}
      <header className="p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Torna alla home</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Suspense fallback={<RegisterFormFallback />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
} 