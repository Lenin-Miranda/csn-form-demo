export interface MailTemplateResult {
  subject: string;
  text: string;
  html: string;
}

interface RenderSubmissionEmailOptions {
  lang: 'en' | 'es';
  preheader: string;
  eyebrow: string;
  sectionLabel: string;
  title: string;
  intro: string;
  detailLabel: string;
  detailValue: string;
  note: string;
  closing: string;
  footer: string;
}

const BRAND = {
  navy: '#003087',
  navyDark: '#001f5b',
  gold: '#ffb81c',
  goldDark: '#d49b10',
  surface: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#dbe4f0',
  white: '#ffffff',
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderSubmissionConfirmationShell(
  options: RenderSubmissionEmailOptions,
): string {
  const preheader = escapeHtml(options.preheader);
  const eyebrow = escapeHtml(options.eyebrow);
  const sectionLabel = escapeHtml(options.sectionLabel);
  const title = escapeHtml(options.title);
  const intro = escapeHtml(options.intro);
  const detailLabel = escapeHtml(options.detailLabel);
  const detailValue = escapeHtml(options.detailValue);
  const note = escapeHtml(options.note);
  const closing = escapeHtml(options.closing);
  const footer = escapeHtml(options.footer);

  return `<!DOCTYPE html>
<html lang="${options.lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.navy}; font-family:Arial, Helvetica, sans-serif; color:${BRAND.text};">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
      ${preheader}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.navy}; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;">
            <tr>
              <td align="center" style="padding:0 0 18px;">
                <div style="font-size:12px; font-weight:700; letter-spacing:0.28em; text-transform:uppercase; color:${BRAND.gold};">
                  ${eyebrow}
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:${BRAND.white}; border-radius:24px; overflow:hidden; box-shadow:0 18px 48px rgba(0, 16, 47, 0.22);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="height:8px; background:${BRAND.gold}; font-size:0; line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:36px 40px 18px;">
                      <div style="font-size:12px; font-weight:700; letter-spacing:0.24em; text-transform:uppercase; color:${BRAND.goldDark}; margin-bottom:18px;">
                        ${sectionLabel}
                      </div>
                      <h1 style="margin:0; font-size:34px; line-height:1.16; font-weight:700; color:${BRAND.navy};">
                        ${title}
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 40px 8px;">
                      <p style="margin:0; font-size:16px; line-height:1.75; color:${BRAND.textMuted};">
                        ${intro}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 40px 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.surface}; border:1px solid ${BRAND.border}; border-radius:18px;">
                        <tr>
                          <td style="padding:18px 20px;">
                            <div style="font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:${BRAND.goldDark}; margin-bottom:8px;">
                              ${detailLabel}
                            </div>
                            <div style="font-size:18px; line-height:1.5; font-weight:700; color:${BRAND.navyDark};">
                              ${detailValue}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 40px 0;">
                      <p style="margin:0; font-size:15px; line-height:1.8; color:${BRAND.text};">
                        ${note}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px 32px;">
                      <p style="margin:0; font-size:15px; line-height:1.8; color:${BRAND.text};">
                        ${closing}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 40px 24px; border-top:1px solid ${BRAND.border};">
                      <p style="margin:0; font-size:12px; line-height:1.7; color:${BRAND.textMuted};">
                        ${footer}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
