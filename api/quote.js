// BPMOVE – Vercel serverless function
// POST /api/quote -> e-mailt küld a RECIPIENT_EMAIL címre a form adataival
import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- Email template betöltése (cold start-kor egyszer) ----------
// A vercel.json `includeFiles` beállítása gondoskodik róla, hogy az
// email-template.html belekerüljön a deployment bundle-be.
let EMAIL_TEMPLATE = "";
const candidatePaths = [
    path.join(process.cwd(), "email-template.html"),
    path.join(__dirname, "..", "email-template.html"),
    path.join(__dirname, "email-template.html"),
];
for (const p of candidatePaths) {
    try {
        EMAIL_TEMPLATE = fs.readFileSync(p, "utf8");
        break;
    } catch {
        /* keep searching */
    }
}
if (!EMAIL_TEMPLATE) {
    console.warn(
        "⚠️  email-template.html nem található egyik elérési útvonalon sem.",
    );
}

// ---------- Segédfüggvények ----------
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderTemplate(data) {
    if (!EMAIL_TEMPLATE) return JSON.stringify(data, null, 2);
    return EMAIL_TEMPLATE.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, key) => {
        const value = data[key];
        return value === undefined || value === null || value === ""
            ? "&mdash;"
            : escapeHtml(value);
    });
}

function sanitize(str, max = 2000) {
    return typeof str === "string" ? str.trim().slice(0, max) : "";
}

function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// ---------- SMTP transporter ----------
let transporter = null;
function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error(
            "SMTP konfiguráció hiányzik. Állítsd be a SMTP_HOST, SMTP_USER, SMTP_PASS environment változókat a Vercel dashboardon.",
        );
    }

    transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true 465-ös portnál
        auth: { user, pass },
    });

    return transporter;
}

// ---------- Handler ----------
export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const body = req.body || {};
        const data = {
            name: sanitize(body.name, 200),
            phone: sanitize(body.phone, 60),
            email: sanitize(body.email, 200),
            from: sanitize(body.from, 200),
            to: sanitize(body.to, 200),
            type: sanitize(body.type, 100),
            date: sanitize(body.date, 50),
            notes: sanitize(body.notes, 2000),
        };

        if (!data.name || !data.phone) {
            return res
                .status(400)
                .json({ error: "A név és a telefonszám megadása kötelező." });
        }
        if (data.email && !isEmail(data.email)) {
            return res.status(400).json({ error: "Érvénytelen e-mail cím." });
        }

        // Honeypot (anti-spam): ha a "company" mező ki van töltve, bot
        if (typeof body.company === "string" && body.company.length > 0) {
            return res.status(200).json({ ok: true });
        }

        const submittedAt = new Date().toLocaleString("hu-HU", {
            timeZone: "Europe/Budapest",
        });

        const html = renderTemplate({ ...data, submittedAt });
        const text = [
            "Új árajánlatkérés érkezett a BPMOVE oldalon keresztül",
            "",
            `Név: ${data.name}`,
            `Telefon: ${data.phone}`,
            `E-mail: ${data.email || "—"}`,
            `Honnan: ${data.from || "—"}`,
            `Hová: ${data.to || "—"}`,
            `Típus: ${data.type || "—"}`,
            `Tervezett dátum: ${data.date || "—"}`,
            `Megjegyzés: ${data.notes || "—"}`,
            "",
            `Beérkezett: ${submittedAt}`,
        ].join("\n");

        const recipient =
            process.env.RECIPIENT_EMAIL || "adamkocsis28@gmail.com";

        await getTransporter().sendMail({
            from:
                process.env.MAIL_FROM ||
                `"BPMOVE árajánlat" <${process.env.SMTP_USER}>`,
            to: recipient,
            replyTo: data.email || undefined,
            subject: `Új árajánlatkérés – ${data.name}${data.type ? ` (${data.type})` : ""}`,
            html,
            text,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[/api/quote] hiba:", err);
        return res
            .status(500)
            .json({ error: "Az e-mail küldése jelenleg nem sikerült." });
    }
}
