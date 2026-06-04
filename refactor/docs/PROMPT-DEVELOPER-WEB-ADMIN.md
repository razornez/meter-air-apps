# Prompt untuk Developer Admin Web

**Konteks proyek:**
Sistem meter air PDAM/BUMDES. Ada dua aplikasi yang harus sinkron:
1. **Mobile apps** (React Native/Expo, sudah selesai) — dipakai petugas lapangan
2. **Admin web** (Laravel 11 + Blade + Tailwind, ada di `/htdocs/meter-air`) — dipakai admin/kasir di kantor

Database MySQL `pdam` dipakai bersama. Backend API terpisah di NestJS (port 4000).

---

## Task 1 — Payment Gateway (sinkron dengan mobile apps)

### Kondisi saat ini di admin web

File-file yang sudah ada dan **JANGAN dihapus**:
- `app/Services/PembayaranService.php` — sudah ada integrasi Midtrans Snap
- `app/Http/Controllers/PembayaranController.php` — sudah ada `tandaiLunas`, `qris`, `snapToken`
- `resources/views/pembayaran/qris.blade.php` — sudah ada tampilan QRIS lokal
- Package `midtrans/midtrans-php: ^2.6` sudah terpasang di composer
- Package `endroid/qr-code` sudah terpasang untuk QRIS lokal

### Yang perlu ditambahkan / diubah

#### 1.1 Sinkronkan tabel `payment_method` sebagai master metode pembayaran

Tabel `payment_method` sudah ada di DB `pdam` dengan struktur:

```sql
CREATE TABLE payment_method (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  code         VARCHAR(30) UNIQUE,
  name         VARCHAR(100),
  type         VARCHAR(20),   -- 'cash' | 'ewallet' | 'bank_static' | 'midtrans'
  is_active    TINYINT(1),
  icon         VARCHAR(10),
  logo_bg      VARCHAR(12),   -- hex color brand (mis. '#4C3494' untuk OVO)
  logo_text    VARCHAR(12),   -- teks singkat (mis. 'OVO')
  logo_url     VARCHAR(255),  -- URL gambar logo (nullable)
  instructions TEXT,
  account_number VARCHAR(50), -- nomor rekening/e-wallet perusahaan
  account_name VARCHAR(100),
  sort_order   INT
);
```

Data yang sudah ada (11 metode aktif): `cash`, `gopay`, `ovo`, `dana`, `shopeepay`,
`bank_bca`, `bank_mandiri`, `bank_bni`, `bank_bri`, `midtrans_qris`, `midtrans_card` (nonaktif).

**Buat Model Laravel:**
```php
// app/Models/PaymentMethod.php
class PaymentMethod extends Model {
    protected $table = 'payment_method';
    protected $fillable = ['code','name','type','is_active','logo_bg','logo_text',
                           'logo_url','instructions','account_number','account_name','sort_order'];
    protected $casts = ['is_active' => 'boolean'];
    
    public function scopeActive($q) { return $q->where('is_active', 1)->orderBy('sort_order'); }
}
```

#### 1.2 Halaman detail faktur — tampilkan pilihan metode bayar

Di `resources/views/faktur/show.blade.php` (atau detail billing), **ganti/tambah** tombol
"Tandai Lunas" menjadi tombol yang membuka modal pilih metode bayar:

```html
@if(!$faktur->is_lunas)
<button type="button" onclick="openPayModal()" 
        class="btn btn-primary">
    💳 Proses Pembayaran
</button>
@endif

<!-- Modal Pilih Metode -->
<div id="payModal" class="modal fade" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5>Pilih Metode Pembayaran</h5>
        <div class="fw-bold">Rp {{ number_format($faktur->total) }}</div>
      </div>
      <div class="modal-body p-0">
        @foreach($paymentMethods->groupBy('type') as $type => $methods)
          <div class="px-3 pt-3 pb-1 text-muted small fw-bold text-uppercase">
            {{ ['cash'=>'Tunai','ewallet'=>'Dompet Digital',
                'bank_static'=>'Transfer Bank','midtrans'=>'Gateway'][$type] ?? $type }}
          </div>
          @foreach($methods as $method)
          <a href="#" class="d-flex align-items-center px-3 py-2 border-bottom
                             text-decoration-none text-dark pay-option"
             data-code="{{ $method->code }}" data-type="{{ $method->type }}"
             data-name="{{ $method->name }}">
            {{-- Logo brand --}}
            <div style="width:40px;height:40px;border-radius:10px;
                        background:{{ $method->logo_bg }};
                        display:flex;align-items:center;justify-content:center;
                        color:#fff;font-weight:900;font-size:11px;flex-shrink:0">
              {{ $method->logo_text }}
            </div>
            <div class="ms-3 flex-grow-1">
              <div class="fw-semibold">{{ $method->name }}</div>
              @if($method->account_number)
              <small class="text-muted">{{ $method->account_number }}</small>
              @endif
            </div>
            <span class="text-muted">›</span>
          </a>
          @endforeach
        @endforeach
      </div>
    </div>
  </div>
</div>
```

