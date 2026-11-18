// Serverseitige KI-Analyse für den Beta-Preis-Kalkulator.
// Der API-Key liegt nur in Netlify (Env ANTHROPIC_API_KEY), nie im Browser.

const MODEL = "claude-sonnet-5-5";
const TRANSFORMATIONEN = ["klein", "mittel", "gross"];

function antwort(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req) => {
  if (req.method !== "POST") return antwort(405, { error: "Nur POST" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return antwort(500, { error: "ANTHROPIC_API_KEY fehlt in Netlify" });

  let outcome = "", boni = "";
  try {
    const body = await req.json();
    outcome = String(body.outcome || "").trim().slice(0, 1500);
    boni = String(body.boni || "").trim().slice(0, 1000);
  } catch {
    return antwort(400, { error: "Ungültige Anfrage" });
  }
  if (outcome.length < 6) return antwort(400, { error: "Outcome fehlt" });

  const prompt = `Du bist Preis-Expertin für Online-Programme im deutschsprachigen Markt.

Analysiere diesen Programm-Outcome und beantworte zwei Fragen:

1. B2B oder B2C?
B2B = richtet sich an Selbstständige, Unternehmer, Freelancer, die damit Geld verdienen oder ihr Business voranbringen.
B2C = richtet sich an Privatpersonen für persönliche Ziele, Gesundheit, Lifestyle, Beziehungen, Mindset.

2. Transformationsgröße:
"klein" = Quick Win, konkretes abgegrenztes Ergebnis, schnell erreichbar
"mittel" = Merkliche Veränderung im Alltag, neuer Skill oder neue Gewohnheit
"gross" = Tiefe Transformation, Lebensveränderung, Identitätswechsel

Outcome: ${outcome}
${boni ? `Weitere Leistungen: ${boni}` : ""}

Antworte NUR mit diesem JSON, ohne Markdown, ohne Erklärung davor oder danach:
{"isB2B":true,"transformation":"mittel","zielgruppe_begruendung":"Ein Satz.","transformation_begruendung":"Ein Satz."}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Anthropic-Fehler", res.status, data?.error?.type, data?.error?.message);
      return antwort(502, { error: "KI-Analyse nicht erreichbar" });
    }

    const raw = data.content?.find((b) => b.type === "text")?.text || "";
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const a = JSON.parse(json);

    if (typeof a.isB2B !== "boolean" || !TRANSFORMATIONEN.includes(a.transformation)) {
      console.error("Unerwartete KI-Antwort", raw.slice(0, 300));
      return antwort(502, { error: "KI-Antwort unvollständig" });
    }

    return antwort(200, {
      isB2B: a.isB2B,
      transformation: a.transformation,
      zielgruppe_begruendung: String(a.zielgruppe_begruendung || ""),
      transformation_begruendung: String(a.transformation_begruendung || ""),
    });
  } catch (e) {
    console.error("Analyse fehlgeschlagen", e?.message);
    return antwort(502, { error: "KI-Analyse fehlgeschlagen" });
  }
};
