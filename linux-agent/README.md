# NEXORA Linux Agent

هذه حزمة وكيل Linux صغيرة وآمنة لتسجيل جهاز Linux داخل مركز NEXORA عبر `heartbeat` موقّع بـ HMAC-SHA256. الإصدار الأول **heartbeat-only**: لا يستقبل أوامر، ولا ينفذ Shell، ولا يغيّر إعدادات الراوتر، ولا يفتح منفذ استماع.

## المتطلبات

- Linux مع Python 3.9 أو أحدث و`systemd`.
- اتصال HTTPS إلى خدمة NEXORA.
- نفس سر HMAC المهيأ في NEXORA، محفوظًا محليًا فقط في ملف بصلاحيات مقيدة.
- إذا كان الهدف لاحقًا إدارة راوتر داخل الشبكة، يجب أن يكون هذا الجهاز داخل شبكة الراوتر أو متصلًا بها عبر VPN/Tailscale. لا تمنح الوكيل صلاحيات الراوتر الآن؛ هذه الحزمة لا تطبق إعدادات فعلية.

## التثبيت

من مجلد `linux-agent`:

```bash
sudo ./install.sh
sudoedit /etc/nexora-linux-agent/agent.env
```

ضع السر المشترك في الملف المنفصل، دون إرساله في المحادثة أو حفظه في Git:

```bash
sudo install -o root -g nexora-agent -m 0640 /path/to/secret /etc/nexora-linux-agent/secret
```

يجب أن يطابق `NEXORA_KEY_ID` المفتاح الفعال في NEXORA. الإعداد الافتراضي هو `nexora-linux-bridge-prod`، ويجب أن يطابق سر الملف قيمة `NEXORA_BRIDGE_HMAC_SECRET` أو المفتاح الفعال المقابل على الخادم.

شغّل الخدمة:

```bash
sudo systemctl enable --now nexora-linux-agent
sudo systemctl status nexora-linux-agent --no-pager
sudo journalctl -u nexora-linux-agent -f
```

بعد أول heartbeat صحيح، يجب أن تظهر المحطة باسم `NEXORA_DEVICE_ID` في واجهة NEXORA. إذا لم تظهر، افحص عنوان الخدمة و`NEXORA_KEY_ID` وتطابق السر والوقت على الجهاز.

## العقد الأمني

يرسل الوكيل `POST /api/terminal/heartbeat` فقط. التوقيع هو:

```text
HMAC-SHA256(secret, unixTimestamp + "." + exactRawJsonBody)
```

والترويسات:

```text
x-nexora-key: <key-id>
x-nexora-timestamp: <unix-seconds>
x-nexora-signature: sha256=<hex-signature>
```

لا يسجل الوكيل السر أو التوقيع أو نص استجابة الخادم. يرفض التشغيل إذا كان ملف السر رابطًا رمزيًا أو قابلًا للقراءة من مستخدمين آخرين، ويشترط HTTPS افتراضيًا. لا تستخدم `NEXORA_ALLOW_INSECURE_HTTP=true` إلا لاختبار محلي معزول.

إعدادات `systemd` تمنع الامتيازات الجديدة، وتحمي نظام الملفات، وتمنع الأجهزة الخاصة، وتقيّد عائلات الشبكة إلى IPv4/IPv6. احفظ نسخة من ملف `agent.env` والسر خارج Git.

## الإزالة

```bash
sudo ./uninstall.sh
```

يزيل البرنامج والوحدة لكنه يترك `/etc/nexora-linux-agent` والسر دون حذف تلقائي. احذف المجلد يدويًا فقط بعد تدوير السر والتأكد من عدم الحاجة إليه.
