# 🏠 Faber WebAdmin - Geliştirici Kılavuzu

**Versiyon:** 1.0  
**Son Güncelleme:** 2026-01-13  
**Teknoloji Stack:** Next.js 14 + TypeScript + Tailwind CSS

---

## 📋 İçindekiler

1. [Proje Hakkında](#proje-hakkında)
2. [Mimari Kaynaklar](#mimari-kaynaklar)
3. [Backend Entegrasyonu](#backend-entegrasyonu)
4. [Multi-Tenant Yapısı](#multi-tenant-yapısı)
5. [Kurulum](#kurulum)
6. [Geliştirme Checklist](#geliştirme-checklist)

---

## 📖 Proje Hakkında

Faber WebAdmin, akıllı ev cihazlarını yönetmek için tasarlanmış bir admin panelidir. Proje, **Home Assistant Frontend (frontend-dev)** mimarisinden ilham alarak, **faber_backend** IoT API'si ile entegre çalışır.

### Temel Özellikler

- 🔐 JWT tabanlı kimlik doğrulama
- 🏢 Multi-tenant (çoklu kiracı) desteği
- 🎨 White-labeling (özelleştirilebilir tema)
- 📊 IoT cihaz dashboard'u
- ⚡ Canlı cihaz durumu (WebSocket)

---

## 🏗️ Mimari Kaynaklar

### frontend-dev'den Alınanlar

| Kaynak         | Açıklama             | Dönüşüm                     |
| -------------- | -------------------- | --------------------------- |
| `src/auth/`    | Auth bileşenleri     | React Context + Hooks       |
| `src/state/`   | 20 mixin dosyası     | Zustand store               |
| `src/data/`    | 156 veri modülü      | TypeScript types + services |
| `src/layouts/` | Layout sistemi       | Next.js App Router layouts  |
| `src/common/`  | Utility fonksiyonlar | `utils/` klasörü            |

### Mimari Kararlar

```
frontend-dev (Lit Element)  →  faber_webAdmin (React/Next.js)
─────────────────────────────────────────────────────────────
Mixins                      →  React Context + Custom Hooks
Web Components              →  React Components
Lit Templates               →  JSX/TSX
Home Assistant API          →  faber_backend REST API
```

---

## 🔌 Backend Entegrasyonu

### API Base URL

```typescript
// config/env.ts
const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
};
```

### Endpoint Eşleştirmesi

| faber_backend Endpoint             | Frontend Service    | Açıklama           |
| ---------------------------------- | ------------------- | ------------------ |
| `POST /auth/login`                 | `auth.service.ts`   | Admin girişi       |
| `POST /auth/admin/login`           | `auth.service.ts`   | Super admin girişi |
| `POST /auth/refresh`               | `api.service.ts`    | Token yenileme     |
| `GET /mobile/homes`                | `home.service.ts`   | Ev listesi         |
| `GET /mobile/devices`              | `device.service.ts` | Cihaz listesi      |
| `POST /mobile/devices/:id/control` | `device.service.ts` | Cihaz kontrolü     |
| `GET /mobile/scenes`               | `scene.service.ts`  | Senaryo listesi    |

### Axios Interceptor Yapısı

```typescript
// services/api.service.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 1. Refresh token dene
      // 2. Başarısızsa login'e yönlendir
    }
    return Promise.reject(error);
  }
);
```

---

## 🏢 Multi-Tenant Yapısı

### Tenant Belirleme Stratejisi

```
┌─────────────────────────────────────────┐
│            Gelen İstek                   │
└────────────────┬────────────────────────┘
                 ▼
        ┌────────────────┐
        │ Subdomain var? │
        └───────┬────────┘
           Evet │ Hayır
                ▼
   ┌────────────────────────┐
   │ vadi.faber.app         │──▶ Vadi İstanbul Tenant
   │ zorlu.faber.app        │──▶ Zorlu Tenant
   │ localhost / faber.app  │──▶ Everyone (Herkes)
   └────────────────────────┘
```

### Yeni Tenant Ekleme

1. **Backend'de tenant oluştur:**

```sql
INSERT INTO "Tenant" (id, name, slug, settings)
VALUES (
  'uuid-here',
  'Vadi İstanbul',
  'vadi',
  '{"logo": "/tenants/vadi/logo.svg", "primaryColor": "#2563eb"}'
);
```

2. **Frontend'de tenant config ekle:**

```typescript
// config/tenants/vadi.ts
export const vadiConfig: TenantConfig = {
  id: "vadi",
  name: "Vadi İstanbul",
  logo: "/tenants/vadi/logo.svg",
  primaryColor: "#2563eb",
  secondaryColor: "#1e40af",
  features: {
    showScenes: true,
    showEnergy: true,
    allowDeviceAdd: false,
  },
};
```

3. **DNS kaydı ekle:**
   - `vadi.faber.app` → Aynı sunucu IP

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- faber_backend çalışır durumda

### Adımlar

```bash
# 1. Bağımlılıkları yükle
cd faber_webAdmin
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenle

# 3. Geliştirme sunucusu başlat
npm run dev
```

### Ortam Değişkenleri

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_TENANT=everyone
```

---

## ✅ Geliştirme Checklist

### Faz 1: Temel Altyapı ✅ Tamamlandı

- [x] Klasör yapısını oluştur
- [x] Ortam değişkenlerini genişlet (`config/env.ts`)
- [x] TypeScript tip tanımları (`types/`)

### Faz 2: Auth Sistemi ✅ Tamamlandı

- [x] Auth Context oluştur (`contexts/AuthContext.tsx`)
- [x] Login/Register sayfaları
- [x] Route middleware (guard) (`middleware.ts`)
- [x] Token refresh mekanizması (`api.service.ts`)

### Faz 3: Servis Katmanı ✅ Tamamlandı

- [x] api.service.ts
- [x] auth.service.ts
- [x] device.service.ts
- [x] home.service.ts
- [x] scene.service.ts
- [x] socket.service.ts

### Faz 4: Dashboard ✅ Tamamlandı

- [x] Layout components (Sidebar, Header, MainLayout)
- [x] Dashboard ana sayfası
- [x] Cihaz listeleme
- [x] Cihaz kontrolü (DeviceCard)

### Faz 5: Canlı Veri ✅ Tamamlandı

- [x] Socket.io entegrasyonu (altyapı)
- [x] Gerçek zamanlı cihaz durumu (`useDevices` + WebSocket)
- [x] Telemetri grafikleri (`TelemetryChart`)

### Faz 6: Multi-Tenant ✅ Hazır

- [x] Tenant Context (`contexts/TenantContext.tsx`)
- [x] White-labeling sistemi (`config/tenant.config.ts`)
- [x] Subdomain routing (Logic hazır, DNS gerekli)

---

## 📚 Kaynaklar

- [faber_backend README](file:///home/ismetkabatepe/Desktop/faber_backend/README.md)
- [Prisma Schema](file:///home/ismetkabatepe/Desktop/faber_backend/prisma/schema.prisma)
- [frontend-dev (Blueprint)](file:///home/ismetkabatepe/Desktop/frontend-dev/src)

---

> **Not:** Bu doküman yaşayan bir dökümdür. Her faz tamamlandığında güncellenmelidir.
