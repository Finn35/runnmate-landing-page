import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Terms of service - Runnmate",
  description: "Read Runnmate's terms of service. We're a community platform connecting runners - no payments, just direct user-to-user transactions.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: January 10, 2025</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to Runnmate. By using our platform (the &quot;Platform&quot;), you agree to the following terms and conditions:
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Platform Use</h2>
            <p className="text-gray-700 mb-6">
              Runnmate is a community-driven platform that enables users to list and discover second-hand running shoes. We do not facilitate payments, delivery, or legal transactions. All communication and potential transactions occur directly between users.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. No Commercial Responsibility</h2>
            <p className="text-gray-700 mb-6">
              Runnmate is not a party to any sales or agreements between users. We do not hold or transfer money, guarantee delivery, or offer refunds or mediation.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Listings</h2>
            <p className="text-gray-700 mb-6">
              All listings must be honest and accurate. Users are responsible for the content and condition of the items they list. Runnmate reserves the right to remove any content that violates guidelines or local laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. User Authentication</h2>
            <p className="text-gray-700 mb-6">
              Buyers authenticate via magic link email login. Sellers provide their email address when submitting listings. We do not collect passwords.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Privacy</h2>
            <p className="text-gray-700 mb-6">
              We collect email addresses for authentication and basic usage analytics only. We will not share, sell, or misuse your data. Please refer to our <a href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a> for more.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Liability</h2>
            <p className="text-gray-700 mb-6">
              Runnmate is not liable for any issues arising from use of the Platform. Use at your own risk. We are not responsible for damaged goods, fraud, or missed communications between users.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Platform Evolution</h2>
            <p className="text-gray-700 mb-6">
              This is an MVP (Minimum Viable Product). Features, scope, and processes may change. We may update these terms without prior notice.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-700">
                Questions about these terms? Contact us at: <a href="mailto:admin@runnmate.com" className="text-blue-600 hover:text-blue-800">admin@runnmate.com</a>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 