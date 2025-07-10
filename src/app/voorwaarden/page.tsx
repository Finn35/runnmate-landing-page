import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Algemene voorwaarden - Runnmate",
  description: "Lees Runnmate's algemene voorwaarden. We zijn een community platform voor hardlopers - geen betalingen, alleen directe gebruiker-tot-gebruiker transacties.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Algemene Voorwaarden</h1>
          <p className="text-sm text-gray-600 mb-8">Laatst bijgewerkt: [Datum invullen]</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welkom bij Runnmate. Door onze platform te gebruiken, ga je akkoord met de volgende voorwaarden:
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Platform Gebruik</h2>
            <p className="text-gray-700 mb-6">
              Runnmate is een community-gericht platform waar gebruikers tweedehands hardloopschoenen kunnen aanbieden of ontdekken. Wij faciliteren geen betalingen, leveringen of juridische transacties. Alle communicatie en transacties vinden direct plaats tussen gebruikers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Geen Commerciële Verantwoordelijkheid</h2>
            <p className="text-gray-700 mb-6">
              Runnmate is geen partij bij de verkoop of afspraken tussen gebruikers. Wij houden geen geld vast, faciliteren geen betalingen en bieden geen garantie of terugbetaling.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Aanbiedingen</h2>
            <p className="text-gray-700 mb-6">
              Alle aanbiedingen moeten eerlijk en accuraat zijn. Gebruikers zijn verantwoordelijk voor de inhoud en staat van hun aangeboden items. Runnmate behoudt zich het recht voor om content te verwijderen die niet aan de richtlijnen of lokale wetten voldoet.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Gebruikersauthenticatie</h2>
            <p className="text-gray-700 mb-6">
              Kopers loggen in via een magische link die per e-mail wordt verzonden. Verkopers geven hun e-mailadres op bij het plaatsen van een advertentie. Wij verzamelen geen wachtwoorden.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Privacy</h2>
            <p className="text-gray-700 mb-6">
              Wij verzamelen alleen e-mailadressen voor authenticatie en beperkte gebruiksanalyses. Wij delen of verkopen je gegevens niet. Raadpleeg ons <a href="/privacybeleid" className="text-blue-600 hover:text-blue-800">Privacybeleid</a> voor meer informatie.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Aansprakelijkheid</h2>
            <p className="text-gray-700 mb-6">
              Runnmate is niet aansprakelijk voor problemen voortvloeiend uit het gebruik van het platform. Gebruik is op eigen risico. Wij zijn niet verantwoordelijk voor beschadigde goederen, fraude of miscommunicatie tussen gebruikers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Evolutie van het platform</h2>
            <p className="text-gray-700 mb-6">
              Dit is een MVP (Minimum Viable Product). Functionaliteit en processen kunnen veranderen. We kunnen deze voorwaarden op elk moment wijzigen zonder voorafgaande kennisgeving.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-700">
                Vragen over deze voorwaarden? Neem contact met ons op via: <a href="mailto:admin@runnmate.com" className="text-blue-600 hover:text-blue-800">admin@runnmate.com</a>
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