import { useState } from "react";

const G = {
  altrosa:   "#bd8892",
  rosa:      "#e5cfd3",
  gruen:     "#1a4535",
  hellGruen: "#4e9c61",
  beige:     "#fef4ee",
  beigeDeep: "#f5e8e0",
  textDark:  "#2a1f1c",
  textMid:   "#5a4540",
  textLight: "#7a6560",
};

const PRICE_POINTS = [97, 147, 197, 247, 297, 347, 397, 447, 497];

const TRANS_FACTORS = { klein: 0.75, mittel: 1.0, gross: 1.35 };
const TRANS_LABELS  = {
  klein: "Quick Win",
  mittel: "Merkliche Veränderung",
  gross: "Tiefe Transformation",
};

function roundNice(raw) {
  const capped = Math.min(raw, 497);
  return PRICE_POINTS.reduce((a, b) => Math.abs(b - capped) < Math.abs(a - capped) ? b : a);
}

function detectBoost(text) {
  if (!text) return { boost: 0, label: "" };
  const t = text.toLowerCase();
  if (t.includes("1:1") || t.includes("einzelcoaching") || t.includes("einzelgespräch"))
    return { boost: 50, label: "+ 50 € für 1:1-Begleitung" };
  if (t.includes("vip") || t.includes("intensiv") || t.includes("premium"))
    return { boost: 40, label: "+ 40 € für Premium-Element" };
  if (t.includes("feedback") || t.includes("review") || t.includes("korrektur"))
    return { boost: 25, label: "+ 25 € für persönliches Feedback" };
  return { boost: 15, label: "+ 15 € für zusätzlichen Bonus" };
}

function fmt(v) {
  return v.toLocaleString("de-DE") + "\u00A0€";
}