#### 1.3 Controller — route per tipe metode

Tambahkan method `prosesBayar` di `PembayaranController`:

```php
public function prosesBayar(Request $request, Faktur $faktur)
{
    $request->validate(['method_code' => 'required|string']);
    $method = PaymentMethod::where('code', $request->method_code)
                           ->where('is_active', 1)->firstOrFail();

    return match($method->type) {
        'cash'        => $this->proseCash($faktur, $method, $request),
        'ewallet',
        'bank_static' => $this->proseTransfer($faktur, $method, $request),
        'midtrans'    => $this->proseMidtrans($faktur, $method, $request),
        default       => back()->with('error', 'Metode tidak dikenal'),
    };
}
```

**Tipe `cash`** — langsung lunas, tampilkan kalkulator kembalian:
```php
private function proseCash(Faktur $faktur, PaymentMethod $method, Request $request)
{
    // Tampilkan halaman kalkulator kembalian (GET) atau proses (POST)
    if ($request->isMethod('get')) {
        return view('pembayaran.cash', compact('faktur', 'method'));
    }
    $request->validate(['jumlah_diterima' => 'required|integer|min:' . $faktur->total]);
    $this->pembayaran->tandaiLunas($faktur, 'cash', $request->jumlah_diterima, $request->user());
    return redirect()->route('faktur.show', $faktur)->with('status', 'Pembayaran tunai berhasil.');
}
```

**Tipe `ewallet` / `bank_static`** — tampilkan info rekening, konfirmasi manual:
```php
private function proseTransfer(Faktur $faktur, PaymentMethod $method, Request $request)
{
    if ($request->isMethod('get')) {
        return view('pembayaran.transfer', compact('faktur', 'method'));
    }
    // Kasir konfirmasi sudah menerima → tandai lunas
    $this->pembayaran->tandaiLunas($faktur, $method->code, $faktur->total, $request->user());
    return redirect()->route('faktur.show', $faktur)->with('status', "Pembayaran {$method->name} dikonfirmasi lunas.");
}
```

**Tipe `midtrans`** — buat Snap token lalu tampilkan Snap UI:
```php
private function proseMidtrans(Faktur $faktur, PaymentMethod $method, Request $request)
{
    // Midtrans enabled_payments per kode metode
    $enabledMap = ['midtrans_qris' => ['other_qris','qris'], 'midtrans_card' => ['credit_card']];
    $enabled = $enabledMap[$method->code] ?? [];

    $snapToken = $this->pembayaran->buatSnapToken($faktur, $enabled);
    return view('pembayaran.midtrans', compact('faktur', 'method', 'snapToken'));
}
```

Pastikan `PembayaranService::buatSnapToken()` menerima parameter `$enabledPayments`:
```php
public function buatSnapToken(Faktur $faktur, array $enabledPayments = []): string
{
    self::initMidtrans();
    $params = [
        'transaction_details' => [
            'order_id'     => str_replace('/', '-', $faktur->no_faktur) . '-' . time(),
            'gross_amount' => (int) $faktur->total,
        ],
        'item_details' => [
            ['id' => 'tagihan', 'price' => (int) $faktur->total, 'quantity' => 1,
             'name' => 'Tagihan Air - ' . $faktur->no_faktur],
        ],
        'customer_details' => [
            'first_name' => $faktur->customer?->nama ?? 'Pelanggan',
            'phone'      => preg_replace('/[^0-9+]/', '', $faktur->customer?->telp ?? ''),
        ],
        'custom_field1' => $faktur->no_faktur,
    ];
    if (!empty($enabledPayments)) {
        $params['enabled_payments'] = $enabledPayments;
    }
    return Snap::getSnapToken($params);
}
```

