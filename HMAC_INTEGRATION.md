# NEXORA COMMAND · META-BOT NODE

## التشغيل

```bash
cd backend
cp .env.example .env
npm ci
npm start
```

يفتح الخادم لوحة الإدارة على `http://localhost:8787` ويشغّل Bridge API على المنفذ نفسه. في الإنتاج يجب ضبط `NODE_ENV=production` و`CONTROL_API_KEY` و`NEXORA_KEYS_JSON`، وعدم استخدام المفتاح التجريبي.

## بروتوكول HMAC

تستخدم محطات NEXORA الترويسات التالية:

- `x-nexora-key`: معرّف المفتاح.
- `x-nexora-timestamp`: وقت Unix بالثواني.
- `x-nexora-signature`: القيمة `sha256=` متبوعة ببصمة HMAC-SHA256.

التوقيع هو:

```text
HMAC-SHA256(secret, timestamp + "." + rawRequestBody)
```

تقبل الخدمة الطابع الزمني ضمن نافذة `HMAC_CLOCK_SKEW_SECONDS`، وقيمتها الافتراضية 300 ثانية. يجب توقيع **النص الخام لجسم الطلب** قبل تحويله إلى JSON.

## إعداد المفاتيح

ضع مصفوفة المفاتيح في متغير البيئة `NEXORA_KEYS_JSON` ولا تضعها في Git:

```json
[{"name":"production-terminal","id":"key_live_01","secret":"ضع-سرًا-طويلًا-هنا","status":"active"}]
```

يمكن إنشاء مفتاح من لوحة الإدارة عبر `POST /api/control/keys`، ويظهر السر مرة واحدة في الاستجابة. بعد ذلك خزّنه في مدير أسرار، لا في الواجهة.

## مسارات الطرفية

- `POST /api/terminal/heartbeat` لتسجيل نبض المحطة وتحديث حالتها.
- `POST /api/terminal/event` لتسجيل حدث طرفي وإضافة الأحداث المتوسطة أو العالية إلى سجل الأمان.

## مسارات لوحة التحكم

- `GET /api/control/overview`
- `GET /api/control/devices`
- `GET /api/control/requests`
- `GET /api/control/security`
- `GET /api/control/keys`
- `POST /api/control/keys`
- `POST /api/control/keys/:id/disable`

إذا تم ضبط `CONTROL_API_KEY`، أرسل القيمة في `x-control-key` أو `Authorization: Bearer ...` مع طلبات الإدارة.

## ملاحظات الإنتاج

التخزين الحالي داخل الذاكرة ومناسب للنموذج الأولي أو عقدة واحدة. قبل التوسع يجب استبدال `control-store.js` بقاعدة بيانات، وإضافة تسجيل دخول وصلاحيات للمديرين، ووضع الخادم خلف HTTPS وreverse proxy ومحدد معدل للطلبات.
