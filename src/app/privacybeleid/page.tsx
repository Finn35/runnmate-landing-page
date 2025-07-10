import Header from '@/components/Header'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacybeleid - Runnmate",
  description: "Ontdek hoe Runnmate jouw privacy beschermt. We verzamelen minimale data (alleen e-mail) en delen nooit jouw gegevens met derden.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacybeleidsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacybeleid</h1>
          <p className="text-sm text-gray-600 mb-8">Laatst bijgewerkt: [Datum invullen]</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Bij Runnmate hechten we veel waarde aan jouw privacy. Dit privacybeleid legt uit hoe we persoonlijke gegevens verzamelen, opslaan en gebruiken wanneer je ons platform gebruikt (het &quot;Platform&quot;).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Gegevens die we verzamelen</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">E-mailadres:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Bij het plaatsen van een advertentie (verkoper)</li>
                <li>Bij het inloggen via magic link (koper)</li>
                <li>Bij aanmelding voor de nieuwsbrief (optioneel)</li>
              </ul>
              <p className="mt-3 text-gray-700">
                We verzamelen geen namen, wachtwoorden, betaalgegevens of andere gevoelige informatie.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Doeleinden van gegevensgebruik</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">We gebruiken e-mailadressen uitsluitend voor:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Authenticatie via magic link (Supabase Auth)</li>
                <li>Contact met nieuwsbriefabonnees (alleen bij expliciete toestemming)</li>
                <li>Verkopers informeren over interesse in hun advertentie</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Opslag en bewaartermijn</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-6">
              <li>Gegevens worden veilig opgeslagen via Supabase.</li>
              <li>Verkopersgegevens (inclusief e-mail) worden maximaal 30 dagen bewaard vanaf de dag van publicatie, tenzij verlengd.</li>
              <li>Niet-gebruikte of verlopen magic link e-mails worden automatisch verwijderd na sessieverloop.</li>
              <li>Nieuwsbrief-abonnementen worden bewaard totdat de gebruiker zich afmeldt.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Geen gegevensdeling</h2>
            <p className="text-gray-700 mb-6">
              Wij verkopen, verhuren of delen jouw gegevens nooit met derden.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies</h2>
            <p className="text-gray-700 mb-6">
              Momenteel gebruiken we geen tracking cookies. Als dit verandert, word je hiervan vooraf op de hoogte gebracht.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. GDPR-rechten</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Als je in de EU woont, heb je het recht om:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Inzage te vragen in je gegevens</li>
                <li>Je gegevens te laten verwijderen</li>
                <li>Je toestemming voor de nieuwsbrief op elk moment in te trekken</li>
              </ul>
              <p className="mt-4 text-gray-700">
                Neem hiervoor contact met ons op via: <a href="mailto:admin@runnmate.com" className="text-blue-600 hover:text-blue-800">admin@runnmate.com</a>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Terug naar home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 