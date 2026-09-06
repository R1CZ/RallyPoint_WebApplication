/* ------------------------------------------------------------------
   LIVE CODE DELIVERY
   Sends the 6-digit verification code through real channels:
   - Email  → EmailJS (client-side email service)
   - Phone  → Twilio-compatible REST endpoint
   Credentials are optional. When a channel is not configured the
   system falls back to a clearly-labeled sandbox channel so the
   flow always works in preview, while configured channels always
   attempt a real send first.
   ------------------------------------------------------------------ */
import emailjs from "@emailjs/browser";

export interface DeliveryConfig {
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
  smsEndpoint: string; // Twilio-compatible: POST { to, body } → expects 2xx
  smsToken: string;
  smsFrom: string;
}

const CFG_KEY = "rp_delivery_cfg";

export const loadDeliveryConfig = (): DeliveryConfig => {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (raw) return { ...emptyConfig(), ...JSON.parse(raw) };
  } catch {
    /* ignore corrupted config */
  }
  return emptyConfig();
};

const emptyConfig = (): DeliveryConfig => ({
  emailjsServiceId: "",
  emailjsTemplateId: "",
  emailjsPublicKey: "",
  smsEndpoint: "",
  smsToken: "",
  smsFrom: "",
});

export const saveDeliveryConfig = (cfg: DeliveryConfig) => {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
};

export const emailConfigured = (cfg: DeliveryConfig) =>
  cfg.emailjsServiceId.trim() !== "" && cfg.emailjsTemplateId.trim() !== "" && cfg.emailjsPublicKey.trim() !== "";

export const smsConfigured = (cfg: DeliveryConfig) => cfg.smsEndpoint.trim() !== "";

export const generateCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export type ChannelResult = {
  ok: boolean;
  live: boolean; // true = real send attempted, false = sandbox fallback
  error?: string;
};

/** Real email send via EmailJS. */
export async function sendCodeToEmail(cfg: DeliveryConfig, to: string, code: string): Promise<ChannelResult> {
  if (!emailConfigured(cfg)) return { ok: true, live: false };
  try {
    await emailjs.send(cfg.emailjsServiceId, cfg.emailjsTemplateId, {
      to_email: to,
      verify_code: code,
      platform: "RallyPoint",
    }, { publicKey: cfg.emailjsPublicKey });
    return { ok: true, live: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Email service error";
    return { ok: false, live: true, error: msg };
  }
}

/** Real SMS send via a Twilio-compatible endpoint. */
export async function sendCodeToPhone(cfg: DeliveryConfig, to: string, code: string): Promise<ChannelResult> {
  if (!smsConfigured(cfg)) return { ok: true, live: false };
  try {
    const res = await fetch(cfg.smsEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(cfg.smsToken ? { Authorization: `Bearer ${cfg.smsToken}` } : {}) },
      body: JSON.stringify({ from: cfg.smsFrom || "RallyPoint", to, body: `RallyPoint verification code: ${code}` }),
    });
    if (!res.ok) throw new Error(`SMS gateway responded ${res.status}`);
    return { ok: true, live: true };
  } catch (e) {
    return { ok: false, live: true, error: e instanceof Error ? e.message : "SMS gateway unreachable" };
  }
}

/** Fire both channels in parallel and report per-channel results. */
export async function deliverCode(
  cfg: DeliveryConfig,
  email: string,
  phone: string,
  code: string,
): Promise<{ email: ChannelResult; phone: ChannelResult }> {
  const [emailRes, phoneRes] = await Promise.all([
    sendCodeToEmail(cfg, email, code),
    sendCodeToPhone(cfg, phone, code),
  ]);
  return { email: emailRes, phone: phoneRes };
}