#### 1.4 View-view yang perlu dibuat

**`resources/views/pembayaran/cash.blade.php`** — kalkulator kembalian:
```html
@extends('layouts.app')
@section('content')
<div class="container max-w-lg mx-auto py-6">
  <div class="card shadow">
    <div class="card-header bg-success text-white">
      <h5 class="mb-0">💵 Pembayaran Tunai</h5>
    </div>
    <div class="card-body">
      <div class="alert alert-info">
        <strong>Total Tagihan:</strong>
        <span class="fs-4 fw-bold ms-2">Rp {{ number_format($faktur->total) }}</span>
      </div>
      <form method="POST" action="{{ route('pembayaran.proses-post', $faktur) }}">
        @csrf
        <input type="hidden" name="method_code" value="cash">
        <div class="mb-3">
          <label class="form-label fw-semibold">Uang Diterima (Rp)</label>
          <input type="number" name="jumlah_diterima" id="jumlah_diterima"
                 class="form-control form-control-lg"
                 min="{{ $faktur->total }}" required
                 oninput="hitungKembalian()">
        </div>
        {{-- Tombol nominal cepat --}}
        <div class="d-flex gap-2 mb-3 flex-wrap">
          @foreach([50000,100000,200000,500000] as $nom)
          <button type="button" class="btn btn-outline-secondary btn-sm"
                  onclick="setNominal({{ $nom }})">
            {{ number_format($nom/1000) }}rb
          </button>
          @endforeach
        </div>
        <div class="alert" id="kembalianBox" style="display:none">
          <strong>Kembalian:</strong>
          <span id="kembalianVal" class="fs-4 fw-bold ms-2"></span>
        </div>
        <button type="submit" class="btn btn-success btn-lg w-100">
          ✅ Konfirmasi Lunas
        </button>
      </form>
    </div>
  </div>
</div>
<script>
function setNominal(v) { document.getElementById('jumlah_diterima').value = v; hitungKembalian(); }
function hitungKembalian() {
  const tagihan = {{ $faktur->total }};
  const diterima = parseInt(document.getElementById('jumlah_diterima').value) || 0;
  const box = document.getElementById('kembalianBox');
  const val = document.getElementById('kembalianVal');
  if (diterima >= tagihan) {
    box.className = 'alert alert-success'; box.style.display = '';
    val.textContent = 'Rp ' + (diterima - tagihan).toLocaleString('id-ID');
  } else {
    box.className = 'alert alert-danger'; box.style.display = '';
    val.textContent = 'Kurang Rp ' + (tagihan - diterima).toLocaleString('id-ID');
  }
}
</script>
@endsection
```

**`resources/views/pembayaran/transfer.blade.php`** — info rekening + konfirmasi:
```html
@extends('layouts.app')
@section('content')
<div class="container max-w-lg mx-auto py-6">
  <div class="card shadow">
    <div class="card-header text-white" style="background: {{ $method->logo_bg }}">
      <div class="d-flex align-items-center gap-3">
        {{-- Logo brand --}}
        <div style="width:44px;height:44px;border-radius:12px;
                    background:rgba(255,255,255,0.2);
                    display:flex;align-items:center;justify-content:center;
                    color:#fff;font-weight:900;font-size:13px">
          {{ $method->logo_text }}
        </div>
        <div>
          <h5 class="mb-0">{{ $method->name }}</h5>
          <small class="opacity-75">{{ $method->type === 'ewallet' ? 'Dompet Digital' : 'Transfer Bank' }}</small>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="bg-dark text-white rounded-3 p-3 mb-3">
        <small class="text-white-50">JUMLAH YANG DITRANSFER</small>
        <div class="fs-2 fw-bold">Rp {{ number_format($faktur->total) }}</div>
      </div>
      @if($method->account_number)
      <div class="card mb-3">
        <div class="card-body">
          <label class="text-muted small fw-bold text-uppercase">
            Nomor {{ $method->type === 'ewallet' ? 'Akun' : 'Rekening' }}
          </label>
          <div class="d-flex align-items-center gap-2 mt-1">
            <span class="fs-4 fw-bold font-monospace" id="noRek">
              {{ $method->account_number }}
            </span>
            <button class="btn btn-sm btn-outline-secondary"
                    onclick="navigator.clipboard.writeText('{{ $method->account_number }}')
                             .then(()=>this.textContent='✓ Disalin')">
              Salin
            </button>
          </div>
          @if($method->account_name)
          <div class="text-muted mt-1">Atas nama: <strong>{{ $method->account_name }}</strong></div>
          @endif
        </div>
      </div>
      @else
      <div class="alert alert-warning">
        ⚠️ Nomor rekening belum diisi. Update di tabel <code>payment_method</code>.
      </div>
      @endif
      @if($method->instructions)
      <div class="alert alert-light border">
        <strong>📋 Petunjuk:</strong><br>{{ $method->instructions }}
      </div>
      @endif
      <form method="POST" action="{{ route('pembayaran.proses-post', $faktur) }}">
        @csrf
        <input type="hidden" name="method_code" value="{{ $method->code }}">
        <button type="submit" class="btn btn-lg w-100 text-white fw-bold"
                style="background: {{ $method->logo_bg }}"
                onclick="return confirm('Konfirmasi sudah menerima transfer dari pelanggan?')">
          ✅ Sudah Transfer — Tandai Lunas
        </button>
      </form>
    </div>
  </div>
</div>
@endsection
```

