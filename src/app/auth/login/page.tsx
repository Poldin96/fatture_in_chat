"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import supabase from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Funzione per convertire errori Supabase in messaggi user-friendly
function getErrorMessage(error: { message?: string } | null | undefined): string {
  // Controllo di sicurezza per evitare errori se message è undefined
  if (!error || !error.message) {
    return 'Si è verificato un errore. Riprova o contatta il supporto.';
  }
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('invalid login credentials') || 
      errorMessage.includes('invalid email or password') ||
      errorMessage.includes('email not confirmed')) {
    return 'Email o password non corretti. Riprova.';
  }
  
  if (errorMessage.includes('too many requests')) {
    return 'Troppi tentativi di accesso. Riprova tra qualche minuto.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Problema di connessione. Controlla la tua connessione internet.';
  }
  
  if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
    return 'Indirizzo email non valido.';
  }
  
  if (errorMessage.includes('password') && errorMessage.includes('short')) {
    return 'La password deve essere di almeno 6 caratteri.';
  }
  
  // Errore generico per casi non previsti
  return 'Si è verificato un errore. Riprova o contatta il supporto.';
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  // Gestione chiusura popup con ESC
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && showResetPopup) {
        closeResetPopup();
      }
    }

    if (showResetPopup) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Previene scroll background
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showResetPopup]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    
    // Validazione base
    if (!email || !password) {
      setError('Email e password sono obbligatori.');
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        setError(getErrorMessage(error));
      } else if (data.user) {
        // Usa Next.js router invece di window.location per evitare problemi
        const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/richieste';
        router.push(returnTo);
        router.refresh(); // Refresh per aggiornare la sessione
      }
    } catch (err) {
      console.error('Errore imprevisto durante il login:', err);
      setError('Si è verificato un errore imprevisto. Riprova.');
    }
    
    setLoading(false);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);
    
    if (!resetEmail) {
      setResetError('L\'email è obbligatoria.');
      setResetLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        setResetError(getErrorMessage(error));
      } else {
        setResetSuccess(true);
        setResetEmail("");
      }
    } catch (err) {
      console.error('Errore durante il reset password:', err);
      setResetError('Si è verificato un errore. Riprova.');
    }
    
    setResetLoading(false);
  }

  function closeResetPopup() {
    setShowResetPopup(false);
    setResetEmail("");
    setResetError(null);
    setResetSuccess(false);
  }

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
              Accedi
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Benvenuto di nuovo in fatture in chat
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    placeholder="La tua password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                    disabled={loading}
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowResetPopup(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Password dimenticata?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </button>

              {error && (
                <div className="text-red-600 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Link alla registrazione */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Non hai ancora un account?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors">
                Registrati gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Popup Reset Password */}
      {showResetPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeResetPopup}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con pulsante chiusura */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-thin text-gray-900 dark:text-white">
                Recupera password
              </h2>
              <button
                onClick={closeResetPopup}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Chiudi"
              >
                <X size={24} />
              </button>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Inserisci la tua email per ricevere le istruzioni per reimpostare la password.
                  </p>
                  
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="nome@azienda.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={resetLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {resetLoading && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  {resetLoading ? 'Invio in corso...' : 'Invia email di recupero'}
                </button>

                {resetError && (
                  <div className="text-red-600 text-sm text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    {resetError}
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Email inviata!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Controlla la tua casella di posta elettronica e segui le istruzioni per reimpostare la password.
                </p>
                <button
                  onClick={closeResetPopup}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 