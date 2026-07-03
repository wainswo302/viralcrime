import { listCases } from "@/lib/api";
import { CaseThumb } from "@/components/CaseThumb";

export default async function Home() {
  const cases = await listCases();
  return (
    <main className="wrap wrap--wide">
      <p className="eyebrow">Public-record truth engine</p>
      <h1 className="headline">Crime, tracked to its verified ending.</h1>
      <p className="lede">
        Incidents followed from the viral moment through to court disposition and
        video authenticity — with every claim sourced.
      </p>
      {cases.length === 0 ? (
        <p className="dateline">No published cases yet.</p>
      ) : (
        <div className="thumb-grid">
          {cases.map((c) => <CaseThumb key={c.slug} c={c} />)}
        </div>
      )}
    </main>
  );
}