**`resources/views/pembayaran/midtrans.blade.php`** — Snap UI:
```html
@extends('layouts.app')
@section('content')
<div class="container py-4">
  <div id="snap-container"></div>
</div>
<script src="https://app.midtrans.com/snap/snap.js"
        data-client-key="{{ config('pembayaran.midtrans.client_key') }}"></script>
<script>
  window.onload = function() {
    snap.pay('{{ $snapToken }}', {
      onSuccess: function(res) {
        window.location.href = '{{ route('faktur.show', $faktur) }}?payment=success';
      },
      onPending: function(res) {
        window.location.href = '{{ route('faktur.show', $faktur) }}?payment=pending';
      },
      onError: function(res) {
        window.location.href = '{{ route('faktur.show', $faktur) }}?payment=error';
      },
      onClose: function() { history.back(); }
    });
  };
</script>
@endsection
```

#### 1.5 Routes yang ditambahkan

```php
// routes/web.php — dalam group yang sudah ada (auth, tenant, dll)
Route::get('/faktur/{faktur}/bayar/{methodCode}', [PembayaranController::class, 'prosesBayar'])
     ->name('pembayaran.proses');
Route::post('/faktur/{faktur}/bayar', [PembayaranController::class, 'prosesBayar'])
     ->name('pembayaran.proses-post');
```

#### 1.6 Config Midtrans

Pastikan `config/pembayaran.php` punya:
```php
'midtrans' => [
    'server_key'    => env('MIDTRANS_SERVER_KEY'),
    'client_key'    => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized'  => true,
    'is_3ds'        => true,
],
'snap_aktif' => env('MIDTRANS_SNAP_AKTIF', false),
```

Dan `.env` diisi:
```
MIDTRANS_SERVER_KEY=<salin dari refactor/api/.env>
MIDTRANS_CLIENT_KEY=<salin dari refactor/api/.env>
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SNAP_AKTIF=true
```

---

## Task 2 — Kartu Anggota / Kartu Pelanggan

### Kondisi saat ini

File `resources/views/pelanggan/kartu.blade.php` sudah ada tapi mungkin berbeda design.
Controller sudah ada di `PelangganController`.
Package `endroid/qr-code` sudah terpasang.
Package `barryvdh/laravel-dompdf` sudah terpasang untuk PDF.

### Design yang harus disamakan persis dengan mobile apps

Design di mobile apps (`CustomerCardScreen.tsx`) menggunakan layout berikut — terapkan
PERSIS SAMA di kartu PHP/dompdf:

```
┌─────────────────────────────────────────────────────────┐  323px
│ [💧 icon]  BUMDES KIANGROKE 2016    KARTU PELANGGAN AIR │  38px biru #0277BD
├─────────────────────────────────────────────────────────┤  3px garis #0277BD
│                                          ┌───────────┐  │
│ DENI FARSITO                             │  QR CODE  │  │
│ Kiangroke                                │  (90px)   │  │
│                                          │           │  │
│ ┌──────────────────┐  ┌───┐              └───────────┘  │
│ │ NO. PELANGGAN    │  │ B │              Scan meter      │
│ │ 200212011        │  │   │                              │
│ └──────────────────┘  └───┘                              │
│────────────────────────────────────────────────────────  │
│ 📞 0812-3456-7890  │  📍 Kiangroke Kab. Bandung          │  biru muda bg
└─────────────────────────────────────────────────────────┘  204px total
```

