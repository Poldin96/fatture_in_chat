import React from "react";
import { FilePlus, Clock, CheckCircle, XCircle, BarChart3 } from "lucide-react";

const kpiData = [
  { label: "Totali", value: 32, icon: BarChart3, color: "text-blue-600 dark:text-blue-400" },
  { label: "In attesa", value: 7, icon: Clock, color: "text-yellow-600 dark:text-yellow-400" },
  { label: "Approvate", value: 21, icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
  { label: "Rifiutate", value: 4, icon: XCircle, color: "text-red-600 dark:text-red-400" },
];

const richieste = [
  { id: 1, azienda: "Alfa Srl", oggetto: "Fattura consulenza", stato: "In attesa", data: "2024-06-01" },
  { id: 2, azienda: "Beta Spa", oggetto: "Fattura servizi", stato: "Approvata", data: "2024-05-28" },
  { id: 3, azienda: "Gamma Srl", oggetto: "Fattura prodotti", stato: "Rifiutata", data: "2024-05-25" },
  { id: 4, azienda: "Delta Srl", oggetto: "Fattura manutenzione", stato: "Approvata", data: "2024-05-20" },
];

export default function RichiestePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-thin text-gray-900 dark:text-white mb-2">
                Richieste
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Richieste pervenute da dialoghi con l&apos;AI nelle chat
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm">
              <FilePlus size={20} />
              <span>Nuova richiesta</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {kpiData.map((kpi) => {
            const IconComponent = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${kpi.color}`}>
                    <IconComponent size={20} />
                  </div>
                </div>
                <div className="text-2xl font-thin text-gray-900 dark:text-white mb-1">
                  {kpi.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {kpi.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Azienda
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Oggetto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {richieste.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        #{r.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {r.azienda}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {r.oggetto}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          r.stato === "Approvata"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : r.stato === "Rifiutata"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {r.stato === "Approvata" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {r.stato === "Rifiutata" && <XCircle className="w-3 h-3 mr-1" />}
                        {r.stato === "In attesa" && <Clock className="w-3 h-3 mr-1" />}
                        {r.stato}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(r.data).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                        Dettagli
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Mostrando {richieste.length} di {kpiData[0].value} richieste
          </p>
        </div>
      </div>
    </div>
  );
} 