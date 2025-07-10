import Header from '@/components/Header'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacy policy - Runnmate",
  description: "Learn how Runnmate protects your privacy. We collect minimal data (email only) and never share your information with third parties.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: [Insert Date]</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              At Runnmate, your privacy matters. This Privacy Policy explains how we collect, store, and use your personal data when you use our platform (the &quot;Platform&quot;).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Data We Collect</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Email Address:</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>When listing a pair of shoes (seller)</li>
                <li>When logging in via magic link (buyer)</li>
                <li>When subscribing to our newsletter (optional)</li>
              </ul>
              <p className="mt-3 text-gray-700">
                We do not collect names, passwords, payment details, or any other sensitive personal data.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Purpose of Data Use</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">Email addresses are used only for:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Authenticating access via magic link (Supabase Auth)</li>
                <li>Contacting newsletter subscribers (if explicitly opted-in)</li>
                <li>Notifying sellers about interest in their listings</li>
              </ul>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Data Storage & Retention</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-6">
              <li>Data is stored securely via Supabase.</li>
              <li>Seller listing data (including email) is retained for 30 days from the date of submission unless renewed.</li>
              <li>Unused or expired magic link emails are automatically deleted after session expiry.</li>
              <li>Newsletter subscriber emails are retained until unsubscribed.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. No Data Sharing</h2>
            <p className="text-gray-700 mb-6">
              We never sell, rent, or share your data with third parties.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Cookies</h2>
            <p className="text-gray-700 mb-6">
              We currently do not use tracking cookies. If this changes, you will be informed before any tracking begins.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. GDPR Rights</h2>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">If you are an EU resident, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Request access to your data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw newsletter consent at any time</li>
              </ul>
              <p className="mt-4 text-gray-700">
                To do so, contact us at: <a href="mailto:admin@runnmate.com" className="text-blue-600 hover:text-blue-800">admin@runnmate.com</a>
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