**Warna:** header `#0277BD`, garis aksen `#0277BD`, ID box bg `#F0F7FF`, tipe box bg `#E8F5E9`, footer bg `#F0F7FF`

**Font:** DejaVu Sans (sudah ada di dompdf)

**QR Code:** isi = ID pelanggan (mis. `200212011`), pakai `endroid/qr-code` dengan output SVG/PNG 90×90px, warna hitam di background putih, margin 1.

### Implementasi di Laravel

```php
// PelangganController.php — method kartu()
public function kartu(Customer $customer): \Illuminate\Http\Response
{
    $config = \App\Models\Config::first(); // ambil nama perusahaan, telp, alamat

    // Generate QR Code
    $qrResult = Builder::create()
        ->writer(new \Endroid\QrCode\Writer\PngWriter())
        ->data((string) $customer->id)
        ->size(90)->margin(2)
        ->build();
    $qrBase64 = base64_encode($qrResult->getString());

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pelanggan.kartu', [
        'customer' => $customer,
        'config'   => $config,
        'qrBase64' => $qrBase64,
    ]);

    $pdf->setPaper([0, 0, 242.7, 153.1]); // ukuran kartu (323×204 px → pt)

    return $pdf->stream("kartu-{$customer->id}.pdf");
}
```

### Template `kartu.blade.php` yang benar (dompdf-compatible)

> Gunakan **table layout** (bukan flexbox/grid — dompdf tidak support).
> Ukuran pixel pada 96 dpi: 323×204px.

