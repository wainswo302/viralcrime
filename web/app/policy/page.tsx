import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial, disclosure & corrections policy | ViralCrime",
  description: "How we source, how we handle names, and how to request a correction.",
  alternates: { canonical: "/policy" }
};

export default function Policy() {
  return (
    <main className="wrap prose">
      <p className="eyebrow">Trust</p>
      <h1 className="headline">Editorial, disclosure &amp; corrections</h1>

      <p>We track crime-related incidents that appear in official public records and
        circulate on social media, from the moment they surface through to verified
        resolution. We are an editorial publication built on primary sources — not a
        tip line, a crowd-investigation forum, or a place to identify people the
        authorities have not.</p>

      <h2>How we source</h2>
      <p>Every factual claim links to a primary source — an official police or court
        record, or established coverage. If we cannot source a claim, we do not publish
        it. Contested or unconfirmed claims are labeled as unverified rather than asserted.</p>

      <h2>How we handle names</h2>
      <p>This is enforced in our publishing system, not left to individual judgment. We
        do not name private individuals in connection with an alleged crime; incident
        pages describe the event. A person is named only when they are a defendant of
        record in a charged or adjudicated matter, that matter is documented in official
        records and covered by established outlets, and we hold at least two independent
        primary sources. Otherwise the name does not appear anywhere on the page.</p>

      <h2>Presumption of innocence</h2>
      <p>A charge is not a conviction. Pages involving a person facing charges state the
        current legal status plainly, and we revise them as matters resolve.</p>

      <h2>Video verification</h2>
      <p>For viral footage we publish a status — authentic, miscaptioned, recirculated,
        staged, AI-generated, or unverified — established through source contact,
        geolocation, and metadata. We embed original posts using each platform's native
        tools and never rehost anyone's media.</p>

      <h2>Corrections, removal &amp; expungement</h2>
      <p>We correct errors promptly and visibly. When a matter is resolved in a person's
        favor, or a record is expunged, we update or remove the page and remove it from
        search indexing. To request a correction or review, email
        corrections@viralcrime.example.</p>
    </main>
  );
}
