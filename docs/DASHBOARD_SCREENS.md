# Faber WebAdmin Dashboard Screens Documentation

> **Amaç**: Bu dokümantasyon, `faber_webAdmin` projesindeki tüm dashboard ekranlarının HTML/CSS yapısını, API isteklerini ve davranışlarını detaylı olarak açıklamaktadır. Bu döküman, AI araçlarına verilerek mobil ekran tasarımları oluşturulabilir.

---

## İçindekiler

1. [Global Tasarım Sistemi](#1-global-tasarım-sistemi)
2. [Dashboard - Ana Sayfa](#2-dashboard---ana-sayfa)
3. [Devices - Cihazlar](#3-devices---cihazlar)
4. [Rooms - Odalar](#4-rooms---odalar)
5. [Scenes - Senaryolar/Otomasyon](#5-scenes---senaryolarotomasyon)
6. [Settings - Ayarlar](#6-settings---ayarlar)
7. [Logs - Denetim Kayıtları](#7-logs---denetim-kayıtları)
8. [Homes - Evler](#8-homes---evler)
9. [Users - Kullanıcılar](#9-users---kullanıcılar)
10. [Members - Üyeler](#10-members---üyeler)
11. [Ortak Bileşenler](#11-ortak-bileşenler)
12. [Mobil Adaptasyon Notları](#12-mobil-adaptasyon-notları)

---

## 1. Global Tasarım Sistemi

### 1.1 Renk Paleti

```css
/* Primary Colors */
--primary: #3B82F6;        /* Blue-500 - Ana marka rengi */
--primary-hover: #2563EB;  /* Blue-600 - Hover durumu */
--primary-light: #EFF6FF;  /* Blue-50 - Açık arkaplan */

/* Neutral Colors (Slate) */
--slate-50: #F8FAFC;       /* En açık arkaplan */
--slate-100: #F1F5F9;      /* Arkaplan */
--slate-200: #E2E8F0;      /* Border açık */
--slate-300: #CBD5E1;      /* Border */
--slate-400: #94A3B8;      /* Placeholder */
--slate-500: #64748B;      /* Secondary text */
--slate-600: #475569;      /* Body text */
--slate-700: #334155;      /* Heading */
--slate-800: #1E293B;      /* Dark surface */
--slate-900: #0F172A;      /* Darkest */

/* Semantic Colors */
--success: #22C55E;        /* Green-500 */
--warning: #F59E0B;        /* Amber-500 */
--error: #EF4444;          /* Red-500 */
--info: #06B6D4;           /* Cyan-500 */

/* Background Colors */
--bg-light: #F1F5F9;       /* Light mode page background */
--bg-dark: #0F172A;        /* Dark mode page background */
--surface-light: #FFFFFF;  /* Light mode card background */
--surface-dark: #1E293B;   /* Dark mode card background */
```

### 1.2 Tipografi

```css
/* Font Family */
font-family: 'Inter', system-ui, sans-serif;

/* Font Sizes */
--text-xs: 12px;     /* line-height: 16px */
--text-sm: 14px;     /* line-height: 20px */
--text-base: 16px;   /* line-height: 24px */
--text-lg: 18px;     /* line-height: 28px */
--text-xl: 20px;     /* line-height: 28px */
--text-2xl: 24px;    /* line-height: 32px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 1.3 Spacing ve Border Radius

```css
/* Spacing Scale (Tailwind) */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-full: 9999px;
```

### 1.4 Gölge (Shadow)

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-primary: 0 4px 14px rgba(59,130,246,0.25);
```

---

## 2. Dashboard - Ana Sayfa

**URL**: `/dashboard`  
**Dosya**: `src/app/(dashboard)/dashboard/page.tsx`

### 2.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ ┌──────────┐ ┌─────────────────┐ ┌────────────────────────┐ │
│ │ Title    │ │ Search Bar      │ │ Status + Düzenle Btn  │ │
│ │ Subtitle │ │                 │ │                        │ │
│ └──────────┘ └─────────────────┘ └────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ EDIT MODE BANNER (conditional)                              │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (overflow-y-auto, p-8)                         │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ SECTION 1   │ │ SECTION 2   │ │ SECTION 3   │            │
│ │ (Room Card) │ │ (Room Card) │ │ (Room Card) │            │
│ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │            │
│ │ │ Widget  │ │ │ │ Widget  │ │ │ │ Widget  │ │            │
│ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │            │
│ │ ┌─────────┐ │ │ ┌─────────┐ │ │             │            │
│ │ │ Widget  │ │ │ │ Widget  │ │ │             │            │
│ │ └─────────┘ │ │ └─────────┘ │ │             │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Header HTML Yapısı

```html
<header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
  <!-- Sol: Başlık -->
  <div class="flex items-center gap-6">
    <div class="flex flex-col">
      <h1 class="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <span class="text-xs text-gray-500">Ana Sayfa</span>
    </div>
  </div>

  <!-- Orta: Arama -->
  <div class="flex-1 max-w-md mx-8 hidden md:block">
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Cihaz veya oda ara..."
        class="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder-gray-400 text-gray-900 dark:text-white"
      />
    </div>
  </div>

  <!-- Sağ: Durum + Aksiyonlar -->
  <div class="flex items-center gap-4">
    <!-- Bağlantı Durumu -->
    <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
      <span class="text-xs font-medium text-gray-500">Sistem Durumu</span>
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <span class="text-xs font-medium text-green-600">Çevrimiçi</span>
      </div>
    </div>

    <!-- Bildirim -->
    <button class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <Bell class="w-5 h-5 text-gray-500" />
      <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
    </button>

    <!-- Düzenle Butonu -->
    <button class="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition text-sm font-semibold">
      <Pencil class="w-4 h-4" />
      <span>Düzenle</span>
    </button>
  </div>
</header>
```

### 2.3 Section Card (Oda Kartı)

```html
<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
  <!-- Başlık -->
  <div class="p-4 flex items-center justify-between" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
        <Home class="text-white" size={20} />
      </div>
      <h3 class="text-lg font-bold text-white">Salon</h3>
    </div>
    <span class="text-xs text-white/80">3 cihaz</span>
  </div>
  
  <!-- Widget Grid -->
  <div class="p-4 grid grid-cols-2 gap-3">
    <!-- Widget kartları buraya -->
  </div>
</div>
```

### 2.4 Widget Card (Cihaz Kartı)

```html
<div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 hover:border-primary/30 transition-all cursor-pointer">
  <div class="flex items-center justify-between mb-2">
    <div class="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
      <Lightbulb class="text-yellow-600 dark:text-yellow-400" size={16} />
    </div>
    <!-- Toggle Switch -->
    <button class="w-10 h-6 rounded-full bg-primary relative">
      <span class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow"></span>
    </button>
  </div>
  <p class="text-sm font-medium text-slate-900 dark:text-white truncate">Tavan Lambası</p>
  <p class="text-xs text-primary font-medium">Açık</p>
</div>
```

### 2.5 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/homes` | Kullanıcının evlerini getir |
| GET | `/homes/{homeId}/rooms` | Ev için odaları getir |
| GET | `/homes/{homeId}/devices` | Ev için cihazları getir |
| PATCH | `/devices/{deviceId}` | Cihaz durumunu güncelle (on/off, brightness) |
| PATCH | `/devices/{deviceId}` | Cihazı odaya ata (roomId) |

### 2.6 State Yönetimi

```typescript
// Loading durumu
const [isLoading, setIsLoading] = useState(true);

// Edit modu
const [editMode, setEditMode] = useState(false);

// Sections (odalar + cihazlar)
const [sections, setSections] = useState<Section[]>([]);

// Drag & Drop aktif öğe
const [activeId, setActiveId] = useState<string | null>(null);

// Modal durumları
const [addSectionOpen, setAddSectionOpen] = useState(false);
const [addWidgetSectionId, setAddWidgetSectionId] = useState<string | null>(null);
```

### 2.7 Etkileşimler

1. **Cihaz Toggle**: Widget üzerindeki switch'e tıklayınca `PATCH /devices/{id}` ile `on` durumu değişir
2. **Drag & Drop**: Edit modunda section'lar ve widget'lar sürüklenebilir
3. **Bölüm Ekle**: Modal açılır, oda adı ve renk seçilir
4. **Widget Ekle**: Section'a cihaz ekleme modalı açılır

---

## 3. Devices - Cihazlar

**URL**: `/dashboard/devices`  
**Dosya**: `src/app/(dashboard)/dashboard/devices/page.tsx`

### 3.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title + Search + Status + "Cihaz Ekle" Button               │
├─────────────────────────────────────────────────────────────┤
│ FILTER BAR (p-2, rounded-xl)                                │
│ ┌────────────────┐ │ ┌────────┐┌────────┐┌────────┐ ┌────┐  │
│ │ Search Input   │ │ │ Tümü   ││Çevrim. ││Çevrim. │ │Grid│  │
│ └────────────────┘ │ │ (123)  ││dışı    ││        │ │List│  │
│                    │ └────────┘└────────┘└────────┘ └────┘  │
├─────────────────────────────────────────────────────────────┤
│ DATA TABLE (rounded-xl, border)                             │
│ ┌───────────────────────────────────────────────────────────┐
│ │ Cihaz Adı    │ Durum     │ Oda      │ Tür    │ İşlemler  │
│ ├───────────────────────────────────────────────────────────┤
│ │ [Icon] Lamp  │ ● Çevrim. │ Salon    │ Light  │ ⋮         │
│ │ [Icon] Lock  │ ○ Çevrim. │ Giriş    │ Lock   │ ⋮         │
│ └───────────────────────────────────────────────────────────┘
│ PAGINATION: "Toplam 45 cihaz görüntüleniyor"                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Filter Bar HTML

```html
<div class="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-surface-dark p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
  <!-- Arama Input -->
  <label class="flex items-center h-10 w-full md:w-96 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 gap-2 focus-within:ring-2 ring-primary/50">
    <Search class="text-slate-400 w-5 h-5" />
    <input
      class="flex-1 bg-transparent border-none text-sm placeholder-slate-400 focus:outline-none"
      placeholder="Cihaz ara..."
    />
  </label>

  <!-- Ayırıcı -->
  <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

  <!-- Filter Chips -->
  <div class="flex gap-2 overflow-x-auto">
    <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary text-sm font-medium">
      <span>Tümü</span>
      <span class="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">123</span>
    </button>
    <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent text-slate-500 text-sm font-medium hover:bg-slate-50">
      <span>Çevrimiçi</span>
      <span class="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">98</span>
    </button>
    <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-transparent text-slate-500 text-sm font-medium hover:bg-slate-50">
      <span>Çevrimdışı</span>
      <span class="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">25</span>
    </button>
  </div>

  <!-- View Toggle -->
  <div class="ml-auto flex gap-2">
    <button class="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
      <ListFilter size={20} />
    </button>
    <button class="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
      <LayoutGrid size={20} />
    </button>
  </div>
</div>
```

### 3.3 Data Table HTML

```html
<div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse min-w-[800px]">
      <thead class="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
        <tr>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200" style="width:30%">Cihaz Adı</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200" style="width:15%">Durum</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200" style="width:15%">Oda</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200" style="width:15%">Tür</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200" style="width:15%">Son Görülme</th>
          <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 text-right" style="width:10%">İşlemler</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Lightbulb size={20} />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-white">Tavan Lambası</p>
                <p class="text-xs text-slate-500">ID: #DEV-a1b2</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Çevrimiçi
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">Salon</td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <Router size={16} class="text-slate-400" />
              <span class="text-sm text-slate-500">Light</span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">Şimdi</td>
          <td class="px-6 py-4 text-right">
            <button class="p-2 hover:bg-slate-100 rounded-lg">
              <MoreVertical size={20} class="text-slate-400" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
    <p class="text-sm text-slate-500">
      Toplam <span class="font-medium text-slate-900 dark:text-white">45</span> cihaz görüntüleniyor
    </p>
  </div>
</div>
```

### 3.4 Status Badge Varyantları

```html
<!-- Çevrimiçi -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
  Çevrimiçi
</span>

<!-- Çevrimdışı -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
  <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
  Çevrimdışı
</span>

<!-- Açık -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
  Açık
</span>
```

### 3.5 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/homes/{homeId}/devices` | Tüm cihazları getir |
| GET | `/homes/{homeId}/rooms` | Odaları getir (oda adı için) |
| PATCH | `/devices/{deviceId}` | Cihaz güncelle |
| DELETE | `/devices/{deviceId}` | Cihaz sil |

### 3.6 Filtreleme Mantığı

```typescript
const filteredDevices = devices.filter(d => {
  // Arama filtresi
  const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  
  // Durum filtresi
  const matchesFilter = activeFilter === 'all' || 
    (activeFilter === 'online' && d.isOnline) ||
    (activeFilter === 'offline' && !d.isOnline);
  
  return matchesSearch && matchesFilter;
});
```

---

## 4. Rooms - Odalar

**URL**: `/dashboard/rooms`  
**Dosya**: `src/app/(dashboard)/dashboard/rooms/page.tsx`

### 4.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title + Search + Status + "Oda Ekle" Button                 │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (p-6, grid cols-4)                             │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │ ROOM CARD   │ │ ROOM CARD   │ │ ROOM CARD   │ │ ROOM    │ │
│ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ CARD    │ │
│ │ │ Image   │ │ │ │ Image   │ │ │ │ Image   │ │ │         │ │
│ │ │ + Name  │ │ │ │ + Name  │ │ │ │ + Name  │ │ │         │ │
│ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │         │ │
│ │ 🌡️ 24° | 💧 65% │ │ 🌡️ 22° | 💧 70% │ │ 🌡️ 26° | 💧 55% │ │         │ │
│ │ 5 Cihaz     │ │ 3 Cihaz     │ │ 2 Cihaz     │ │         │ │
│ │ [Yönet]     │ │ [Yönet]     │ │ [Yönet]     │ │         │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Room Card HTML

```html
<div class="group flex flex-col bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary/20">
  <!-- Görsel Bölümü -->
  <div class="h-40 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
    <!-- Görsel varsa -->
    <img src="room-image.jpg" alt="Salon" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
    
    <!-- Görsel yoksa placeholder -->
    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800">
      <MapPin class="text-white/20 w-20 h-20" />
    </div>

    <!-- Alt gradient overlay -->
    <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
    
    <!-- Oda adı -->
    <h3 class="absolute bottom-3 left-4 text-white font-semibold text-lg tracking-wide">Salon</h3>
  </div>

  <!-- Bilgi Bölümü -->
  <div class="p-4 flex flex-col gap-4">
    <!-- Sıcaklık ve Nem -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-slate-900 dark:text-white">
        <div class="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full text-orange-600 dark:text-orange-400">
          <Thermometer size={20} />
        </div>
        <span class="font-semibold">24°</span>
      </div>
      <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
      <div class="flex items-center gap-2 text-slate-900 dark:text-white">
        <div class="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
          <Droplets size={20} />
        </div>
        <span class="font-semibold">65%</span>
      </div>
    </div>

    <!-- Cihaz Sayısı -->
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2 text-slate-500">
        <span>5 Cihaz</span>
      </div>
    </div>

    <!-- Yönet Butonu -->
    <button class="mt-2 w-full py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors">
      Yönet
    </button>
  </div>
</div>
```

### 4.3 Empty State

```html
<div class="col-span-full py-10 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
  <p class="text-slate-500 mb-4">Henüz oda eklenmemiş.</p>
  <button class="text-primary font-bold hover:underline">İlk odanızı oluşturun</button>
</div>
```

### 4.4 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/homes/{homeId}/rooms` | Odaları getir |
| GET | `/homes/{homeId}/devices` | Cihazları getir (oda bazlı sayım için) |
| POST | `/homes/{homeId}/rooms` | Yeni oda oluştur |
| DELETE | `/rooms/{roomId}` | Oda sil |

### 4.5 Data Enhancement

```typescript
// Oda verilerini cihaz bilgileriyle zenginleştir
const enhancedRooms = rawRooms.map((room) => ({
  ...room,
  deviceCount: allDevices.filter((d) => d.roomId === room.id).length,
  temperature: allDevices.find((d) => d.roomId === room.id && d.attributes?.temperature)?.attributes?.temperature
}));
```

---

## 5. Scenes - Senaryolar/Otomasyon

**URL**: `/dashboard/scenes`  
**Dosya**: `src/app/(dashboard)/dashboard/scenes/page.tsx`

### 5.1 Sayfa Yapısı (Split Layout)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title + Search + Status + "Yeni Oluştur" Button             │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (grid cols-12)                                 │
│                                                             │
│ ┌───────────────────┬───────────────────────────────────────┐
│ │ LEFT COL (4)      │ RIGHT COL (8)                         │
│ │ Hızlı Sahneler    │ Aktif Otomasyonlar                    │
│ │                   │ [Tümü] [Aktif] [Pasif]                │
│ │ ┌───────────────┐ │                                       │
│ │ │ 🌙 Gece Modu  │ │ ┌─────────────────────────────────┐   │
│ │ │ 3 aksiyon  ▶️ │ │ │ ⏰ Saat 07:00 → ⚡ Sabah Rutini │   │
│ │ └───────────────┘ │ │ 5 aksiyon | Son: Bugün  [Toggle]│   │
│ │ ┌───────────────┐ │ └─────────────────────────────────┘   │
│ │ │ ☀️ Gündüz     │ │ ┌─────────────────────────────────┐   │
│ │ │ 2 aksiyon  ▶️ │ │ │ 🌅 Gün Batımı → ⚡ Akşam Modu  │   │
│ │ └───────────────┘ │ │ 4 aksiyon | Son: Dün   [Toggle]│   │
│ │                   │ └─────────────────────────────────┘   │
│ └───────────────────┴───────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Quick Scene Card

```html
<div class="group flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-800 hover:border-primary">
  <!-- Icon -->
  <div class="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
    <Moon size={24} />
  </div>
  
  <!-- Info -->
  <div class="flex flex-col flex-1">
    <h4 class="text-base font-bold text-slate-900 dark:text-white">Gece Modu</h4>
    <p class="text-sm text-slate-500 dark:text-slate-400">3 aksiyon</p>
  </div>
  
  <!-- Play Button -->
  <button class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors">
    <Play size={16} class="ml-0.5 text-slate-600 dark:text-slate-300" />
  </button>
</div>

<!-- Aktif Durum -->
<div class="group flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all bg-blue-50/50 dark:bg-blue-900/10 border-primary">
  <div class="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white">
    <Moon size={24} />
  </div>
  <div class="flex flex-col flex-1">
    <h4 class="text-base font-bold text-slate-900 dark:text-white">Gece Modu</h4>
    <p class="text-sm text-primary">3 aksiyon</p>
  </div>
  <!-- ... -->
</div>
```

### 5.3 Automation Row

```html
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark hover:shadow-md transition-all cursor-pointer">
  <!-- Tetikleyici + Aksiyon -->
  <div class="flex items-center gap-4 flex-1">
    <!-- Tetikleyici -->
    <div class="flex items-center gap-3 min-w-[180px]">
      <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
        <Clock size={20} />
      </div>
      <div class="flex flex-col">
        <span class="text-xs font-bold text-primary uppercase tracking-wider">Tetikleyici</span>
        <span class="text-sm font-semibold text-slate-900 dark:text-white">Saat 07:00</span>
      </div>
    </div>
    
    <!-- Ok -->
    <div class="text-slate-300 rotate-90 md:rotate-0">➜</div>
    
    <!-- Aksiyon -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
        <Zap size={20} />
      </div>
      <div class="flex flex-col">
        <span class="text-xs font-bold text-primary uppercase tracking-wider">Aksiyon</span>
        <span class="text-sm font-semibold text-slate-900 dark:text-white">Sabah Rutini</span>
        <span class="text-xs text-slate-500">5 aksiyon</span>
      </div>
    </div>
  </div>
  
  <!-- Sağ Taraf: Son çalışma + Toggle -->
  <div class="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-none border-slate-100 dark:border-slate-800">
    <span class="text-xs text-slate-500 font-medium">Son: Bugün</span>
    
    <!-- Toggle Switch -->
    <button class="w-11 h-6 rounded-full relative transition-colors bg-primary">
      <div class="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform shadow-sm translate-x-[20px]"></div>
    </button>
  </div>
</div>
```

### 5.4 Filter Buttons

```html
<div class="flex items-center gap-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg p-1">
  <button class="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-white">
    Tümü
  </button>
  <button class="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
    Aktif
  </button>
  <button class="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
    Pasif
  </button>
</div>
```

### 5.5 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/admin/scenes?homeId={id}` | Sahneleri getir |
| POST | `/admin/scenes/{id}/execute` | Sahne çalıştır |
| PATCH | `/admin/scenes/{id}` | Sahne güncelle (isActive toggle) |
| DELETE | `/admin/scenes/{id}` | Sahne sil |

### 5.6 Trigger Türleri

```typescript
type SceneTrigger = 'MANUAL' | 'SCHEDULE' | 'SUNRISE' | 'SUNSET' | 'DEVICE';

const TRIGGER_ICONS = {
  MANUAL: <Zap />,
  SCHEDULE: <Clock />,
  SUNRISE: <Sun />,
  SUNSET: <Moon />,
  DEVICE: <Settings />,
};
```

---

## 6. Settings - Ayarlar

**URL**: `/dashboard/settings`  
**Dosya**: `src/app/(dashboard)/dashboard/settings/page.tsx`

### 6.1 Sayfa Yapısı (Tab + Content)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title: "Ayarlar" + Subtitle + Connection Status             │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────────┬──────────────────────────────────────────┤
│ │ SIDEBAR (w-64) │ MAIN CONTENT                             │
│ │                │                                          │
│ │ ┌────────────┐ │ ┌──────────────────────────────────────┐ │
│ │ │ 👤 Profil  │ │ │ CARD: Kişisel Bilgiler               │ │
│ │ └────────────┘ │ │ ┌──────────────────────────────────┐ │ │
│ │ ┌────────────┐ │ │ │ Ad Soyad: [____________]         │ │ │
│ │ │ 🛡️ Güvenlik│ │ │ │ E-posta:  [____________]         │ │ │
│ │ └────────────┘ │ │ │ Telefon:  [____________]         │ │ │
│ │ ┌────────────┐ │ │ └──────────────────────────────────┘ │ │
│ │ │ 🔔 Bildirim│ │ │                         [Kaydet]    │ │
│ │ └────────────┘ │ └──────────────────────────────────────┘ │
│ │ ┌────────────┐ │                                          │
│ │ │ ⚙️ Tercih  │ │ ┌──────────────────────────────────────┐ │
│ │ └────────────┘ │ │ CARD: Şifre Değiştir                 │ │
│ │                │ │ ...                                   │ │
│ └────────────────┴──────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Sidebar Tab Navigation

```html
<aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 hidden md:block">
  <nav class="p-4 space-y-1">
    <!-- Aktif Tab -->
    <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold">
      <User size={20} />
      <span>Profil</span>
    </button>
    
    <!-- İnaktif Tab -->
    <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
      <Shield size={20} />
      <span>Güvenlik</span>
    </button>
    
    <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
      <Bell size={20} />
      <span>Bildirimler</span>
    </button>
    
    <button class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
      <Settings2 size={20} />
      <span>Tercihler</span>
    </button>
  </nav>
</aside>
```

### 6.3 Settings Card Component

```html
<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center">
        <User class="text-white" size={22} />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Kişisel Bilgiler</h3>
        <p class="text-sm text-slate-500 mt-0.5">Hesap bilgilerinizi güncelleyin</p>
      </div>
    </div>
    
    <!-- Form Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Input Fields -->
    </div>
    
    <!-- Footer -->
    <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
      <button class="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium">
        Kaydet
      </button>
    </div>
  </div>
</div>
```

### 6.4 Form Input Component

```html
<div class="space-y-2">
  <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
    <User size={14} class="text-slate-400" />
    Ad Soyad
  </label>
  <div class="relative">
    <input
      type="text"
      placeholder="Adınız Soyadınız"
      class="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-slate-900 dark:text-white"
    />
  </div>
</div>

<!-- Password Input with Toggle -->
<div class="space-y-2">
  <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
    <Key size={14} class="text-slate-400" />
    Şifre
  </label>
  <div class="relative">
    <input
      type="password"
      placeholder="••••••••"
      class="w-full h-11 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    />
    <button class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600">
      <Eye size={18} />
    </button>
  </div>
</div>
```

### 6.5 Password Strength Indicator

```html
<div class="space-y-1.5">
  <div class="flex gap-1">
    <div class="h-1 flex-1 rounded-full bg-red-500"></div>
    <div class="h-1 flex-1 rounded-full bg-orange-500"></div>
    <div class="h-1 flex-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
    <div class="h-1 flex-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
  </div>
  <p class="text-xs font-medium text-orange-500">Zayıf</p>
</div>
```

### 6.6 2FA Status Card

```html
<!-- 2FA Kapalı -->
<div class="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
  <div class="flex items-center gap-4">
    <div class="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
      <Smartphone size={22} />
    </div>
    <div>
      <span class="font-semibold text-slate-900 dark:text-white">2FA Kapalı</span>
      <p class="text-sm text-slate-500 mt-0.5">Hesabınızı daha güvenli hale getirin</p>
    </div>
  </div>
  <button class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
    Etkinleştir
  </button>
</div>

<!-- 2FA Açık -->
<div class="p-4 rounded-xl border bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 flex items-center justify-between gap-4">
  <div class="flex items-center gap-4">
    <div class="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
      <Smartphone size={22} />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <span class="font-semibold text-slate-900 dark:text-white">Google Authenticator</span>
        <span class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
          AKTİF
        </span>
      </div>
      <p class="text-sm text-slate-500 mt-0.5">8 kurtarma kodu mevcut</p>
    </div>
  </div>
  <div class="flex gap-2">
    <button class="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100">
      Kodları Yenile
    </button>
    <button class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium">
      Kapat
    </button>
  </div>
</div>
```

### 6.7 Trusted Device Card

```html
<div class="flex items-center justify-between p-4 rounded-xl border bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800">
  <div class="flex items-center gap-4">
    <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
      <Monitor size={20} />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <span class="font-medium text-slate-900 dark:text-white">Chrome - Windows 11</span>
        <span class="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-bold">
          Bu Cihaz
        </span>
      </div>
      <div class="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
        <span class="flex items-center gap-1">
          <Globe size={12} />
          İstanbul, Türkiye
        </span>
        <span class="flex items-center gap-1">
          <Clock size={12} />
          5 Şub, 14:32
        </span>
      </div>
    </div>
  </div>
  <button class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
    <X size={18} />
  </button>
</div>
```

### 6.8 Toggle Switch

```html
<button
  type="button"
  role="switch"
  aria-checked="true"
  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-blue-500"
>
  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition translate-x-5"></span>
</button>

<!-- Off State -->
<button
  type="button"
  role="switch"
  aria-checked="false"
  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors bg-slate-200 dark:bg-slate-700"
>
  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition translate-x-0"></span>
</button>
```

### 6.9 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/auth/profile` | Kullanıcı profilini getir |
| PATCH | `/auth/profile` | Profil güncelle |
| POST | `/auth/change-password` | Şifre değiştir |
| GET | `/auth/2fa/status` | 2FA durumunu getir |
| POST | `/auth/2fa/totp/setup` | TOTP kurulumu başlat |
| POST | `/auth/2fa/totp/verify` | TOTP doğrula ve etkinleştir |
| DELETE | `/auth/2fa/totp` | 2FA kapat |
| POST | `/auth/2fa/recovery/regenerate` | Kurtarma kodlarını yenile |
| GET | `/auth/trusted-devices` | Güvenilir cihazları listele |
| DELETE | `/auth/trusted-devices/{id}` | Güvenilir cihazı kaldır |
| DELETE | `/auth/trusted-devices` | Tüm güvenilir cihazları kaldır |

### 6.10 Tab Türleri

```typescript
type TabType = 'profile' | 'security' | 'notifications' | 'preferences';

const tabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'security', label: 'Güvenlik', icon: Shield },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'preferences', label: 'Tercihler', icon: Settings2 },
];
```

---

## 7. Logs - Denetim Kayıtları

**URL**: `/dashboard/logs`  
**Dosya**: `src/app/(dashboard)/dashboard/logs/page.tsx`

### 7.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title + Total Count + Filter Btn + Refresh + Export Btn     │
├─────────────────────────────────────────────────────────────┤
│ FILTER PANEL (conditional, p-4)                             │
│ İşlem Türü ▼ | Kaynak Türü ▼ | Başlangıç 📅 | Bitiş 📅 | X  │
├─────────────────────────────────────────────────────────────┤
│ SEARCH BAR                                                  │
│ [🔍 Kullanıcı, işlem veya kaynak ara...        ] [Ara]      │
├─────────────────────────────────────────────────────────────┤
│ DATA TABLE                                                  │
│ ┌───────────────────────────────────────────────────────────┐
│ │ Tarih          │ Kullanıcı │ İşlem       │ Kaynak │ IP    │
│ ├───────────────────────────────────────────────────────────┤
│ │ 05.02.26 14:32 │ 👤 Admin  │ 🟢 LOGIN    │ user   │ 192.. │
│ │ 05.02.26 14:30 │ 👤 User1  │ 🔴 BAN_DEV  │ device │ 192.. │
│ └───────────────────────────────────────────────────────────┘
│ PAGINATION: Sayfa 1 / 10  [Önceki] [Sonraki]                │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Filter Panel

```html
<div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
  <div class="max-w-[1440px] mx-auto flex flex-wrap gap-4 items-end">
    <!-- İşlem Türü -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-500">İşlem Türü</label>
      <select class="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
        <option value="">Tümü</option>
        <option value="LOGIN">LOGIN</option>
        <option value="LOGOUT">LOGOUT</option>
        <option value="CREATE_USER">CREATE USER</option>
        <!-- ... -->
      </select>
    </div>

    <!-- Kaynak Türü -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-500">Kaynak Türü</label>
      <select class="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm capitalize">
        <option value="">Tümü</option>
        <option value="user">user</option>
        <option value="device">device</option>
        <option value="scene">scene</option>
        <option value="home">home</option>
        <option value="room">room</option>
      </select>
    </div>

    <!-- Tarih Aralığı -->
    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-500">Başlangıç</label>
      <input type="date" class="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs font-medium text-gray-500">Bitiş</label>
      <input type="date" class="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
    </div>

    <!-- Temizle -->
    <button class="h-10 px-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium hover:bg-red-100 flex items-center gap-2">
      <X size={16} />
      Temizle
    </button>
  </div>
</div>
```

### 7.3 Log Table Row

```html
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
  <!-- Tarih -->
  <td class="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">
    05.02.2026, 14:32:15
  </td>
  
  <!-- Kullanıcı -->
  <td class="px-6 py-4">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <User size={14} class="text-primary" />
      </div>
      <span class="text-sm font-medium">admin@faber.com</span>
    </div>
  </td>
  
  <!-- İşlem Badge -->
  <td class="px-6 py-4">
    <!-- Başarılı işlem -->
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <Activity size={12} />
      LOGIN
    </span>
    
    <!-- Başarısız/Tehlikeli işlem -->
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <AlertTriangle size={12} />
      BAN DEVICE
    </span>
  </td>
  
  <!-- Kaynak -->
  <td class="px-6 py-4">
    <span class="text-sm text-slate-600 dark:text-slate-400">
      <span class="capitalize">user</span>
      <span class="text-slate-400 dark:text-slate-500 ml-1">(a1b2c3d4...)</span>
    </span>
  </td>
  
  <!-- IP Adresi -->
  <td class="px-6 py-4">
    <span class="font-mono text-xs text-slate-500">192.168.1.100</span>
  </td>
</tr>

<!-- Tehlikeli işlem satırı -->
<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-red-50/50 dark:bg-red-900/10 transition-colors">
  <!-- ... -->
</tr>
```

### 7.4 Action Badge Stilleri

```typescript
const getActionStyle = (action: string) => {
  const actionLower = action.toLowerCase();
  
  // Tehlikeli işlemler (kırmızı)
  if (actionLower.includes('delete') || actionLower.includes('ban') || actionLower.includes('fail')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
  
  // Başarılı işlemler (yeşil)
  if (actionLower.includes('create') || actionLower.includes('success') || actionLower.includes('activate')) {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }
  
  // Güncelleme işlemleri (mavi)
  if (actionLower.includes('update') || actionLower.includes('edit')) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }
  
  // Varsayılan (gri)
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
};
```

### 7.5 Pagination

```html
<div class="flex items-center justify-between">
  <span class="text-sm text-slate-500">
    Sayfa 1 / 10
  </span>
  <div class="flex gap-2">
    <button class="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-50 hover:bg-slate-50">
      <ChevronLeft size={16} />
      Önceki
    </button>
    <button class="flex items-center gap-1 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50">
      Sonraki
      <ChevronRight size={16} />
    </button>
  </div>
</div>
```

### 7.6 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/admin/logs?page=1&limit=20&action=LOGIN&entityType=user&startDate=...&endDate=...&search=...` | Logları getir |
| GET | `/admin/logs/export?...` | Logları CSV olarak dışa aktar |

### 7.7 Filter State

```typescript
interface LogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

const actionTypes = [
  'LOGIN', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
  'ACTIVATE_USER', 'DEACTIVATE_USER', 'BAN_DEVICE', 'UNBAN_DEVICE',
  'CONTROL_DEVICE', 'CREATE_SCENE', 'DELETE_SCENE', 'EXECUTE_SCENE',
];

const entityTypes = ['user', 'device', 'scene', 'home', 'room'];
```

---

## 8. Homes - Evler

**URL**: `/dashboard/homes`  
**Dosya**: `src/app/(dashboard)/dashboard/homes/page.tsx`

### 8.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title + Search + Status + "Yeni Ev" Button                  │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (grid cols-3)                                  │
│                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │
│ │ HOME CARD       │ │ HOME CARD       │ │ HOME CARD       │ │
│ │ 🏠              │ │ 🏠              │ │ 🏠              │ │
│ │ Yazlık Evim     │ │ Ana Ev          │ │ Ofis            │ │
│ │ 📍 Bodrum       │ │ 📍 İstanbul     │ │ 📍 Ankara       │ │
│ │ [Bu Evi Yönet]  │ │ [Bu Evi Yönet]  │ │ [Bu Evi Yönet]  │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Home Card

```html
<div class="group relative bg-white dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
  <!-- Header: Icon + Delete -->
  <div class="flex justify-between items-start mb-4">
    <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
      <Home size={24} />
    </div>
    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  </div>
  
  <!-- Info -->
  <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Yazlık Evim</h3>
  <div class="flex items-center gap-2 text-slate-500 text-sm mb-6">
    <MapPin size={16} />
    <span>Bodrum, Muğla</span>
  </div>
  
  <!-- Action Button -->
  <button class="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-primary hover:text-white transition-all">
    Bu Evi Yönet
  </button>
</div>
```

### 8.3 Empty State

```html
<div class="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300">
  <Home class="w-12 h-12 mx-auto text-slate-300 mb-4" />
  <p class="text-slate-500 mb-4">Henüz kayıtlı ev yok.</p>
  <button class="text-primary font-bold hover:underline">Hemen bir tane oluşturun</button>
</div>
```

### 8.4 Add Home Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div class="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Yeni Ev Oluştur</h3>
      <button><X class="text-slate-400 hover:text-slate-600" /></button>
    </div>
    
    <!-- Form -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ev Adı</label>
        <input
          placeholder="Örn: Yazlık Evim"
          class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adres (İsteğe bağlı)</label>
        <input
          placeholder="Şehir, İlçe..."
          class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/50 outline-none"
        />
      </div>
    </div>
    
    <!-- Actions -->
    <div class="pt-4 flex gap-3 justify-end">
      <button class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">İptal</button>
      <button class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
        Oluştur
      </button>
    </div>
  </div>
</div>
```

### 8.5 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/homes` | Kullanıcının evlerini getir |
| POST | `/homes` | Yeni ev oluştur |
| DELETE | `/homes/{homeId}` | Ev sil |

---

## 9. Users - Kullanıcılar

**URL**: `/dashboard/users`  
**Dosya**: `src/app/(dashboard)/dashboard/users/page.tsx`

### 9.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ Title + Subtitle + "Kullanıcı Ekle" Button                  │
├─────────────────────────────────────────────────────────────┤
│ TOOLBAR                                                     │
│ [🔍 İsim veya e-posta ara...                            ]   │
├─────────────────────────────────────────────────────────────┤
│ DATA TABLE                                                  │
│ ┌───────────────────────────────────────────────────────────┐
│ │ Kullanıcı    │ Rol      │ Kayıt Tarihi │ Durum  │ İşlem  │
│ ├───────────────────────────────────────────────────────────┤
│ │ 👤 Admin     │ MASTER   │ 01.01.2026   │ Aktif  │ Düzenle│
│ │ 👤 User1     │ USER     │ 15.01.2026   │ Aktif  │ Düzenle│
│ └───────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### 9.2 User Row

```html
<tr>
  <td>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
        A
      </div>
      <div>
        <div class="font-semibold text-slate-900 dark:text-white">Admin User</div>
        <div class="text-sm text-slate-500">admin@faber.com</div>
      </div>
    </div>
  </td>
  <td>
    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
      MASTER
    </span>
  </td>
  <td class="text-sm text-slate-500">01.01.2026</td>
  <td>
    <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
      Aktif
    </span>
  </td>
  <td>
    <button class="px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20">
      Düzenle
    </button>
  </td>
</tr>
```

### 9.3 Role Badge Varyantları

```html
<!-- MASTER -->
<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
  MASTER
</span>

<!-- ADMIN -->
<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
  ADMIN
</span>

<!-- USER -->
<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
  USER
</span>
```

### 9.4 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/admin/users` | Tüm kullanıcıları getir |
| POST | `/admin/users` | Yeni kullanıcı oluştur |
| PATCH | `/admin/users/{id}` | Kullanıcı güncelle |
| DELETE | `/admin/users/{id}` | Kullanıcı sil |

---

## 10. Members - Üyeler

**URL**: `/dashboard/members`  
**Dosya**: `src/app/(dashboard)/dashboard/members/page.tsx`

### 10.1 Sayfa Yapısı

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (h-16)                                               │
│ Title (X ev, Y üye) + Search + Status + "Üye Davet Et"      │
├─────────────────────────────────────────────────────────────┤
│ FILTERS                                                     │
│ [Tümü] [Adminler] [Sakinler] [Misafirler]  | Ev: [▼ Tümü]   │
├─────────────────────────────────────────────────────────────┤
│ SECTION: Aile & Sakinler                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ MEMBER CARD │ │ MEMBER CARD │ │ MEMBER CARD │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
├─────────────────────────────────────────────────────────────┤
│ SECTION: Misafir Anahtarları                                │
│ ┌───────────────────────────────────────────────────────────┐
│ │ 🕐 Guest 1 | Geçici Erişim | [Ev 1] [Ev 2]               │
│ └───────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### 10.2 Filter Buttons (Capsule Style)

```html
<div class="flex gap-2 overflow-x-auto pb-2">
  <!-- Aktif -->
  <button class="flex items-center px-4 h-10 rounded-xl text-sm font-medium whitespace-nowrap bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
    Tümü
  </button>
  
  <!-- İnaktif -->
  <button class="flex items-center px-4 h-10 rounded-xl text-sm font-medium whitespace-nowrap bg-white dark:bg-surface-dark ring-1 ring-slate-200 dark:ring-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50">
    Adminler
  </button>
</div>
```

### 10.3 Home Filter Dropdown

```html
<div class="flex items-center gap-2">
  <Building2 size={16} class="text-slate-400" />
  <select class="px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20">
    <option value="all">Tüm Evler</option>
    <option value="home-1">Ana Ev</option>
    <option value="home-2">Yazlık</option>
  </select>
</div>
```

### 10.4 Member Card

```html
<div class="bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
  <!-- Header -->
  <div class="flex items-start justify-between mb-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
        A
      </div>
      <div>
        <h4 class="font-semibold text-slate-900 dark:text-white">Admin User</h4>
        <p class="text-sm text-slate-500">admin@faber.com</p>
      </div>
    </div>
    <span class="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
      Admin
    </span>
  </div>
  
  <!-- Homes -->
  <div class="flex flex-wrap gap-1 mb-4">
    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
      <Home size={12} />
      Ana Ev
    </span>
    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
      <Home size={12} />
      Yazlık
    </span>
  </div>
  
  <!-- Footer -->
  <div class="flex items-center justify-between text-sm">
    <span class="text-slate-500">Tam yetki</span>
    <span class="flex items-center gap-1 text-green-600">
      <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
      Evde
    </span>
  </div>
</div>
```

### 10.5 Guest Row

```html
<div class="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4 hover:border-primary/30 transition-all">
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
      <Clock size={24} />
    </div>
    <div>
      <h4 class="text-base font-bold text-slate-900 dark:text-white">Misafir Kullanıcı</h4>
      <p class="text-xs text-slate-500">Geçici Erişim</p>
    </div>
  </div>
  
  <!-- Homes -->
  <div class="flex flex-wrap gap-1">
    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
      <Home size={12} />
      Ana Ev
    </span>
  </div>
</div>
```

### 10.6 API İstekleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/homes` | Tüm evleri getir |
| GET | `/users/sub?homeId={id}` | Ev için üyeleri getir |
| POST | `/users/sub/invite` | Üye davet et |
| DELETE | `/users/sub/{id}` | Üyeyi kaldır |

---

## 11. Ortak Bileşenler

### 11.1 Standard Header Pattern

Her sayfada kullanılan tutarlı header yapısı:

```html
<header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
  <!-- Sol: Başlık -->
  <div class="flex items-center gap-6">
    <div class="flex flex-col">
      <h1 class="text-lg font-bold text-gray-900 dark:text-white">{Sayfa Adı}</h1>
      <span class="text-xs text-gray-500">{Alt başlık}</span>
    </div>
  </div>

  <!-- Orta: Arama (opsiyonel) -->
  <div class="flex-1 max-w-md mx-8 hidden md:block">
    <!-- Search input -->
  </div>

  <!-- Sağ: Status + Action -->
  <div class="flex items-center gap-4">
    <!-- Connection Status -->
    <!-- Notification Button -->
    <!-- Primary Action Button -->
  </div>
</header>
```

### 11.2 Primary Action Button

```html
<button class="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white px-4 py-2 shadow-sm transition-all active:scale-95 text-sm font-semibold">
  <Plus size={18} />
  <span>{Aksiyon Adı}</span>
</button>
```

### 11.3 Connection Status Badge

```html
<div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800">
  <span class="text-xs font-medium text-gray-500">Sistem Durumu</span>
  <div class="flex items-center gap-1.5">
    <!-- Çevrimiçi -->
    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
    <span class="text-xs font-semibold text-green-600 dark:text-green-400">Çevrimiçi</span>
    
    <!-- Çevrimdışı -->
    <!-- <span class="w-2 h-2 rounded-full bg-red-500"></span>
    <span class="text-xs font-semibold text-red-600">Çevrimdışı</span> -->
  </div>
</div>
```

### 11.4 Notification Button

```html
<button class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
  <Bell class="w-5 h-5 text-gray-500" />
  <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
</button>
```

### 11.5 Search Input

```html
<div class="relative">
  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input
    type="text"
    placeholder="{Placeholder}..."
    class="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder-gray-400 text-gray-900 dark:text-white transition-all"
  />
</div>
```

### 11.6 Modal Dialog

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div class="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl p-6 shadow-2xl">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">{Modal Başlığı}</h3>
      <button><X class="text-slate-400 hover:text-slate-600" /></button>
    </div>
    
    <!-- Content -->
    <div class="space-y-4">
      {/* Form fields veya içerik */}
    </div>
    
    <!-- Actions -->
    <div class="pt-4 flex gap-3 justify-end">
      <button class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">İptal</button>
      <button class="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
        {Aksiyon}
      </button>
    </div>
  </div>
</div>
```

### 11.7 Loading State

```html
<!-- Spinner with text -->
<div class="flex flex-col items-center justify-center py-20 gap-4">
  <Loader2 size={40} class="animate-spin text-primary" />
  <span class="text-slate-500">Yükleniyor...</span>
</div>

<!-- Skeleton cards -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
  <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
  <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
</div>
```

### 11.8 Empty State

```html
<div class="flex flex-col items-center justify-center py-16 gap-4">
  <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
    <{Icon} class="w-10 h-10 text-gray-400" />
  </div>
  <h3 class="text-xl font-bold text-gray-900 dark:text-white">{Başlık}</h3>
  <p class="text-gray-500 text-center max-w-md">{Açıklama}</p>
  <button class="mt-4 flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold">
    <Plus size={20} />
    <span>{Aksiyon}</span>
  </button>
</div>
```

### 11.9 Toast Messages

```html
<!-- Success -->
<div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
  <CheckCircle size={20} />
  <span class="font-medium">{Mesaj}</span>
</div>

<!-- Error -->
<div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
  <AlertCircle size={20} />
  <span class="font-medium">{Hata mesajı}</span>
</div>
```

---

## 12. Mobil Adaptasyon Notları

### 12.1 Responsive Breakpoints

```css
/* Tailwind Breakpoints */
sm: 640px    /* Telefon (landscape) */
md: 768px    /* Tablet (portrait) */
lg: 1024px   /* Tablet (landscape) / Küçük laptop */
xl: 1280px   /* Desktop */
2xl: 1536px  /* Büyük ekran */
```

### 12.2 Tablet Modu (md+)

Tablet modunda sidebar gösterilir ve içerik yan yana yerleşir:

```
┌────────────┬───────────────────────────────┐
│ SIDEBAR    │ MAIN CONTENT                  │
│ (w-64)     │ (flex-1)                      │
│            │                               │
│ [Menu]     │ [Page Content]                │
│            │                               │
└────────────┴───────────────────────────────┘
```

### 12.3 Telefon Modu (< md)

Telefon modunda bottom tabs kullanılır:

```
┌───────────────────────────────────────────┐
│ HEADER                                    │
├───────────────────────────────────────────┤
│                                           │
│ MAIN CONTENT                              │
│ (Full width)                              │
│                                           │
├───────────────────────────────────────────┤
│ BOTTOM TABS                               │
│ [🏠] [💡] [⚡] [👥] [⚙️]                   │
└───────────────────────────────────────────┘
```

### 12.4 Dokunmatik Uyumlu Boyutlar

```css
/* Minimum dokunma alanı */
min-height: 44px;
min-width: 44px;

/* Butonlar için önerilen boyutlar */
padding: 12px 16px;  /* py-3 px-4 */
border-radius: 12px; /* rounded-xl */

/* Tablo satırları için */
padding: 16px;       /* p-4 */
```

### 12.5 Native Bileşen Karşılıkları

| Web Component | React Native Karşılığı |
|---------------|------------------------|
| `<div>` | `<View>` |
| `<p>`, `<span>`, `<h1>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` | `<TouchableOpacity>` veya `<Pressable>` |
| `<img>` | `<Image>` |
| `<table>` | `<FlatList>` veya `<FlashList>` |
| `overflow-y-auto` | `<ScrollView>` |
| CSS Grid | `flexWrap: 'wrap'` ile `<View>` |

### 12.6 Icon Kütüphanesi

```typescript
// Web (lucide-react)
import { Home, Settings, Bell } from 'lucide-react';

// Mobile (lucide-react-native veya Ionicons)
import { Home, Settings, Bell } from 'lucide-react-native';
// veya
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="home-outline" size={24} color="#3B82F6" />
```

### 12.7 Dark Mode Desteği

```typescript
// ThemeContext kullanarak
const { isDark } = useTheme();

// StyleSheet'te koşullu stiller
const styles = StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
  },
  text: {
    color: isDark ? '#FFFFFF' : '#111827',
  },
});
```

### 12.8 Safe Area Handling

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<View style={{ 
  paddingTop: insets.top,
  paddingBottom: insets.bottom,
  paddingLeft: insets.left,
  paddingRight: insets.right,
}}>
  {/* Content */}
</View>
```

---

## Özet

Bu dokümantasyon, `faber_webAdmin` projesindeki 9 dashboard ekranının:

1. **HTML/CSS yapısını** (Tailwind class'ları ile)
2. **API endpoint'lerini** (GET/POST/PATCH/DELETE)
3. **State yönetimini** (loading, error, empty states)
4. **Etkileşimlerini** (click, toggle, modal)
5. **Responsive davranışlarını** (tablet/telefon)

detaylı olarak açıklamaktadır.

Bu bilgiler kullanılarak:
- React Native ile native mobil ekranlar
- SwiftUI ile iOS uygulamaları
- Kotlin/Jetpack Compose ile Android uygulamaları
- Herhangi başka bir UI framework ile uygulamalar

oluşturulabilir.

---

*Son güncelleme: Şubat 2026*
*Versiyon: 1.0*
