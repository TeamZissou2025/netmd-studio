import { ArrowLeft } from 'lucide-react';

const C = {
  bg: '#F5F3EE',
  text: '#1A1A1A',
  textMuted: '#5A5A5A',
  textDim: '#6B6B6B',
  accent: '#4AACA0',
  border: '#E0DDD6',
} as const;

export function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-1.5 mb-10 text-sm transition-colors" style={{ color: C.accent }}>
          <ArrowLeft size={14} /> Back to home
        </a>

        <h1 className="text-3xl font-black tracking-tight mb-1" style={{ color: C.text }}>Privacy Policy</h1>
        <p className="mb-10 text-sm" style={{ color: C.textDim }}>Last updated: March 2026</p>

        <div className="space-y-8 text-[15px] leading-relaxed" style={{ color: C.textMuted }}>
          <p>NetMD Studio ("the Service") is operated by Squircle Labs, based in Nelson, British Columbia, Canada ("we," "us," "our").</p>
          <p>This policy explains what personal information we collect, why we collect it, how we use it, and your rights. We are committed to protecting your privacy across all jurisdictions.</p>

          <Section title="1. What We Collect">
            <p><strong style={{ color: C.text }}>Waitlist signup:</strong> Email address only, collected when you submit the signup form on our landing page.</p>
            <p><strong style={{ color: C.text }}>Account registration:</strong> Email address, display name, optional avatar image, optional location and bio.</p>
            <p><strong style={{ color: C.text }}>Marketplace activity:</strong> Listing data, order details, shipping addresses, messages between buyers and sellers. Payment information is collected and processed directly by Stripe — we never see, handle, or store your credit card or bank details.</p>
            <p><strong style={{ color: C.text }}>Transfer Studio:</strong> Transfer history (track names, formats, timestamps). All audio processing happens entirely in your browser. No audio data is sent to our servers.</p>
            <p><strong style={{ color: C.text }}>Label Studio:</strong> Design data (canvas JSON, metadata), thumbnails of saved designs.</p>
            <p><strong style={{ color: C.text }}>Device Library:</strong> Compatibility reports you submit (device, browser, OS, notes).</p>
            <p><strong style={{ color: C.text }}>Automatically collected:</strong> Basic analytics: page views, referrer, browser type, country (no IP addresses stored). We do not use third-party advertising trackers.</p>
          </Section>

          <Section title="2. Why We Collect It (Legal Basis)">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: C.text }}>Waitlist:</strong> your explicit consent, given by submitting the form and checking the consent box. Used solely to send one launch notification email.</li>
              <li><strong style={{ color: C.text }}>Account and service data:</strong> necessary for the performance of our contract with you (providing the Service).</li>
              <li><strong style={{ color: C.text }}>Analytics:</strong> our legitimate interest in understanding usage to improve the Service.</li>
              <li><strong style={{ color: C.text }}>Marketplace and payment data:</strong> necessary for the performance of purchase contracts and legal compliance (tax records, fraud prevention).</li>
            </ul>
          </Section>

          <Section title="3. What We Do NOT Do">
            <ul className="list-disc pl-5 space-y-1">
              <li>We do not sell, rent, or trade your personal information to anyone, ever.</li>
              <li>We do not share your data with third-party advertisers.</li>
              <li>We do not send unsolicited marketing emails. Waitlist subscribers receive one email at launch, then their address is deleted unless they create an account.</li>
              <li>We do not use your data to build advertising profiles.</li>
              <li>We do not make automated decisions that produce legal effects concerning you.</li>
            </ul>
          </Section>

          <Section title="4. Who We Share Data With">
            <p>We share data only with the following service providers, who process it on our behalf under data processing agreements:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: C.text }}>Supabase</strong> (database hosting, authentication) — servers in US-West (AWS Oregon)</li>
              <li><strong style={{ color: C.text }}>Vercel</strong> (web hosting, serverless functions) — global CDN with primary in US</li>
              <li><strong style={{ color: C.text }}>Stripe</strong> (payment processing) — for marketplace transactions only</li>
              <li><strong style={{ color: C.text }}>Cover Art Archive / MusicBrainz</strong> (album metadata) — public API, no personal data sent</li>
              <li><strong style={{ color: C.text }}>Discogs</strong> (album metadata) — search queries only, no personal data sent</li>
            </ul>
            <p>We do not share your data with any other third parties.</p>
          </Section>

          <Section title="5. Data Storage and Transfers">
            <p>Your data is stored on servers in the United States via Supabase (hosted on Amazon Web Services) and Vercel.</p>
            <p>For users outside the United States:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: C.text }}>Canada:</strong> transfers are governed by PIPEDA. The US provides a comparable level of protection for commercial data under the Canada-US data framework.</li>
              <li><strong style={{ color: C.text }}>EEA and United Kingdom:</strong> we rely on the EU-US Data Privacy Framework and Standard Contractual Clauses (SCCs) approved by the European Commission for EU-US data transfers.</li>
              <li><strong style={{ color: C.text }}>Other jurisdictions:</strong> by using the Service, you consent to the transfer of your data to the United States, where it is protected under the safeguards described in this policy.</li>
            </ul>
            <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</p>
          </Section>

          <Section title="6. Data Retention">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: C.text }}>Waitlist emails:</strong> deleted within 30 days of the launch notification being sent.</li>
              <li><strong style={{ color: C.text }}>Account data:</strong> retained while your account is active. Deleted within 90 days of account closure or deletion request.</li>
              <li><strong style={{ color: C.text }}>Marketplace orders:</strong> retained for 7 years after transaction completion for legal and tax compliance.</li>
              <li><strong style={{ color: C.text }}>Transfer history:</strong> retained while your account is active. Deleted with your account.</li>
              <li><strong style={{ color: C.text }}>Label designs:</strong> retained while your account is active. Public designs that have been forked by others will have your attribution removed upon account deletion, but the forked copies may persist under other users' accounts.</li>
              <li><strong style={{ color: C.text }}>Analytics data:</strong> aggregated and anonymised, retained indefinitely. No personally identifiable information is retained in analytics.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>Regardless of where you live, you can:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request a copy of all personal data we hold about you.</li>
              <li>Correct inaccurate personal data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Withdraw consent for waitlist processing at any time.</li>
              <li>Contact us with any privacy concern.</li>
            </ul>
            <p>To exercise any right, email <a href="mailto:privacy@squirclelabs.uk" style={{ color: C.accent }}>privacy@squirclelabs.uk</a>. We will respond within 30 days.</p>

            <p className="font-semibold mt-4" style={{ color: C.text }}>Additional rights by jurisdiction:</p>

            <p><strong style={{ color: C.text }}>Canada (PIPEDA and British Columbia PIPA):</strong> You have the right to access, correct, and request deletion of your personal information. You may file a complaint with the Office of the Privacy Commissioner of Canada (priv.gc.ca) or the BC Office of the Information and Privacy Commissioner (oipc.bc.ca). We collect, use, and disclose personal information only for purposes a reasonable person would consider appropriate.</p>

            <p><strong style={{ color: C.text }}>European Economic Area and United Kingdom (GDPR and UK GDPR):</strong> Legal bases for processing: consent (waitlist), contract performance (account/service), legitimate interest (analytics). You have the right of access (Art. 15), rectification (Art. 16), erasure (Art. 17, "right to be forgotten"), restriction of processing (Art. 18), data portability (Art. 20, in JSON format), to object (Art. 21), to withdraw consent (Art. 7), and to lodge a complaint with your local Data Protection Authority. We do not have an EU representative at this time. If required by volume of EU users, we will appoint one and update this policy.</p>

            <p><strong style={{ color: C.text }}>United States — California (CCPA/CPRA):</strong> You have the right to know what personal information we collect, use, and disclose. You have the right to request deletion. You have the right to opt out of the sale of personal information — we do not sell personal information. You have the right to non-discrimination. California residents may designate an authorized agent to make requests on their behalf. To make a request: email <a href="mailto:privacy@squirclelabs.uk" style={{ color: C.accent }}>privacy@squirclelabs.uk</a> with the subject "CCPA Request."</p>

            <p><strong style={{ color: C.text }}>Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), and other US state privacy laws:</strong> You have rights to access, correct, delete, and port your personal data. You have the right to opt out of targeted advertising, sale of personal data, and profiling — we do not engage in any of these activities. You may appeal a denied request by emailing <a href="mailto:privacy@squirclelabs.uk" style={{ color: C.accent }}>privacy@squirclelabs.uk</a> with the subject "Privacy Appeal."</p>

            <p><strong style={{ color: C.text }}>Australia (Privacy Act 1988 and APPs):</strong> We comply with the Australian Privacy Principles. You have the right to access and correct your personal information. You may complain to the Office of the Australian Information Commissioner (oaic.gov.au) if you believe we have breached the APPs.</p>

            <p><strong style={{ color: C.text }}>Brazil (LGPD):</strong> Legal bases for processing: consent (waitlist), contract execution (account/service), legitimate interest (analytics). You have the right to access, correct, anonymise, block, or delete unnecessary or excessive data. You have the right to data portability. You may revoke consent at any time. You may file a complaint with the Autoridade Nacional de Proteção de Dados (ANPD).</p>

            <p><strong style={{ color: C.text }}>Japan (APPI):</strong> We handle your personal information in accordance with the Act on the Protection of Personal Information. We do not provide your personal data to third parties without your consent, except as required by law. You have the right to request disclosure, correction, suspension of use, or deletion of your personal data.</p>

            <p><strong style={{ color: C.text }}>South Korea (PIPA):</strong> We process your personal information in accordance with the Personal Information Protection Act. You have the right to access, correct, suspend processing, and request deletion of your personal information.</p>
          </Section>

          <Section title="8. Children's Privacy">
            <p>NetMD Studio is not directed at children under 16. We do not knowingly collect personal information from anyone under 16. If you believe a child has provided us with personal data, contact us and we will delete it.</p>
          </Section>

          <section id="cookies">
            <h2 className="text-lg font-bold mb-3" style={{ color: '#1A1A1A' }}>9. Cookies and Tracking</h2>
            <div className="space-y-3">
              <p>We use a minimal set of first-party cookies. We do not use third-party tracking cookies, advertising pixels, or fingerprinting.</p>
              <p><strong style={{ color: C.text }}>Cookies we use:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong style={{ color: C.text }}>Supabase session tokens</strong> (essential): required for authentication. Set automatically when you sign in. Removed when you sign out.</li>
                <li><strong style={{ color: C.text }}>netmd_consent</strong> (functional): records whether you accepted or declined our cookie notice. Value is "accepted" or "declined." Expires after 1 year. This cookie is set regardless of your choice so we know not to show the banner again.</li>
                <li><strong style={{ color: C.text }}>netmd_waitlist</strong> (functional): set only if you accept cookies and sign up for launch notifications. Value is "subscribed." Expires after 1 year. This lets us show a confirmation message instead of the signup form on return visits. If you decline cookies, the signup still works but this convenience cookie is not set.</li>
              </ul>
              <p>That is the complete list. We set no other cookies and load no third-party scripts that set cookies.</p>
            </div>
          </section>

          <Section title="10. Security">
            <p>We implement industry-standard security measures including TLS 1.3 encryption in transit, AES-256 encryption at rest, Supabase Row Level Security policies restricting data access, Stripe PCI-DSS compliance for payment data, and regular dependency security audits. No system is perfectly secure. If we discover a breach affecting your personal data, we will notify you and relevant authorities within 72 hours as required by GDPR, and as soon as practicable under other applicable laws.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this policy. Material changes will be posted on this page with an updated "Last updated" date. If you have an account, we will notify you by email of material changes. Continued use of the Service after changes constitutes acceptance.</p>
          </Section>

          <Section title="12. Contact">
            <p>For privacy questions, data requests, or complaints:</p>
            <p>Email: <a href="mailto:privacy@squirclelabs.uk" style={{ color: C.accent }}>privacy@squirclelabs.uk</a><br />Squircle Labs<br />Nelson, British Columbia, Canada</p>
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