async function analyseOutcome(outcome, boni) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Du bist Preis-Expertin für Online-Programme im deutschsprachigen Markt.

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
{"isB2B":true,"transformation":"mittel","zielgruppe_begruendung":"Ein Satz.","transformation_begruendung":"Ein Satz."}`
      }],
    }),
  });
  const data = await res.json();
  const raw = data.content?.[0]?.text || "{}";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Montserrat:wght@400;500;600;700&display=swap');

  .pk * { box-sizing: border-box; margin: 0; padding: 0; }
  .pk { font-family: 'Montserrat', sans-serif; background: #fef4ee; min-height: 100vh; padding: 2.5rem 1.25rem 4rem; }
  .pk-inner { max-width: 560px; margin: 0 auto; }

  .pk-header { text-align: center; margin-bottom: 2rem; }
  .pk-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: #bd8892; margin-bottom: .5rem; }
  .pk-title { font-family: 'Montserrat', sans-serif; font-size: 30px; font-weight: 700; color: #1a4535; line-height: 1.15; }
  .pk-divider { width: 36px; height: 2px; background: #bd8892; margin: .9rem auto; border-radius: 1px; }
  .pk-sub { font-size: 13px; color: #5a4540; line-height: 1.65; max-width: 400px; margin: 0 auto; }

  .pk-card { background: #fff; border-radius: 16px; border: 1px solid #e5cfd3; padding: 1.5rem; margin-bottom: 1rem; }
  .pk-field { margin-bottom: 1.1rem; }
  .pk-field:last-child { margin-bottom: 0; }
  .pk-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #bd8892; margin-bottom: 6px; }
  .pk-hint { font-size: 11px; color: #7a6560; margin-top: 5px; line-height: 1.5; }

  .pk-input-wrap { position: relative; }
  .pk-num { width: 100%; padding: 13px 58px 13px 14px; border: 1.5px solid #e5cfd3; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 500; color: #2a1f1c; background: #fef4ee; outline: none; transition: border-color .2s, box-shadow .2s; -moz-appearance: textfield; appearance: textfield; }
  .pk-num::-webkit-inner-spin-button, .pk-num::-webkit-outer-spin-button { -webkit-appearance: none; }
  .pk-num:focus { border-color: #bd8892; background: #fff; box-shadow: 0 0 0 3px rgba(229,207,211,.45); }
  .pk-unit { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); font-size: 10px; font-weight: 700; color: #bd8892; text-transform: uppercase; letter-spacing: .05em; pointer-events: none; }

  .pk-textarea { width: 100%; padding: 13px 14px; border: 1.5px solid #e5cfd3; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 13.5px; color: #2a1f1c; background: #fef4ee; outline: none; resize: none; line-height: 1.55; transition: border-color .2s, box-shadow .2s; }
  .pk-textarea:focus { border-color: #bd8892; background: #fff; box-shadow: 0 0 0 3px rgba(229,207,211,.45); }
  .pk-textarea::placeholder { color: #b5a5a0; }

  .pk-extras-card { background: #f5e8e0; border-radius: 16px; border: 1.5px dashed #bd8892; padding: 1.5rem; margin-bottom: 1rem; }
  .pk-extras-badge { display: inline-block; background: #bd8892; color: #fff; font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; margin-bottom: 10px; }

  .pk-btn { width: 100%; padding: 15px; background: #1a4535; color: #fff; border: none; border-radius: 10px; font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; cursor: pointer; transition: background .2s, transform .1s; margin-top: .75rem; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .pk-btn:hover:not(:disabled) { background: #1f5540; }
  .pk-btn:active:not(:disabled) { transform: scale(.985); }
  .pk-btn:disabled { background: #c5b8b4; cursor: default; }

  .pk-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .pk-result { opacity: 0; transform: translateY(12px); transition: opacity .5s ease, transform .5s ease; margin-top: 1.25rem; }
  .pk-result.in { opacity: 1; transform: translateY(0); }

  .pk-hero { background: #1a4535; border-radius: 16px; padding: 2rem 1.5rem; text-align: center; margin-bottom: 1rem; position: relative; overflow: hidden; }
  .pk-hero::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; border-radius: 50%; background: rgba(189,136,146,.12); }
  .pk-hero-label { font-size: 10px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #e5cfd3; margin-bottom: .5rem; }
  .pk-hero-price { font-family: 'Cormorant Garamond', serif; font-size: 58px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: .3rem; }
  .pk-hero-sub { font-size: 11px; color: rgba(229,207,211,.8); }
  .pk-hero-vollpreis { margin-top: .8rem; display: inline-block; background: rgba(255,255,255,.1); border: 1px solid rgba(229,207,211,.3); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 600; color: #e5cfd3; }

  .pk-analysis { background: #fff; border-radius: 12px; border: 1px solid #e5cfd3; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .pk-analysis-title { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #bd8892; margin-bottom: 10px; }
  .pk-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .pk-tag { padding: 5px 13px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .pk-tag-b2b { background: #bd8892; color: #fff; }
  .pk-tag-b2c { background: #e5cfd3; color: #1a4535; }
  .pk-tag-trans { background: #1a4535; color: #fff; }
  .pk-a-row { font-size: 12px; color: #5a4540; line-height: 1.55; margin-bottom: 5px; }
  .pk-a-row:last-child { margin-bottom: 0; }
  .pk-a-row b { color: #2a1f1c; font-weight: 600; }

  .pk-outcome-box { background: #fff; border-radius: 12px; border-left: 3px solid #bd8892; border-top: 1px solid #e5cfd3; border-right: 1px solid #e5cfd3; border-bottom: 1px solid #e5cfd3; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .pk-outcome-label { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #bd8892; margin-bottom: 5px; }
  .pk-outcome-text { font-size: 13.5px; font-weight: 500; color: #1a4535; line-height: 1.55; font-style: italic; }

  .pk-extras-display { background: #f5e8e0; border-radius: 12px; border-left: 3px solid #4e9c61; border-top: 1px solid rgba(78,156,97,.25); border-right: 1px solid rgba(78,156,97,.25); border-bottom: 1px solid rgba(78,156,97,.25); padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .pk-extras-label { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #4e9c61; margin-bottom: 5px; }
  .pk-extras-text { font-size: 13px; color: #2a5040; line-height: 1.55; }
  .pk-extras-boost { font-size: 11px; font-weight: 600; color: #4e9c61; margin-top: 6px; }

  .pk-section-title { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #bd8892; margin-bottom: .75rem; }

  .pk-rev-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 1rem; }
  .pk-rev { border-radius: 12px; padding: 1rem .75rem; text-align: center; }
  .pk-rev.k { background: #f5e8e0; } .pk-rev.r { background: #e5cfd3; } .pk-rev.o { background: #1a4535; }
  .pk-rev-lbl { font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 5px; }
  .k .pk-rev-lbl { color: #bd8892; } .r .pk-rev-lbl { color: #1a4535; } .o .pk-rev-lbl { color: #e5cfd3; }
  .pk-rev-pax { font-size: 11px; margin-bottom: 5px; }
  .k .pk-rev-pax { color: #5a4540; } .r .pk-rev-pax { color: #2a5040; } .o .pk-rev-pax { color: #e5cfd3; }
  .pk-rev-amt { font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 700; line-height: 1.1; }
  .k .pk-rev-amt { color: #2a1f1c; } .r .pk-rev-amt { color: #1a4535; } .o .pk-rev-amt { color: #fff; }

  .pk-breakdown { background: #fff; border-radius: 12px; border: 1px solid #e5cfd3; padding: 1rem 1.25rem; }
  .pk-breakdown-title { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #bd8892; margin-bottom: 10px; }
  .pk-brow { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid rgba(229,207,211,.5); font-size: 12px; }
  .pk-brow:last-child { border-bottom: none; }
  .pk-bk { color: #7a6560; } .pk-bv { font-weight: 600; color: #1a4535; }
  .pk-btotal { display: flex; justify-content: space-between; align-items: center; padding: 10px 0 0; border-top: 1.5px solid #e5cfd3; margin-top: 4px; }
  .pk-btk { font-weight: 600; color: #1a4535; font-size: 13px; }
  .pk-btv { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; color: #1a4535; }

  .pk-note { font-size: 11px; color: #7a6560; text-align: center; margin-top: 1.25rem; line-height: 1.7; }
  .pk-error { background: #fff0f0; border: 1px solid #f5c5c5; border-radius: 10px; padding: .85rem 1rem; margin-top: .75rem; font-size: 12px; color: #8b2020; }

  .pk-pill-group { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
  .pk-pill { padding: 9px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1.5px solid #e5cfd3; background: #fef4ee; color: #5a4540; cursor: pointer; transition: all .15s; line-height: 1; font-family: 'Montserrat', sans-serif; }
  .pk-pill:hover { border-color: #bd8892; color: #bd8892; }
  .pk-pill.active { background: #1a4535; border-color: #1a4535; color: #fff; }

  .pk-summary { background: #fff; border-radius: 12px; border: 1px solid #e5cfd3; padding: 1rem 1.25rem; }
  .pk-summary-title { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #bd8892; margin-bottom: 8px; }
  .pk-summary-text { font-size: 13px; color: #2a1f1c; line-height: 1.65; }
`;

