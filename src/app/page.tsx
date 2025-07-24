"use client";
import Link from "next/link";
import Image from "next/image";
import { Building, Briefcase, CheckCircle, Users, MessageCircle, Share2, Heart, Code, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white font-system selection:bg-yellow-200 dark:selection:bg-yellow-600 selection:text-gray-900 dark:selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image 
                src="/favicon.ico" 
                alt="favicon" 
                width={32} 
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-medium">fatture in chat</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base">
                Accedi
              </Link>
              <Link href="/c" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base">
                Chatta con l&apos;AI
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-thin tracking-tight leading-tight mb-6 sm:mb-8">
            La fatturazione <span className="text-gray-400">senza stress</span><br className="hidden sm:block" />
            <span className="sm:hidden"> </span>tra azienda e commercialista
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            L&apos;intelligenza artificiale che semplifica la comunicazione tra aziende e commercialisti.
          </p>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 backdrop-blur-sm mx-auto max-w-lg sm:max-w-none">
            <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              Dì all&apos;AI cosa vuoi fatturare, a chi e come: penserà a tutto lei.
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              Il commercialista riceve solo dati completi, pronti per la fattura.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a href="#aziende" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2">
              <Building size={18} className="sm:w-5 sm:h-5" />
              Per le aziende
            </a>
            <a href="#commercialisti" className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 flex items-center justify-center gap-2">
              <Briefcase size={18} className="sm:w-5 sm:h-5" />
              Per i commercialisti
            </a>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-4">
              Una conversazione reale con la nostra AI
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 max-w-2xl mx-auto">
            <div className="space-y-4 sm:space-y-6">
              {/* Messaggio AI */}
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl sm:rounded-3xl rounded-tl-lg px-4 sm:px-6 py-3 sm:py-4 max-w-[85%] sm:max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Fatture in Chat</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-relaxed">
                    <span className="font-medium">Cosa vuoi fatturare?</span><br />
                    Scrivimi i dettagli della fattura
                  </p>
                </div>
              </div>
              
              {/* Messaggio Utente */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl sm:rounded-3xl rounded-tr-lg px-4 sm:px-6 py-3 sm:py-4 max-w-[85%] sm:max-w-[80%]">
                  <div className="flex items-center justify-end gap-2 mb-1 sm:mb-2">
                    <span className="text-xs font-medium text-blue-100">Tu</span>
                    <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed">
                    fattura su Larin Srl euro 2580 € per Lavori manutenzione arredamento sede
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8 text-center">
              <div className="inline-flex items-start gap-2 px-3 sm:px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium text-left">
                  Dati raccolti e registrati: 
                  <br /> Larin Srl · Importo: 2580 € + IVA 22%
                  <br /> Causale: &quot;Lavori per manutenzione dell&apos;arredamento della sede del cliente.&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione per le aziende */}
      <section id="aziende" className="py-12 sm:py-20 px-4 sm:px-6 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Building className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-6 text-gray-400" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">
              Per le aziende
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Semplifica la tua contabilità con l&apos;intelligenza artificiale
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Comunicazione naturale
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Descrivi le tue transazioni in linguaggio naturale, l&apos;AI si occupa del resto
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Dati sempre completi
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Tutte le informazioni necessarie vengono raccolte automaticamente per la fatturazione
              </p>
            </div>
            
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Collaborazione fluida
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Il tuo commercialista riceve dati strutturati e pronti per l&apos;elaborazione
              </p>
            </div>
          </div>
          
          <div className="text-center bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">
              Tutto incluso.
            </h3>
            <div className="mb-6 sm:mb-8">
              <span className="text-4xl sm:text-5xl font-thin text-gray-900 dark:text-white">€25</span>
              <span className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 ml-2">al mese</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto">
              Utenti illimitati • Chat illimitate • Richieste illimitate 
              <br />Fino a 1,2 MLN di token dedicati inclusi
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/auth/register" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200">
                Inizia subito
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200">
                Pricing completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione per i commercialisti */}
      <section id="commercialisti" className="py-12 sm:py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-6 text-gray-400" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">
              Per i commercialisti
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Offri un servizio innovativo ai tuoi clienti con tariffe agevolate
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">
                Servizio ai clienti
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Offri fatture in chat direttamente ai tuoi clienti</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Ricevi dati già strutturati e verificati dall&apos;AI</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Riduci i tempi di elaborazione e gli errori</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">
                Tariffe agevolate
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Sconti progressivi in base al numero di clienti</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Piani personalizzati per studi e associazioni</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Supporto dedicato per la migrazione</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">
              Scopri le nostre offerte
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto font-light">
              Contattaci per un preventivo personalizzato basato sulle tue esigenze
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/auth/register?type=commercialista" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200">
                Inizia subito
              </Link>
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200">
                Contatta il team di vendita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione API */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <Code className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 sm:mb-6 text-gray-400" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6">
              API per sviluppatori
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
              Integra le funzionalità di fatturazione nelle tue app con le nostre API REST
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Facile integrazione
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Integrazione semplice con chiamate HTTP standard
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Sicura e affidabile
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Autenticazione sicura e limiti di utilizzo appropriati
              </p>
            </div>
            
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <Code className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Documentazione completa
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Documentazione con esempi pratici e guide di base
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-thin text-gray-900 dark:text-white mb-4 sm:mb-6 text-center">
                Inizia subito con le API
              </h3>
              
              <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 font-mono text-sm overflow-x-auto">
                <div className="text-gray-400 mb-2">Esempio di chiamata API</div>
                <div className="text-green-400">GET</div>
                <div className="text-blue-400">https://api.fattureinChat.com/v1/requests</div>
                <div className="text-gray-300 mt-2">
                  {`{
  "requests": [
    {
      "id": "req_123",
      "description": "Consulenza SEO per e-commerce",
      "client": "Mario Rossi Srl",
      "amount": 1500.00,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/docs/api" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2">
                    <Code size={18} className="sm:w-5 sm:h-5" />
                    Documentazione API
                  </Link>
                  <Link href="/auth/register" className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200">
                    Ottieni le chiavi API
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione condivisione */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-thin text-gray-900 dark:text-white">
              Ti piace quello che vedi?
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Aiutaci a far conoscere fatture in chat! Condividi questa pagina con altri imprenditori e commercialisti che potrebbero trarne beneficio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'fatture in chat - La fatturazione senza stress',
                    text: 'Scopri come semplificare la comunicazione tra aziende e commercialisti con l\'AI',
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copiato negli appunti!');
                }
              }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Condividi questa pagina</span>
            </button>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Ogni condivisione ci aiuta a crescere 🚀
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} fatture in chat. Made with ❤️ in Italy.
          </p>
        </div>
      </footer>
    </div>
  );
}
