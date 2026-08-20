# Delivery pickup: следующий подэтап

ПВЗ намеренно не входят в первый checkout-релиз. `YANDEX_RUSSIA_PICKUP`
остаётся в backend-справочнике, но pickup quotes не публикуются покупателю до
появления полного пользовательского сценария.

Обязательные задачи следующего этапа:

1. Provider-neutral endpoint определения локации через Yandex Russia
   `location/detect`.
2. Provider-neutral endpoint списка ПВЗ через `pickup-points/list`.
3. Нормализованный публичный DTO ПВЗ без provider payload и секретов.
4. Map/list UI с поиском и доступностью выбранной точки.
5. Сохранение `externalPickupPointId` в destination заказа.
6. Новый quote после каждого изменения ПВЗ.
7. Привязка selection к destination version и выбранному ПВЗ.
8. Восстановление выбранного ПВЗ при повторном открытии checkout.
9. Отдельные mock, sandbox contract и production quote-only тесты.

Хардкодить production ПВЗ или показывать `mock-pvz-1` в checkout запрещено.
