const colors = {
  background: '#fcfcff',
  border: '#e4e4e7',
  foreground: '#252529',
  mutedForeground: '#71717a',
  primary: '#291b87',
  primaryForeground: '#ffffff',
};

function actionButton(url: string, label: string): string {
  return `
    <table
      role="presentation"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="margin: 24px 0;"
    >
      <tr>
        <td
          bgcolor="${colors.primary}"
          style="border-radius: 8px;"
        >
          <a
            href="${url}"
            style="
              display: inline-block;
              padding: 10px 20px;
              color: ${colors.primaryForeground};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              font-size: 14px;
              font-weight: 500;
              line-height: 20px;
              text-decoration: none;
              border-radius: 8px;
            "
          >
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function fallbackLink(url: string): string {
  return `
    <p
      style="
        margin: 0;
        font-size: 12px;
        line-height: 18px;
        color: ${colors.mutedForeground};
      "
    >
      Если кнопка не работает, скопируйте ссылку в адресную строку браузера:
    </p>

    <p
      style="
        margin: 6px 0 0;
        font-size: 12px;
        line-height: 18px;
        word-break: break-all;
      "
    >
      <a
        href="${url}"
        style="
          color: ${colors.primary};
          text-decoration: underline;
        "
      >
        ${url}
      </a>
    </p>
  `;
}

function wrapHtml(title: string, bodyHtml: string): string {
  return `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>${title}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: ${colors.background};
          color: ${colors.foreground};
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background: ${colors.background};
          "
        >
          <tr>
            <td
              align="center"
              style="padding: 32px 16px;"
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width: 100%;
                  max-width: 520px;
                  background: #ffffff;
                  border: 1px solid ${colors.border};
                  border-radius: 16px;
                "
              >
                <tr>
                  <td style="padding: 32px;">
                    <p
                      style="
                        margin: 0 0 12px;
                        font-size: 13px;
                        font-weight: 600;
                        line-height: 18px;
                        letter-spacing: 0.04em;
                        color: ${colors.primary};
                        text-transform: uppercase;
                      "
                    >
                      DNA
                    </p>

                    <h1
                      style="
                        margin: 0 0 16px;
                        font-size: 24px;
                        font-weight: 600;
                        line-height: 32px;
                        color: ${colors.foreground};
                      "
                    >
                      ${title}
                    </h1>

                    ${bodyHtml}

                    <p
                      style="
                        margin: 32px 0 0;
                        padding-top: 20px;
                        border-top: 1px solid ${colors.border};
                        font-size: 12px;
                        line-height: 18px;
                        color: ${colors.mutedForeground};
                      "
                    >
                      Если вы не выполняли это действие, просто проигнорируйте
                      это письмо.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function buildEmailVerificationEmail(verificationUrl: string) {
  const subject = 'Подтверждение почты DNA';

  const html = wrapHtml(
    subject,
    `
      <p
        style="
          margin: 0;
          font-size: 15px;
          line-height: 24px;
          color: ${colors.foreground};
        "
      >
        Подтвердите адрес электронной почты, чтобы завершить регистрацию.
      </p>

      ${actionButton(verificationUrl, 'Подтвердить почту')}
      ${fallbackLink(verificationUrl)}
    `,
  );

  const text =
    `Подтвердите адрес электронной почты, перейдя по ссылке: ` +
    verificationUrl;

  return {
    subject,
    html,
    text,
  };
}

export function buildOtpCodeEmail(code: string, expiresInSeconds: number) {
  const subject = 'Код подтверждения DNA';
  const expiresInMinutes = Math.max(1, Math.ceil(expiresInSeconds / 60));
  const html = wrapHtml(
    subject,
    `
      <p style="margin: 0; font-size: 15px; line-height: 24px; color: ${colors.foreground};">
        Введите этот код, чтобы продолжить вход или регистрацию:
      </p>
      <p style="margin: 24px 0; font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: 0.18em; color: ${colors.primary};">
        ${code}
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 20px; color: ${colors.mutedForeground};">
        Код действует ${expiresInMinutes} мин.
      </p>
    `,
  );
  const text = `Код подтверждения DNA: ${code}. Код действует ${expiresInMinutes} мин.`;

  return { subject, html, text };
}

export function buildPasswordResetEmail(resetUrl: string) {
  const subject = 'Восстановление пароля DNA';

  const html = wrapHtml(
    subject,
    `
      <p
        style="
          margin: 0;
          font-size: 15px;
          line-height: 24px;
          color: ${colors.foreground};
        "
      >
        Мы получили запрос на сброс пароля вашей учётной записи.
      </p>

      ${actionButton(resetUrl, 'Сбросить пароль')}
      ${fallbackLink(resetUrl)}
    `,
  );

  const text = `Чтобы сбросить пароль, перейдите по ссылке: ${resetUrl}`;

  return {
    subject,
    html,
    text,
  };
}

export function buildPasswordChangedEmail() {
  const subject = 'Пароль изменён';

  const html = wrapHtml(
    subject,
    `
      <p
        style="
          margin: 0;
          font-size: 15px;
          line-height: 24px;
          color: ${colors.foreground};
        "
      >
        Пароль вашей учётной записи DNA был только что изменён. Если это были
        не вы, срочно свяжитесь с поддержкой.
      </p>
    `,
  );

  const text = 'Пароль вашей учётной записи DNA был только что изменён.';

  return {
    subject,
    html,
    text,
  };
}
