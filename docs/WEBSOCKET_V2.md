# WebSocket Service v2.0 - Frontend Guide

## Overview

Bu döküman, Faber Backend v2.0 Enterprise Architecture ile uyumlu WebSocket servisinin kullanımını açıklar.

## Özellikler

- ✅ **Room-based Broadcasting**: Sadece ilgili ev üyelerine mesaj gönderimi
- ✅ **Real-time Telemetry**: ESP32 cihazlarından anlık veri akışı
- ✅ **State Restoration**: Bağlantı koptuğunda otomatik yeniden abone olma
- ✅ **Graceful Shutdown**: Sunucu yeniden başlatmalarında akıllı yeniden bağlanma
- ✅ **Exponential Backoff**: Bağlantı hatalarında kademeli bekleme

## Temel Kullanım

### 1. Eve Katılma (Zorunlu)

Telemetri almak için önce bir eve katılmanız gerekir:

```tsx
import { useSocket } from '@/contexts/SocketContext';

function Dashboard() {
  const { joinHome, leaveHome, currentHomeId } = useSocket();
  
  useEffect(() => {
    if (selectedHomeId) {
      joinHome(selectedHomeId);
    }
    
    return () => {
      if (selectedHomeId) {
        leaveHome(selectedHomeId);
      }
    };
  }, [selectedHomeId]);
}
```

### 2. Cihaz Telemetrisi Dinleme

```tsx
import { useTelemetry } from '@/hooks/useTelemetry';

function DeviceCard({ deviceId }: { deviceId: string }) {
  const { latestData, history } = useTelemetry(deviceId, {
    onUpdate: (data) => {
      console.log('Yeni telemetri:', data.payload);
    }
  });
  
  return (
    <div>
      <p>Sıcaklık: {latestData?.payload?.temperature}°C</p>
      <p>Nem: {latestData?.payload?.humidity}%</p>
    </div>
  );
}
```

### 3. Tüm Telemetriyi Dinleme

```tsx
import { useAllTelemetry } from '@/hooks/useTelemetry';

function TelemetryDashboard() {
  const { telemetryByDevice, getDeviceTelemetry } = useAllTelemetry({
    onUpdate: (data) => {
      console.log(`Cihaz ${data.deviceId}:`, data.payload);
    }
  });
  
  return (
    <div>
      {Array.from(telemetryByDevice.entries()).map(([deviceId, data]) => (
        <div key={deviceId}>
          <h3>{deviceId}</h3>
          <pre>{JSON.stringify(data.payload, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
```

### 4. Dashboard Güncellemelerini Dinleme

```tsx
import { useSocket } from '@/contexts/SocketContext';

function Dashboard() {
  const { onDashboardUpdate } = useSocket();
  
  useEffect(() => {
    const unsubscribe = onDashboardUpdate((homeId) => {
      console.log('Dashboard güncellendi:', homeId);
      // Dashboard verilerini yeniden yükle
      refetchDashboard();
    });
    
    return unsubscribe;
  }, []);
}
```

## Mesaj Tipleri

| Tip | Açıklama |
|-----|----------|
| `device_telemetry` | ESP32'den gelen anlık sensör verileri |
| `device_update` | Cihaz durum değişiklikleri |
| `dashboard:layout_updated` | Server-Driven UI güncellemeleri |
| `SHUTDOWN` | Sunucu graceful shutdown bildirimi |

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Web/Mobile)                     │
├─────────────────────────────────────────────────────────────┤
│  WebSocketService (Singleton)                                │
│  ├── Auto-reconnect (Exponential Backoff)                   │
│  ├── State Restoration (Home + Device subscriptions)        │
│  ├── Message Queue (Offline support)                        │
│  └── Event Emitter Pattern                                  │
├─────────────────────────────────────────────────────────────┤
│  SocketContext (React Context)                               │
│  ├── joinHome() / leaveHome()                               │
│  ├── onDeviceTelemetry() / onAllTelemetry()                │
│  └── onDashboardUpdate()                                    │
├─────────────────────────────────────────────────────────────┤
│  Hooks                                                       │
│  ├── useSocket() - Connection state & room management       │
│  ├── useTelemetry() - Single device telemetry               │
│  └── useAllTelemetry() - All devices telemetry              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Native WebSocket
                              │ wss://api.example.com/ws?token=xxx
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend v2.0 (Go)                         │
├─────────────────────────────────────────────────────────────┤
│  WebSocket Hub                                               │
│  ├── Room-based Broadcasting (home:{homeId})                │
│  ├── Marshal Once, Send Many (Performance)                  │
│  └── Slow Consumer Handling (Data Integrity)                │
├─────────────────────────────────────────────────────────────┤
│  Redis Cache                                                 │
│  └── device:home:{mac} → homeId (<1ms lookup)               │
├─────────────────────────────────────────────────────────────┤
│  RabbitMQ                                                    │
│  ├── Telemetry Queue → TimescaleDB Worker                   │
│  └── Horizontal Scaling (Hub Sync)                          │
└─────────────────────────────────────────────────────────────┘
```

## Güvenlik

- ✅ JWT token ile kimlik doğrulama (query parameter)
- ✅ Room-based isolation (sadece ev üyeleri telemetri alır)
- ✅ Redis cache invalidation (cihaz taşındığında)

## Performans İpuçları

1. **Gereksiz subscription'lardan kaçının**: Sadece görüntülenen cihazlar için telemetri dinleyin
2. **History limitlerini kullanın**: `useTelemetry` varsayılan olarak son 100 kaydı tutar
3. **Cleanup yapın**: Component unmount olduğunda subscription'ları temizleyin

## Sorun Giderme

### Telemetri gelmiyor
1. `joinHome(homeId)` çağrıldığından emin olun
2. Cihazın doğru eve atandığını kontrol edin
3. WebSocket bağlantısının aktif olduğunu doğrulayın (`isConnected`)

### Bağlantı kopuyor
- Sunucu `SHUTDOWN` mesajı göndermiş olabilir (graceful restart)
- Network sorunları için exponential backoff otomatik çalışır
- Max 10 deneme sonrası bağlantı durdurulur
