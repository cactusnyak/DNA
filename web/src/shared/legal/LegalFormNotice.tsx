import { Link } from 'react-router-dom';

type LegalFormNoticeProps = {
  kind?: 'personal-data' | 'order' | 'publication';
};

const linkClassName = 'font-medium text-foreground underline underline-offset-2';

export function LegalFormNotice({ kind = 'personal-data' }: LegalFormNoticeProps) {
  if (kind === 'order') {
    return <p className="text-xs leading-5 text-muted-foreground">Нажимая «Оплатить заказ», пользователь принимает условия <Link className={linkClassName} to="/public-offer">Публичной оферты</Link> и подтверждает ознакомление с <Link className={linkClassName} to="/returns">Правилами возврата</Link>.</p>;
  }

  if (kind === 'publication') {
    return <p className="text-xs leading-5 text-muted-foreground">Публикуя объявление, пользователь подтверждает <Link className={linkClassName} to="/personal-data-publication-consent">согласие на распространение выбранных публичных контактов</Link>.</p>;
  }

  return <p className="text-xs leading-5 text-muted-foreground">Нажимая «Продолжить», пользователь даёт <Link className={linkClassName} to="/personal-data-consent">согласие на обработку персональных данных</Link> и подтверждает ознакомление с <Link className={linkClassName} to="/privacy-policy">Политикой обработки персональных данных</Link>.</p>;
}

