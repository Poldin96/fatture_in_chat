"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Funzione per convertire errori Supabase in messaggi user-friendly
function getErrorMessage(error: { message?: string } | null | undefined): string {
  if (!error || !error.message) {
    return 'Si è verificato un errore. Riprova o contatta il supporto.';
  }
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('password') && errorMessage.includes('short')) {
    return 'La password deve essere di almeno 6 caratteri.';
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return 'La password è troppo debole. Usa almeno 6 caratteri.';
  }
  
  if (errorMessage.includes('token') || errorMessage.includes('expired')) {
    return 'Il link è scaduto o non valido. Richiedi un nuovo link di recupero.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Problema di connessione. Controlla la tua connessione internet.';
  }
  
  return 'Si è verificato un errore. Riprova o contatta il supporto.';
}

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Verifica se c'è un token di recovery valido
  useEffect(() => {
    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Se non c'è sessione con recovery token, redirect al login
      if (!session) {
        router.push('/auth/login');
      }
    };

    handleAuthChange();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Validazione
    if (!password || !confirmPassword) {
      setError('Tutti i campi sono obbligatori.');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Le password non corrispondono.');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        setError(getErrorMessage(error));
      } else {
        setSuccess(true);
        // Redirect dopo 2 secondi
        setTimeout(() => {
          router.push('/richieste');
        }, 2000);
      }
    } catch (err) {
      console.error('Errore durante il cambio password:', err);
      setError('Si è verificato un errore imprevisto. Riprova.');
    }
    
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-thin text-gray-900 dark:text-white mb-2">
              Password aggiornata!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              La tua password è stata aggiornata con successo. Verrai reindirizzato alla dashboard.
            </p>
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-blue-600">Reindirizzamento in corso...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header con back button */}
      <header className="p-6">
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Torna al login</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
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
              Nuova password
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Scegli una nuova password per il tuo account
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nuova password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserisci la nuova password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                    disabled={loading}
                    required
                    minLength={6}
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
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conferma password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Conferma la nuova password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                    disabled={loading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>La password deve essere di almeno 6 caratteri.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                {loading ? 'Aggiornamento in corso...' : 'Aggiorna password'}
              </button>

              {error && (
                <div className="text-red-600 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 