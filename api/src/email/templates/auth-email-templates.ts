function wrapHtml(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="ru">
  <body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#f4f4f5; padding:24px;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <tr>
        <td>
          <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
          ${bodyHtml}
          <p style="margin-top:32px;font-size:12px;color:#71717a;">Если вы не выполняли это действие, просто проигнорируйте это письмо.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildEmailVerificationEmail(verificationUrl: string) {
  const subject = 'Подтверждение почты DNA';
  const html = wrapHtml(
    subject,
    `<p style="font-size:14px;line-height:1.6;">Подтвердите адрес электронной почты, чтобы завершить регистрацию.</p>
     <p style="text-align:center;margin:24px 0;">
       <a href="${verificationUrl}" style="background:#111827;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:14px;">Подтвердить почту</a>
     </p>
     <p style="font-size:12px;color:#71717a;word-break:break-all;">${verificationUrl}</p>`,
  );
  const text = `Подтвердите адрес электронной почты, перейдя по ссылке: ${verificationUrl}`;

  return { subject, html, text };
}

export function buildPasswordResetEmail(resetUrl: string) {
  const subject = 'Восстановление пароля DNA';
  const html = wrapHtml(
    subject,
    `<p style="font-size:14px;line-height:1.6;">Мы получили запрос на сброс пароля вашей учётной записи.</p>
     <p style="text-align:center;margin:24px 0;">
       <a href="${resetUrl}" style="background:#111827;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-size:14px;">Сбросить пароль</a>
     </p>
     <p style="font-size:12px;color:#71717a;word-break:break-all;">${resetUrl}</p>`,
  );
  const text = `Чтобы сбросить пароль, перейдите по ссылке: ${resetUrl}`;

  return { subject, html, text };
}

export function buildPasswordChangedEmail() {
  const subject = 'Пароль изменён';
  const html = wrapHtml(
    subject,
    `<p style="font-size:14px;line-height:1.6;">Пароль вашей учётной записи DNA был только что изменён. Если это были не вы, срочно свяжитесь с поддержкой.</p>`,
  );
  const text = 'Пароль вашей учётной записи DNA был только что изменён.';

  return { subject, html, text };
}