```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; font-family: "DejaVu Sans", Arial, sans-serif; }
html, body { width:323px; height:204px; background:#fff; overflow:hidden; }

/* HEADER */
.hdr { background:#0277BD; width:323px; height:38px; }
.hdr table { width:323px; height:38px; border-collapse:collapse; }
.hdr td { vertical-align:middle; }
.td-logo { width:46px; padding-left:12px; }
.logo-box { width:26px; height:26px; background:rgba(255,255,255,0.2);
            border-radius:6px; text-align:center; line-height:28px;
            color:#fff; font-size:15px; }
.td-info { padding-left:6px; }
.co-name { font-size:9px; font-weight:bold; color:#fff; letter-spacing:0.4px; }
.co-sub  { font-size:6px; color:rgba(255,255,255,0.8); }
.td-badge { width:72px; padding-right:12px; text-align:right; }
.badge-card { display:inline-block; background:rgba(255,255,255,0.22);
              color:#fff; font-size:6.5px; font-weight:bold;
              padding:2px 7px; border-radius:3px; letter-spacing:0.5px; }

/* AKSEN BIRU */
.accent { background:#0277BD; height:3px; width:323px; }

/* BODY */
.bdy { width:323px; height:139px; }
.bdy table { width:323px; height:139px; border-collapse:collapse; }
.td-info-main { width:195px; vertical-align:top; padding:12px 0 0 14px; }
.td-qr { width:116px; vertical-align:top; padding:10px 14px 0 8px; text-align:center; }

.nama { font-size:12px; font-weight:bold; color:#1A2530; }
.alamat { font-size:8px; color:#6B7A8D; margin-top:3px; }

/* ID + TIPE */
.id-row { margin-top:8px; }
.id-row table { border-collapse:collapse; }
.id-box { background:#F0F7FF; border-radius:6px; padding:5px 8px; }
.id-lbl { font-size:7px; font-weight:bold; color:#0277BD; letter-spacing:0.5px; }
.id-val { font-size:12px; font-weight:900; color:#1A2530; }
.tipe-box { background:#E8F5E9; border-radius:6px; padding:5px 6px;
            text-align:center; margin-left:6px; width:38px; }
.tipe-lbl { font-size:7px; font-weight:bold; color:#2E7D32; letter-spacing:0.5px; }
.tipe-val { font-size:18px; font-weight:900; color:#1A2530; }

/* QR */
.qr-wrap { width:90px; border:1px solid #E1E8EF; border-radius:6px;
           padding:4px; background:#fff; display:inline-block; }
.qr-cap  { font-size:7.5px; color:#6B7A8D; margin-top:4px; text-align:center; }

/* FOOTER */
.ftr { background:#F0F7FF; width:323px; height:24px; }
.ftr table { width:323px; height:24px; border-collapse:collapse; }
.ftr td { vertical-align:middle; padding:0 10px; font-size:7.5px; color:#0277BD; }
</style>
</head>
<body>

{{-- HEADER --}}
<div class="hdr">
  <table><tr>
    <td class="td-logo"><div class="logo-box">💧</div></td>
    <td class="td-info">
      <div class="co-name">{{ strtoupper($config->perusahaan ?? 'PDAM / BUMDES') }}</div>
      <div class="co-sub">{{ $config->alamat ?? '' }}</div>
    </td>
    <td class="td-badge"><span class="badge-card">KARTU PELANGGAN AIR</span></td>
  </tr></table>
</div>

{{-- GARIS AKSEN --}}
<div class="accent"></div>

{{-- BODY --}}
<div class="bdy">
  <table><tr>
    {{-- KIRI: info pelanggan --}}
    <td class="td-info-main">
      <div class="nama">{{ $customer->nama }}</div>
      <div class="alamat">{{ $customer->alamat }}</div>

      <div class="id-row">
        <table><tr>
          <td>
            <div class="id-box">
              <div class="id-lbl">NO. PELANGGAN</div>
              <div class="id-val">{{ $customer->id }}</div>
            </div>
          </td>
          <td>
            <div class="tipe-box">
              <div class="tipe-lbl">TIPE</div>
              <div class="tipe-val">{{ $customer->tipe ?? '-' }}</div>
            </div>
          </td>
        </tr></table>
      </div>
    </td>

    {{-- KANAN: QR Code --}}
    <td class="td-qr">
      <div class="qr-wrap">
        <img src="data:image/png;base64,{{ $qrBase64 }}"
             width="82" height="82" style="display:block">
      </div>
      <div class="qr-cap">Scan meter</div>
    </td>
  </tr></table>
</div>

{{-- FOOTER --}}
<div class="ftr">
  <table><tr>
    <td>📞 {{ $config->telp ?? '-' }}</td>
    <td style="text-align:right">📍 {{ Str::limit($config->alamat ?? '', 45) }}</td>
  </tr></table>
</div>

</body>
</html>
```

### Tombol cetak kartu di halaman detail pelanggan

Di `resources/views/pelanggan/show.blade.php`:
```html
<a href="{{ route('pelanggan.kartu', $customer) }}" target="_blank"
   class="btn btn-outline-primary">
    🪪 Cetak / Unduh Kartu Pelanggan
</a>
```

Route:
```php
Route::get('/pelanggan/{customer}/kartu', [PelangganController::class, 'kartu'])
     ->name('pelanggan.kartu');
```

---

## Catatan penting

1. **Credentials Midtrans** — ambil dari file `.env` backend NestJS
   (`refactor/api/.env`, sudah dikonfigurasi, JANGAN di-commit ke repo):
   - `MIDTRANS_SERVER_KEY` → isi di `.env` Laravel sebagai `MIDTRANS_SERVER_KEY`
   - `MIDTRANS_CLIENT_KEY` → isi di `.env` Laravel sebagai `MIDTRANS_CLIENT_KEY`
   - `MIDTRANS_IS_PRODUCTION=true`
   - Mode: production (bukan sandbox)

2. **Sinkronkan tabel `payment_method`** — jangan hardcode metode di kode PHP. Semua metode dibaca dari DB sehingga admin bisa aktifkan/nonaktifkan via phpMyAdmin tanpa deploy ulang.

3. **Webhook Midtrans** sudah ada di `WebhookController` — pastikan URL webhook sudah dikonfigurasi di dashboard Midtrans: `https://[domain]/webhook/midtrans`

4. **Ukuran kartu PDF**: `setPaper([0, 0, 242.7, 153.1])` = kartu kredit standar (85.6 × 54mm). QR code isi = ID pelanggan numerik (mis. `200212011`).

5. **Data nomor rekening** sudah ada di tabel `payment_method`. Tidak perlu hardcode di view.