export default function BetaPreisKalkulator() {
  const [wochen,     setWochen]     = useState("");
  const [sessions,   setSessions]   = useState("");
  const [outcome,    setOutcome]    = useState("");
  const [extras,     setExtras]     = useState("");
  const [umfrage,    setUmfrage]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [result,     setResult]     = useState(null);
  const [visible,    setVisible]    = useState(false);

  const canCalc =
    (parseInt(wochen) || 0) > 0 &&
    (parseInt(sessions) || 0) > 0 &&
    outcome.trim().length > 5 &&
    (parseInt(umfrage) || 0) > 0;

  async function berechnen() {
    const w = Math.max(1, parseInt(wochen) || 1);
    const s = Math.max(1, parseInt(sessions) || 1);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const analysis = await analyseOutcome(outcome.trim(), extras.trim());
      const { isB2B, transformation, zielgruppe_begruendung, transformation_begruendung } = analysis;

      const u = parseInt(umfrage) || 0;
      const reichweite = u < 10 ? "wenig" : u <= 30 ? "mittel" : "viel";
      const reichweiteLabels = {
        wenig:  `${u} Umfrage-Teilnehmer (wenig Interesse)`,
        mittel: `${u} Umfrage-Teilnehmer (mittleres Interesse)`,
        viel:   `${u} Umfrage-Teilnehmer (hohes Interesse)`,
      };

      const hasExtras   = extras.trim().length > 0;
      const extrasLower = extras.toLowerCase();
      const has1to1     = extrasLower.includes("1:1") || extrasLower.includes("einzelcoaching") || extrasLower.includes("einzelgespräch");
      const multi1to1   = has1to1 && /([2-9]|[1-9]\d+)\s*(x|mal|×)?\s*1:1|1:1.{0,10}([2-9]|[1-9]\d+)\s*(x|mal|session|call)/i.test(extras);

      const transFactor      = TRANS_FACTORS[transformation] ?? 1.0;
      const reichweiteFactor = { wenig: 0.6, mittel: 1.0, viel: 1.3 }[reichweite];
      const laengeFactor     = w <= 4 ? 0.8 : w <= 6 ? 1.0 : w <= 8 ? 1.15 : 1.3;
      const b2bFactor        = isB2B ? 1.4 : 1.0;

      // Alle Faktoren fließen in Rohpreis → dann harter Cap
      const rawBeta = (60 + w * 6 + s * 10) * transFactor * reichweiteFactor * laengeFactor * b2bFactor;
      const capsB2C = { wenig: 97, mittel: 197, viel: 297 };
      const capsB2B = { wenig: 247, mittel: 347, viel: 497 };
      const caps    = isB2B ? capsB2B : capsB2C;
      const baseCapped = Math.min(roundNice(rawBeta), caps[reichweite]);

      // Nur 1:1 darf den Cap überschreiten
      const boniFactor  = has1to1 ? (multi1to1 ? 1.5 : 1.3) : 1.0;
      const maxWithBoni = isB2B ? 497 : 397;
      const betaPreis   = has1to1
        ? Math.min(roundNice(baseCapped * boniFactor), maxWithBoni)
        : baseCapped;
      const vollpreis   = betaPreis * 2;

      const reichweiteLabel = reichweiteLabels[reichweite];
      const transLabel      = TRANS_LABELS[transformation];
      const zielgruppeLabel = isB2B ? "B2B (Selbstständige/Unternehmer)" : "B2C (Privatpersonen)";

      const summaryText = `${w}-wöchiges Programm mit ${s} Live-Sessions für eine ${zielgruppeLabel}-Zielgruppe. Die Transformation wird als "${transLabel}" eingestuft. Du hast ${reichweiteLabel} – das beeinflusst, wie viel Nachfrage realistisch ist und was der Markt bereit ist zu zahlen.${has1to1 ? " Die 1:1-Begleitung erhöht den Wert deutlich." : hasExtras ? " Zusätzliche Boni erhöhen den wahrgenommenen Wert." : ""} Als Beta-Preis empfehle ich 50\u00A0% deines späteren Vollpreises.`;

      setResult({
        betaPreis, vollpreis,
        wochen: w, sessions: s,
        outcome: outcome.trim(),
        isB2B, transformation, transFactor, b2bFactor,
        zielgruppe_begruendung, transformation_begruendung,
        reichweiteLabel, summaryText,
      });
      setVisible(false);
      setTimeout(() => setVisible(true), 60);
    } catch {
      setError("Analyse fehlgeschlagen. Bitte Outcome-Text prüfen und nochmal versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="pk">
        <div className="pk-inner">
        <div className="pk-header">
          <p className="pk-eyebrow">Launch Sisters · Beta-Programm</p>
          <h1 className="pk-title">Preis-Kalkulator</h1>
          <div className="pk-divider" />
          <p className="pk-sub">
            Beschreibe deinen Outcome. B2B/B2C und Transformationsgröße werden automatisch analysiert.
          </p>
        </div>

        <div className="pk-card">
          <div className="pk-field">
            <label className="pk-label" htmlFor="wochen">Kursdauer</label>
            <div className="pk-input-wrap">
              <input id="wochen" className="pk-num" type="number" min="1"
                placeholder="z. B. 8" value={wochen} onChange={e => setWochen(e.target.value)} />
              <span className="pk-unit">Wochen</span>
            </div>
            <p className="pk-hint">Wie viele Wochen begleitest du deine Teilnehmerinnen?</p>
          </div>

          <div className="pk-field">
            <label className="pk-label" htmlFor="sessions">Anzahl Live-Sessions</label>
            <div className="pk-input-wrap">
              <input id="sessions" className="pk-num" type="number" min="1"
                placeholder="z. B. 6" value={sessions} onChange={e => setSessions(e.target.value)} />
              <span className="pk-unit">Sessions</span>
            </div>
            <p className="pk-hint">Alle Live-Calls, die du im Programm hältst</p>
          </div>

          <div className="pk-field" style={{ marginBottom: 0 }}>
            <label className="pk-label" htmlFor="outcome">Outcome des Programms</label>
            <textarea id="outcome" className="pk-textarea" rows="3"
              placeholder="z. B. Meine Teilnehmerinnen erstellen ihr erstes digitales Angebot und gewinnen ihre ersten 3 Kundinnen in 8 Wochen."
              value={outcome} onChange={e => setOutcome(e.target.value)} />
            <p className="pk-hint">Das konkrete Ergebnis, das deine Teilnehmerinnen erreichen. B2B/B2C und Transformationsgröße werden daraus automatisch abgeleitet.</p>
          </div>
        </div>

        <div className="pk-card">
          <div className="pk-field" style={{ marginBottom: 0 }}>
            <label className="pk-label" htmlFor="umfrage">Zielgruppenumfrage: Wie viele haben teilgenommen?</label>
            <div className="pk-input-wrap">
              <input id="umfrage" className="pk-num" type="number" min="0"
                placeholder="z. B. 25"
                value={umfrage} onChange={e => setUmfrage(e.target.value)} />
              <span className="pk-unit">Personen</span>
            </div>
            <p className="pk-hint">
              {(() => {
                const u = parseInt(umfrage) || 0;
                if (!umfrage) return "Daraus leiten wir ab, wie groß das Interesse an deinem Thema ist.";
                if (u < 10)  return `${u} Teilnehmer → wenig Interesse. Der Preis liegt eher im unteren Bereich.`;
                if (u <= 30) return `${u} Teilnehmer → mittleres Interesse. Solide Basis für ein Beta.`;
                return `${u} Teilnehmer → hohes Interesse. Du kannst den Preis höher ansetzen.`;
              })()}
            </p>
          </div>
        </div>

        <div className="pk-extras-card">
          <span className="pk-extras-badge">Optional · beeinflusst den Preis</span>
          <div className="pk-field" style={{ marginBottom: 0 }}>
            <label className="pk-label" htmlFor="extras">Gibt es weitere Boni?</label>
            <textarea id="extras" className="pk-textarea" rows="2"
              placeholder="z. B. 1:1-Session mit mir, Feedback auf ihre Texte, Vorlagen-Paket..."
              value={extras} onChange={e => setExtras(e.target.value)} />
            <p className="pk-hint">Zusätzliche Leistungen wie 1:1-Calls, Feedback, Vorlagen oder Workbooks</p>
          </div>
        </div>

        <button className="pk-btn" onClick={berechnen} disabled={!canCalc || loading}>
          {loading && <span className="pk-spinner" />}
          {loading ? "Analyse läuft..." : "Preis berechnen →"}
        </button>

        {error && <div className="pk-error">{error}</div>}

        {result && (
          <div className={`pk-result${visible ? " in" : ""}`}>
            <div className="pk-hero">
              <p className="pk-hero-label">Empfohlener Beta-Preis</p>
              <p className="pk-hero-price">{fmt(result.betaPreis)}</p>
              <p className="pk-hero-sub">Beta-Preis · Live-Programm · limitierte Plätze</p>
            </div>

            <div className="pk-analysis">
              <p className="pk-analysis-title">KI-Einschätzung</p>
              <div className="pk-tags">
                <span className={`pk-tag ${result.isB2B ? "pk-tag-b2b" : "pk-tag-b2c"}`}>
                  {result.isB2B ? "B2B" : "B2C"}
                </span>
                <span className="pk-tag pk-tag-trans">
                  {TRANS_LABELS[result.transformation]}
                </span>
              </div>
              <p className="pk-a-row"><b>Zielgruppe:</b> {result.zielgruppe_begruendung}</p>
              <p className="pk-a-row"><b>Transformation:</b> {result.transformation_begruendung}</p>
            </div>

            {result.outcome && (
              <div className="pk-outcome-box">
                <p className="pk-outcome-label">Das verkaufst du</p>
                <p className="pk-outcome-text">&bdquo;{result.outcome}&ldquo;</p>
              </div>
            )}

            <p className="pk-section-title">Revenue-Prognose für dein Beta</p>
            <div className="pk-rev-grid">
              <div className="pk-rev k">
                <p className="pk-rev-lbl">Minimum</p>
                <p className="pk-rev-pax">4 Teilnehmerinnen</p>
                <p className="pk-rev-amt">{fmt(result.betaPreis * 4)}</p>
              </div>
              <div className="pk-rev r">
                <p className="pk-rev-lbl">Empfohlen</p>
                <p className="pk-rev-pax">6 Teilnehmerinnen</p>
                <p className="pk-rev-amt">{fmt(result.betaPreis * 6)}</p>
              </div>
              <div className="pk-rev o">
                <p className="pk-rev-lbl">Maximum</p>
                <p className="pk-rev-pax">8 Teilnehmerinnen</p>
                <p className="pk-rev-amt">{fmt(result.betaPreis * 8)}</p>
              </div>
            </div>

            <div className="pk-summary">
              <p className="pk-summary-title">Warum dieser Preis?</p>
              <p className="pk-summary-text">{result.summaryText}</p>
            </div>

            <p className="pk-note">
              Für die erste Beta-Runde empfehle ich 4–8 Teilnehmerinnen.
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
