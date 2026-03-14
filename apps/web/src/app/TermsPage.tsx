import { ArrowLeft } from 'lucide-react';

const C = {
  bg: '#F5F3EE',
  text: '#1A1A1A',
  textMuted: '#5A5A5A',
  textDim: '#6B6B6B',
  accent: '#4AACA0',
} as const;

export function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-1.5 mb-10 text-sm transition-colors" style={{ color: C.accent }}>
          <ArrowLeft size={14} /> Back to home
        </a>

        <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: C.text }}>Terms of Service</h1>
        <p className="mb-10 text-sm" style={{ color: C.textDim }}>Last updated: March 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: C.textMuted }}>
          <p>NetMD Studio ("the Service") is operated by Squircle Labs, based in Nelson, British Columbia, Canada ("we," "us," "our"). By using the Service you agree to these terms.</p>

          <Section title="1. The Service">
            <p>NetMD Studio is a web platform for MiniDisc enthusiasts. It includes tools for designing disc labels (Label Studio), transferring audio to MiniDisc devices via WebUSB (Transfer Studio), browsing a community hardware database (Device Library), and buying and selling MiniDisc equipment and media (Marketplace).</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 16 years old to use the Service. By creating an account, you represent that you meet this requirement.</p>
          </Section>

          <Section title="3. Accounts">
            <p>You are responsible for maintaining the security of your account credentials. You are responsible for all activity under your account. Notify us immediately at <a href="mailto:support@squirclelabs.uk" style={{ color: C.accent }}>support@squirclelabs.uk</a> if you suspect unauthorized access.</p>
          </Section>

          <Section title="4. Marketplace">
            <p>Sellers are responsible for the accuracy of their listings, the condition of items, and for shipping items as described within a reasonable timeframe. Buyers are responsible for providing accurate shipping information and for communicating with sellers regarding any issues.</p>
            <p>Squircle Labs charges a platform fee of 10% on the subtotal of each marketplace transaction (minimum $0.50 USD). Shipping costs are passed directly to the seller and are not subject to the platform fee. All payments are processed through Stripe. Squircle Labs is not a party to the transaction between buyer and seller.</p>
            <p>Squircle Labs does not guarantee the condition, authenticity, or delivery of items. Disputes between buyers and sellers should be resolved directly. We may assist in mediation at our discretion.</p>
          </Section>

          <Section title="5. Content and Intellectual Property">
            <p>Content you create — label designs, listings, compatibility reports, reviews — remains yours. By making a label design public, you grant other users the right to fork, modify, and use it for personal, non-commercial purposes.</p>
            <p>You must not upload content that infringes the intellectual property rights of others. We will remove infringing content upon valid notice.</p>
            <p>Transfer Studio uses open-source software including netmd-js (GPL-2.0). The source code for GPL-covered components is available at github.com/TeamZissou2025/netmd-studio.</p>
          </Section>

          <Section title="6. Acceptable Use">
            <p>You must not: use the Service for any illegal purpose; upload malicious code; attempt to access other users' accounts or data; scrape or bulk-download content from the platform; list counterfeit goods on the Marketplace; harass, abuse, or threaten other users.</p>
            <p>We may suspend or terminate accounts that violate these terms.</p>
          </Section>

          <Section title="7. Transfer Studio Disclaimer">
            <p>Transfer Studio enables direct communication between your browser and your MiniDisc hardware via WebUSB. All audio processing occurs locally in your browser. We do not control and are not responsible for the behaviour of your hardware. Use of Transfer Studio is at your own risk. We are not liable for any damage to MiniDisc equipment, media, or data arising from use of the Service.</p>
          </Section>

          <Section title="8. Availability">
            <p>We aim to keep the Service available but do not guarantee uptime. We may modify, suspend, or discontinue any part of the Service at any time.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>To the maximum extent permitted by law, Squircle Labs and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, arising from your use of the Service.</p>
            <p>Our total liability for any claim arising from the Service is limited to the amount you have paid us in the 12 months preceding the claim, or $50 CAD, whichever is greater.</p>
          </Section>

          <Section title="10. Indemnification">
            <p>You agree to indemnify Squircle Labs against any claims, damages, or expenses arising from your use of the Service, your content, or your violation of these terms.</p>
          </Section>

          <Section title="11. Governing Law">
            <p>These terms are governed by the laws of British Columbia, Canada. Disputes shall be resolved in the courts of British Columbia.</p>
          </Section>

          <Section title="12. Changes">
            <p>We may update these terms. Material changes will be posted on this page with an updated date. If you have an account, we will notify you by email. Continued use constitutes acceptance.</p>
          </Section>

          <Section title="13. Contact">
            <p><a href="mailto:support@squirclelabs.uk" style={{ color: C.accent }}>support@squirclelabs.uk</a><br />Squircle Labs<br />Nelson, British Columbia, Canada</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-3" style={{ color: '#1A1A1A' }}>{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
