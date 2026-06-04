# PROMPT SIAP COPY — Developer Admin Web

> Salin seluruh isi prompt ini dan berikan ke developer admin web (Laravel).
> Semua referensi sudah dalam bentuk commit hash yang bisa di-checkout.

---

## Konteks Proyek

Kamu adalah developer yang mengerjakan **admin web** aplikasi meter air PDAM/BUMDES.
Admin web berlokasi di `/htdocs/meter-air` (Laravel 11, Blade, Tailwind CSS).

Ada **mobile apps** petugas lapangan yang sudah selesai di repo yang sama
(`/htdocs/meter-air-apps/refactor/`). Database MySQL `pdam` dipakai bersama.

**Task kamu:** sinkronkan fitur payment gateway dan kartu pelanggan di admin web
agar persis sama dengan mobile apps.

---

## Referensi Commit Mobile Apps (GitHub: razornez/meter-air-apps, branch: main)

Berikut commit-commit yang sudah ada di mobile apps untuk payment gateway.
Baca diff-nya sebagai referensi implementasi.

```
# Commit utama payment gateway
1b9b9a0  S12: Midtrans payment gateway + kartu pelanggan
         → Menambahkan PaymentModule NestJS, PaymentWebViewScreen,
           CustomerCardScreen, tabel payment_method awal

e5cbff5  feat: multi payment method (cash/QRIS/GoPay/OVO/DANA/transfer) dari master DB
         → Migrasi 004_add_payment_method.sql, entity, service dispatch per tipe

d43f868  redesign: payment UI (brand logo, layar dedicated per tipe)
         → Migrasi 005_update_payment_method.sql (logo_bg, logo_text, logo_url),
           PaymentSelectScreen, CashPaymentScreen, AccountPaymentScreen, BrandLogo

22d20c7  seed: nomor rekening & e-wallet dummy di tabel payment_method
         → Migrasi 006_seed_payment_accounts.sql (isi nomor GoPay/OVO/DANA/bank)

a12bd21  fix: Midtrans production mode + item_details mismatch
         → IS_PRODUCTION=true, gross_amount = 1 item = total (hindari mismatch)

f1468af  fix: snap-token GET→POST (hindari double-encoding '/' di noFaktur)
         → POST body JSON, bukan query string

eaa089e  fix: Midtrans URL salah format
         → Gunakan redirectUrl dari API (/snap/v4/redirection/), bukan bangun manual

7400d74  fix: jumlah transfer tampil sesuai nominal tagihan
         → Pass amount ke AccountPayment route params

c92bc5a  fix: Midtrans flow navigate ke AccountPaymentScreen dulu
         → AccountPaymentScreen yang buat snap token, lalu buka WebView

db0e47c  fix: FakturDetailScreen reload data saat kembali ke-focus
         → navigation.addListener('focus', load)
```

**Untuk melihat diff lengkap setiap commit:**
```bash
cd /htdocs/meter-air-apps
git show 1b9b9a0 --stat   # lihat file apa saja yang berubah
git show d43f868          # lihat kode lengkap
```

**File kunci yang bisa dijadikan referensi:**
```
refactor/api/migrations/004_add_payment_method.sql     ← struktur tabel
refactor/api/migrations/005_update_payment_method.sql  ← update kolom + seed
refactor/api/migrations/006_seed_payment_accounts.sql  ← isi nomor rekening
refactor/api/src/payment/payment.service.ts            ← logika bisnis payment
refactor/mobile/src/screens/PaymentSelectScreen.tsx    ← UI pilih metode
refactor/mobile/src/screens/CashPaymentScreen.tsx      ← UI kalkulator kembalian
refactor/mobile/src/screens/AccountPaymentScreen.tsx   ← UI transfer/ewallet
refactor/mobile/src/screens/CustomerCardScreen.tsx     ← UI kartu pelanggan
refactor/mobile/src/components/BrandLogo.tsx           ← komponen logo brand
```

---

## Database: Tabel `payment_method` (sudah ada, jangan dibuat ulang)

```sql
-- Struktur lengkap setelah semua migrasi
SELECT * FROM payment_method ORDER BY sort_order;

-- Hasil (11 baris):
-- code             | name               | type         | is_active | logo_bg  | logo_text | account_number      | account_name
-- cash             | Tunai              | cash         | 1         | #2E7D32  | CASH      | NULL                | NULL
-- gopay            | GoPay              | ewallet      | 1         | #00AED6  | GoPay     | 0812-3456-7890      | BUMDES Kiangroke 2016
-- ovo              | OVO                | ewallet      | 1         | #4C3494  | OVO       | 0821-4567-8901      | BUMDES Kiangroke 2016
-- dana             | DANA               | ewallet      | 1         | #118EEA  | DANA      | 0831-5678-9012      | BUMDES Kiangroke 2016
-- shopeepay        | ShopeePay          | ewallet      | 0         | #F5721B  | SPay      | 0851-6789-0123      | BUMDES Kiangroke 2016
-- bank_bca         | BCA                | bank_static  | 1         | #003DA5  | BCA       | 1234 5678 90        | BUMDES KIANGROKE 2016
-- bank_mandiri     | Mandiri            | bank_static  | 1         | #F5A800  | MANDIRI   | 1400 0123 4567      | BUMDES KIANGROKE 2016
-- bank_bni         | BNI                | bank_static  | 1         | #E57200  | BNI       | 0123 4567 89        | BUMDES KIANGROKE 2016
-- bank_bri         | BRI                | bank_static  | 1         | #004B8D  | BRI       | 0123-01-012345-30-6 | BUMDES KIANGROKE 2016
-- midtrans_qris    | QRIS (Midtrans)    | midtrans     | 1         | #EB1C26  | QRIS      | NULL                | NULL
-- midtrans_card    | Kartu Kredit/Debit | midtrans     | 0         | #1565C0  | CARD      | NULL                | NULL
```

**Tipe dan perilaku:**
- `cash` → kalkulator kembalian → tandai lunas langsung
- `ewallet` → tampil nomor e-wallet → petugas konfirmasi sudah menerima → tandai lunas
- `bank_static` → tampil nomor rekening bank → sama seperti ewallet
- `midtrans` → buat Snap token via API → buka halaman Snap Midtrans

---

## Task 1: Payment Gateway di Admin Web

### Yang sudah ada di admin web (JANGAN dihapus):
- `app/Services/PembayaranService.php` — sudah ada `tandaiLunas()`, `buatSnapToken()`, `initMidtrans()`
- `app/Http/Controllers/PembayaranController.php` — sudah ada `tandaiLunas()`, `qris()`, `snapToken()`
- `resources/views/pembayaran/` — sudah ada beberapa view
- Package `midtrans/midtrans-php: ^2.6` ✅ sudah terpasang
- Package `endroid/qr-code` ✅ sudah terpasang

### Yang perlu dikerjakan:

#### Langkah 1 — Buat Model PaymentMethod
```php
// app/Models/PaymentMethod.php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $table      = 'payment_method';
    protected $primaryKey = 'id';
    public    $timestamps = false;

    protected $fillable = [
        'code','name','type','is_active','icon',
        'logo_bg','logo_text','logo_url',
        'instructions','account_number','account_name','sort_order',
    ];

    protected $casts = ['is_active' => 'boolean'];

    /** Hanya metode aktif, urut sort_order */
    public function scopeActive($query)
    {
        return $query->where('is_active', 1)->orderBy('sort_order');
    }
}
```

#### Langkah 2 — Update PembayaranController

Tambahkan method baru di `app/Http/Controllers/PembayaranController.php`:

```php
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Auth;

// ── Tampilkan halaman pilih metode ──────────────────────────────────────────
public function pilihMetode(Faktur $faktur)
{
    abort_if($faktur->is_lunas, 403, 'Faktur sudah lunas.');
    $methods = PaymentMethod::active()->get()->groupBy('type');
    return view('pembayaran.pilih-metode', compact('faktur', 'methods'));
}

// ── Proses berdasarkan tipe metode ──────────────────────────────────────────
public function proses(Request $request, Faktur $faktur)
{
    abort_if($faktur->is_lunas, 403, 'Faktur sudah lunas.');
    $request->validate(['method_code' => 'required|string']);

    $method = PaymentMethod::where('code', $request->method_code)
                           ->where('is_active', 1)
                           ->firstOrFail();

    return match($method->type) {
        'cash'        => $this->handleCash($request, $faktur, $method),
        'ewallet',
        'bank_static' => $this->handleTransfer($request, $faktur, $method),
        'midtrans'    => $this->handleMidtrans($request, $faktur, $method),
        default       => back()->with('error', 'Metode tidak dikenal.'),
    };
}

// ── Cash: kalkulator kembalian ───────────────────────────────────────────────
private function handleCash(Request $request, Faktur $faktur, PaymentMethod $method)
{
    // GET → tampil halaman kalkulator
    if ($request->isMethod('get') || !$request->filled('jumlah_diterima')) {
        return view('pembayaran.cash', compact('faktur', 'method'));
    }
    // POST → proses pelunasan
    $request->validate([
        'jumlah_diterima' => 'required|integer|min:' . $faktur->total,
    ]);
    $this->pembayaran->tandaiLunas(
        $faktur, 'cash',
        (int) $request->jumlah_diterima,
        Auth::user()
    );
    return redirect()->route('faktur.show', $faktur)
                     ->with('status', 'Pembayaran tunai berhasil. Faktur lunas.');
}

// ── Transfer / E-wallet: tampil rekening, konfirmasi manual ─────────────────
private function handleTransfer(Request $request, Faktur $faktur, PaymentMethod $method)
{
    if ($request->isMethod('get') || !$request->filled('konfirmasi')) {
        return view('pembayaran.transfer', compact('faktur', 'method'));
    }
    $this->pembayaran->tandaiLunas(
        $faktur, $method->code,
        (int) $faktur->total,
        Auth::user()
    );
    return redirect()->route('faktur.show', $faktur)
                     ->with('status', "Pembayaran {$method->name} dikonfirmasi. Faktur lunas.");
}

// ── Midtrans Snap ────────────────────────────────────────────────────────────
private function handleMidtrans(Request $request, Faktur $faktur, PaymentMethod $method)
{
    // Enabled_payments per kode metode (sesuai mobile apps)
    $enabledMap = [
        'midtrans_qris' => ['other_qris', 'qris'],
        'midtrans_card' => ['credit_card'],
    ];
    $enabled = $enabledMap[$method->code] ?? [];

    try {
        $snapToken = $this->pembayaran->buatSnapToken($faktur, $enabled);
    } catch (\Throwable $e) {
        return back()->with('error', 'Gagal membuat sesi Midtrans: ' . $e->getMessage());
    }

    return view('pembayaran.midtrans', compact('faktur', 'method', 'snapToken'));
}
```

Pastikan `buatSnapToken()` di `PembayaranService` menerima `$enabled`:
```php
public function buatSnapToken(Faktur $faktur, array $enabled = []): string
{
    self::initMidtrans();
    $params = [
        'transaction_details' => [
            // Ganti '/' agar tidak double-encode (sesuai fix mobile: commit f1468af)
            'order_id'     => str_replace('/', '-', $faktur->no_faktur) . '-' . time(),
            'gross_amount' => (int) $faktur->total,   // HARUS integer exact
        ],
        // 1 item = total (hindari mismatch gross_amount vs sum items — commit a12bd21)
        'item_details' => [[
            'id'       => 'tagihan',
            'price'    => (int) $faktur->total,
            'quantity' => 1,
            'name'     => 'Tagihan Air - ' . $faktur->no_faktur,
        ]],
        'customer_details' => [
            'first_name' => mb_substr($faktur->customer?->nama ?? 'Pelanggan', 0, 255),
            'phone'      => preg_replace('/[^0-9+]/', '',
                               $faktur->customer?->telp ?? ''),
        ],
        'custom_field1' => $faktur->no_faktur,  // dipakai webhook untuk identifikasi
    ];
    if (!empty($enabled)) {
        $params['enabled_payments'] = $enabled;
    }
    return \Midtrans\Snap::getSnapToken($params);
}
```

#### Langkah 3 — Routes
Tambahkan ke routes yang sudah ada (dalam group auth/tenant):

```php
// Pilih metode bayar
Route::get('/faktur/{faktur}/bayar', [PembayaranController::class, 'pilihMetode'])
     ->name('pembayaran.pilih-metode');

// Proses (GET untuk tampil halaman, POST untuk konfirmasi)
Route::match(['get','post'], '/faktur/{faktur}/bayar/proses',
     [PembayaranController::class, 'proses'])
     ->name('pembayaran.proses');
```

#### Langkah 4 — Views

**`resources/views/pembayaran/pilih-metode.blade.php`**
```html
@extends('layouts.app')
@section('content')
<div class="max-w-lg mx-auto py-6 px-4">

  {{-- Header jumlah tagihan --}}
  <div class="rounded-2xl p-5 mb-6 text-white"
       style="background: linear-gradient(135deg,#1565C0,#0D47A1)">
    <p class="text-xs font-bold tracking-widest opacity-75">TOTAL TAGIHAN</p>
    <p class="text-4xl font-black mt-1">Rp {{ number_format($faktur->total) }}</p>
    <p class="text-sm opacity-70 mt-1">{{ $faktur->no_faktur }}
       &bull; {{ $faktur->customer?->nama }}</p>
  </div>

  {{-- Daftar metode --}}
  @php
    $typeLabel = ['cash'=>'💵 Tunai','ewallet'=>'📲 Dompet Digital',
                  'bank_static'=>'🏦 Transfer Bank','midtrans'=>'🔐 Gateway'];
  @endphp

  @foreach($methods as $type => $items)
  <p class="text-xs font-extrabold text-gray-400 uppercase tracking-wider mt-4 mb-2">
    {{ $typeLabel[$type] ?? $type }}
  </p>

  @foreach($items as $method)
  <a href="{{ route('pembayaran.proses', $faktur) }}?method_code={{ $method->code }}"
     class="flex items-center gap-4 bg-white rounded-2xl p-4 mb-2 shadow-sm
            hover:shadow-md transition-shadow border border-gray-100 no-underline">

    {{-- Brand icon: coba gambar, fallback warna --}}
    <div class="flex-shrink-0 rounded-xl flex items-center justify-center"
         style="width:48px;height:48px;background:{{ $method->logo_bg }}">
      @if($method->logo_url)
      <img src="{{ $method->logo_url }}" alt="{{ $method->name }}"
           class="w-8 h-8 object-contain"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <span class="text-white font-black text-xs hidden w-8 text-center">
        {{ $method->logo_text }}
      </span>
      @else
      <span class="text-white font-black text-xs">{{ $method->logo_text }}</span>
      @endif
    </div>

    {{-- Info metode --}}
    <div class="flex-grow min-w-0">
      <p class="font-bold text-gray-900 text-sm">{{ $method->name }}</p>
      @if($method->account_number)
      <p class="text-xs text-gray-500 truncate">{{ $method->account_number }}</p>
      @elseif($method->instructions)
      <p class="text-xs text-gray-500 truncate">{{ $method->instructions }}</p>
      @endif
    </div>

    <span class="text-gray-300 text-2xl font-thin">›</span>
  </a>
  @endforeach
  @endforeach

</div>
@endsection
```

**`resources/views/pembayaran/cash.blade.php`**
```html
@extends('layouts.app')
@section('content')
<div class="max-w-md mx-auto py-6 px-4">

  <div class="rounded-2xl p-5 mb-5 text-white shadow-lg"
       style="background:#1565C0">
    <p class="text-xs font-bold tracking-widest opacity-75">PEMBAYARAN TUNAI</p>
    <p class="text-3xl font-black mt-1">Rp {{ number_format($faktur->total) }}</p>
    <p class="text-sm opacity-60 mt-1">{{ $faktur->no_faktur }}</p>
  </div>

  <form method="POST"
        action="{{ route('pembayaran.proses', $faktur) }}">
    @csrf
    <input type="hidden" name="method_code" value="cash">
    <input type="hidden" name="konfirmasi" value="1">

    <label class="block text-sm font-bold text-gray-600 mb-2">Uang Diterima (Rp)</label>
    <div class="flex items-center border-2 border-blue-500 rounded-xl bg-white px-4 mb-3"
         style="height:60px">
      <span class="text-gray-400 font-bold mr-2 text-lg">Rp</span>
      <input type="number" id="jumlah" name="jumlah_diterima"
             class="flex-grow outline-none text-2xl font-black text-gray-900"
             min="{{ $faktur->total }}" required
             oninput="hitungKembalian()">
    </div>

    {{-- Nominal cepat --}}
    <div class="flex gap-2 flex-wrap mb-4">
      @foreach([50000, 100000, 200000, 500000, 1000000] as $nom)
        @if($nom >= $faktur->total)
        <button type="button"
                class="px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold
                       hover:border-blue-500 hover:text-blue-600 transition-colors"
                onclick="setNominal({{ $nom }})">
          {{ $nom >= 1000000 ? ($nom/1000000).'jt' : ($nom/1000).'rb' }}
        </button>
        @endif
      @endforeach
    </div>

    {{-- Kembalian --}}
    <div id="kembalianBox" class="rounded-xl p-4 mb-5 hidden">
      <p class="text-xs font-bold uppercase tracking-wider opacity-70">Kembalian</p>
      <p id="kembalianVal" class="text-3xl font-black mt-1"></p>
    </div>

    <button type="submit" id="btnKonfirmasi"
            class="w-full py-4 rounded-2xl text-white text-lg font-black
                   bg-green-600 opacity-50 cursor-not-allowed transition-all"
            disabled>
      ✅ Konfirmasi Lunas
    </button>
  </form>
</div>

<script>
const tagihan = {{ $faktur->total }};
function setNominal(v) {
  document.getElementById('jumlah').value = v;
  hitungKembalian();
}
function hitungKembalian() {
  const diterima = parseInt(document.getElementById('jumlah').value) || 0;
  const box = document.getElementById('kembalianBox');
  const val = document.getElementById('kembalianVal');
  const btn = document.getElementById('btnKonfirmasi');
  box.classList.remove('hidden');
  if (diterima >= tagihan) {
    box.className = 'rounded-xl p-4 mb-5 bg-green-50 border-2 border-green-300';
    val.className = 'text-3xl font-black mt-1 text-green-700';
    val.textContent = 'Rp ' + (diterima - tagihan).toLocaleString('id-ID');
    btn.disabled = false;
    btn.className = btn.className.replace('opacity-50 cursor-not-allowed','');
  } else {
    box.className = 'rounded-xl p-4 mb-5 bg-red-50 border-2 border-red-300';
    val.className = 'text-xl font-bold mt-1 text-red-600';
    val.textContent = 'Kurang Rp ' + (tagihan - diterima).toLocaleString('id-ID');
    btn.disabled = true;
    if (!btn.className.includes('opacity-50'))
      btn.className += ' opacity-50 cursor-not-allowed';
  }
}
</script>
@endsection
```

**`resources/views/pembayaran/transfer.blade.php`**
```html
@extends('layouts.app')
@section('content')
<div class="max-w-md mx-auto py-6 px-4">

  {{-- Brand header --}}
  <div class="rounded-2xl p-5 mb-5 flex items-center gap-4"
       style="background: {{ $method->logo_bg }}1a; border: 2px solid {{ $method->logo_bg }}44">
    <div class="rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
         style="width:56px;height:56px;background:{{ $method->logo_bg }}">
      @if($method->logo_url)
      <img src="{{ $method->logo_url }}" alt="{{ $method->name }}"
           class="w-9 h-9 object-contain"
           onerror="this.outerHTML='<span class=\'text-white font-black text-xs\'>{{ $method->logo_text }}</span>'">
      @else
        {{ $method->logo_text }}
      @endif
    </div>
    <div>
      <p class="text-xl font-black text-gray-900">{{ $method->name }}</p>
      <p class="text-sm text-gray-500">
        {{ $method->type === 'ewallet' ? 'Dompet Digital' : 'Transfer Bank' }}
      </p>
    </div>
  </div>

  {{-- Jumlah --}}
  <div class="rounded-2xl p-5 mb-4 bg-gray-900 text-white">
    <p class="text-xs font-bold tracking-widest opacity-60">JUMLAH YANG DITRANSFER</p>
    <p class="text-4xl font-black mt-1">Rp {{ number_format($faktur->total) }}</p>
  </div>

  {{-- Info rekening --}}
  @if($method->account_number)
  <div class="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
      Nomor {{ $method->type === 'ewallet' ? 'Akun' : 'Rekening' }}
    </p>
    <div class="flex items-center gap-3">
      <p class="text-2xl font-black font-mono text-gray-900 flex-grow">
        {{ $method->account_number }}
      </p>
      <button onclick="salin('{{ $method->account_number }}', this)"
              class="px-3 py-2 rounded-lg text-xs font-bold text-white flex-shrink-0"
              style="background:{{ $method->logo_bg }}">
        Salin
      </button>
    </div>
    @if($method->account_name)
    <p class="text-sm text-gray-500 mt-2">
      Atas nama: <strong>{{ $method->account_name }}</strong>
    </p>
    @endif
  </div>
  @else
  <div class="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-4">
    <p class="text-sm text-yellow-800">
      ⚠️ Nomor {{ $method->type === 'ewallet' ? 'e-wallet' : 'rekening' }}
      belum diisi. Update via phpMyAdmin di tabel <code>payment_method</code>.
    </p>
  </div>
  @endif

  {{-- Petunjuk --}}
  @if($method->instructions)
  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
    <p class="text-xs font-bold text-amber-800 mb-1">📋 Petunjuk</p>
    <p class="text-sm text-amber-900">{{ $method->instructions }}</p>
  </div>
  @endif

  {{-- Konfirmasi --}}
  <form method="POST" action="{{ route('pembayaran.proses', $faktur) }}">
    @csrf
    <input type="hidden" name="method_code" value="{{ $method->code }}">
    <input type="hidden" name="konfirmasi" value="1">
    <button type="submit"
            class="w-full py-4 rounded-2xl text-white text-base font-black shadow-lg
                   hover:opacity-90 transition-opacity"
            style="background:{{ $method->logo_bg }}"
            onclick="return confirm('Konfirmasi: Anda sudah menerima transfer dari pelanggan?')">
      ✅ Sudah Transfer — Tandai Lunas
    </button>
  </form>
  <p class="text-center text-xs text-gray-400 mt-3">
    Ketuk tombol ini hanya setelah memastikan transfer sudah diterima.
  </p>

</div>
<script>
function salin(teks, btn) {
  navigator.clipboard.writeText(teks).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Disalin';
    setTimeout(() => btn.textContent = orig, 2000);
  });
}
</script>
@endsection
```

**`resources/views/pembayaran/midtrans.blade.php`**
```html
@extends('layouts.app')
@section('content')
<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p class="text-gray-600">Memuat halaman pembayaran {{ $method->name }}…</p>
  </div>
</div>

{{-- Snap.js production atau sandbox sesuai config --}}
<script src="{{ config('pembayaran.midtrans.is_production')
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js' }}"
    data-client-key="{{ config('pembayaran.midtrans.client_key') }}"></script>
<script>
window.onload = function() {
  snap.pay('{{ $snapToken }}', {
    onSuccess: function(result) {
      window.location = '{{ route("faktur.show", $faktur) }}?payment=success';
    },
    onPending: function(result) {
      window.location = '{{ route("faktur.show", $faktur) }}?payment=pending';
    },
    onError: function(result) {
      window.location = '{{ route("faktur.show", $faktur) }}?payment=error';
    },
    onClose: function() {
      window.location = '{{ route("faktur.show", $faktur) }}';
    }
  });
};
</script>
@endsection
```

#### Langkah 5 — Tambahkan tombol di detail faktur

Di `resources/views/faktur/show.blade.php` (atau di mana detail faktur ditampilkan):
```html
@if(!$faktur->is_lunas)
  <a href="{{ route('pembayaran.pilih-metode', $faktur) }}"
     class="inline-flex items-center gap-2 px-5 py-3 rounded-xl
            bg-blue-600 hover:bg-blue-700 text-white font-bold
            shadow-lg transition-colors">
    💳 Proses Pembayaran
  </a>
@endif
```

Setelah pembayaran berhasil, tampilkan notifikasi:
```html
@if(session('status'))
  <div class="bg-green-100 border border-green-400 text-green-800 rounded-xl p-4 mb-4">
    ✅ {{ session('status') }}
  </div>
@endif
```

#### Langkah 6 — .env

Salin dari `refactor/api/.env` (baris MIDTRANS_*) ke `.env` admin web:
```
MIDTRANS_SERVER_KEY=<ambil dari refactor/api/.env>
MIDTRANS_CLIENT_KEY=<ambil dari refactor/api/.env>
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SNAP_AKTIF=true
```

---

## Task 2: Kartu Pelanggan (sama persis dengan mobile apps)

### Referensi mobile: commit `8c58f39` (feat: QR code asli di kartu pelanggan)
File: `refactor/mobile/src/screens/CustomerCardScreen.tsx`

### Design yang harus diimplementasikan PERSIS SAMA:

```
Ukuran: 323 × 204 px (kartu kredit standar = 85.6 × 54mm di 96dpi)
       dompdf: setPaper([0, 0, 242.7, 153.1]) ← dalam point (pt)

┌─────────────────────────────────────────────────────────┐ 38px
│ [💧]  BUMDES KIANGROKE 2016        [KARTU PELANGGAN AIR]│ bg: #0277BD
├══════════════════════════════════════════════════════════╡ 3px #0277BD
│                                       ┌───────────────┐ │
│ DENI FARSITO                          │               │ │
│ Kiangroke                             │   QR CODE     │ │
│                                       │   (90×90px)   │ │
│ ┌─────────────────┐  ┌─────┐         │               │ │
│ │ NO. PELANGGAN   │  │  B  │         └───────────────┘ │
│ │ 200212011       │  │     │         Scan meter         │
│ └─────────────────┘  └─────┘                           │
│─────────────────────────────────────────────────────────│
│ 📞 0812-..  │  📍 Kiangroke Kab. Bandung               │ 24px bg: #F0F7FF
└─────────────────────────────────────────────────────────┘
```

**Warna:**
- Header: `#0277BD` (biru)
- Aksen garis: `#0277BD`, 3px
- ID box background: `#F0F7FF`
- Tipe box background: `#E8F5E9`
- Footer background: `#F0F7FF`

**QR Code:** isi = ID pelanggan numerik (mis. `200212011`), ukuran 90×90px, warna hitam.

### Implementasi di Laravel

**Controller** (`PelangganController.php` — method `kartu()`):
```php
public function kartu(\App\Models\Customer $customer): \Illuminate\Http\Response
{
    $config  = \App\Models\Config::first();

    // Generate QR Code PNG 90×90
    $qrResult = \Endroid\QrCode\Builder\Builder::create()
        ->writer(new \Endroid\QrCode\Writer\PngWriter())
        ->data((string) $customer->id)
        ->size(90)
        ->margin(2)
        ->build();
    $qrBase64 = base64_encode($qrResult->getString());

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView(
        'pelanggan.kartu',
        compact('customer', 'config', 'qrBase64')
    );
    $pdf->setPaper([0, 0, 242.7, 153.1]);  // 85.6×54mm dalam pt
    $pdf->set_option('dpi', 96);

    return $pdf->stream("kartu-{$customer->id}.pdf");
}
```

**Route:**
```php
Route::get('/pelanggan/{customer}/kartu', [\App\Http\Controllers\PelangganController::class, 'kartu'])
     ->name('pelanggan.kartu');
```

**`resources/views/pelanggan/kartu.blade.php`** (gunakan TABLE layout, bukan flexbox — dompdf tidak support flex):
```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
/* dompdf: gunakan table layout. Ukuran total: 323×204px */
* { margin:0; padding:0; font-family:"DejaVu Sans",Arial,sans-serif; }
html, body { width:323px; height:204px; background:#fff; overflow:hidden; }

/* ═══ HEADER ═══════════════════════════════════════════════════════ */
.hdr { background:#0277BD; width:323px; height:38px; }
.hdr table { width:323px; height:38px; border-collapse:collapse; }
.hdr td   { vertical-align:middle; }
.td-icon  { width:46px; padding-left:12px; }
.icon-box { width:26px; height:26px; background:rgba(255,255,255,0.2);
            border-radius:6px; text-align:center; line-height:28px;
            color:#fff; font-size:15px; }
.td-text  { padding-left:6px; }
.co-name  { font-size:9px; font-weight:bold; color:#fff; letter-spacing:0.4px; }
.co-sub   { font-size:6px; color:rgba(255,255,255,0.8); }
.td-badge { width:80px; padding-right:12px; text-align:right; }
.badge    { display:inline-block; background:rgba(255,255,255,0.22);
            color:#fff; font-size:6px; font-weight:bold; padding:2px 6px;
            border-radius:3px; letter-spacing:0.5px; }

/* ═══ GARIS AKSEN ══════════════════════════════════════════════════ */
.accent { background:#0277BD; height:3px; width:323px; }

/* ═══ BODY ═════════════════════════════════════════════════════════ */
.body { width:323px; }
.body > table { width:323px; border-collapse:collapse; }
.td-left  { width:195px; vertical-align:top; padding:12px 0 8px 14px; }
.td-right { width:116px; vertical-align:top; padding:10px 14px 0 8px; text-align:center; }

.nama     { font-size:12px; font-weight:bold; color:#1A2530; }
.alamat   { font-size:8px; color:#6B7A8D; margin-top:3px; line-height:1.4; }

/* ID + Tipe */
.id-wrap { margin-top:8px; }
.id-wrap table { border-collapse:collapse; }
.id-box   { background:#F0F7FF; border-radius:6px; padding:5px 8px; }
.id-lbl   { font-size:7px; font-weight:bold; color:#0277BD; letter-spacing:0.5px; }
.id-val   { font-size:14px; font-weight:900; color:#1A2530; margin-top:1px; }
.tipe-box { background:#E8F5E9; border-radius:6px; padding:5px 6px;
            text-align:center; width:34px; margin-left:6px; }
.tipe-lbl { font-size:7px; font-weight:bold; color:#2E7D32; letter-spacing:0.5px; }
.tipe-val { font-size:18px; font-weight:900; color:#1A2530; }

/* QR */
.qr-box   { width:90px; border:1px solid #E1E8EF; border-radius:6px;
            padding:3px; background:#fff; display:inline-block; }
.qr-cap   { font-size:7.5px; color:#6B7A8D; margin-top:4px; }

/* ═══ FOOTER ════════════════════════════════════════════════════════ */
.footer { background:#F0F7FF; width:323px; height:24px; }
.footer table { width:323px; height:24px; border-collapse:collapse; }
.footer td { vertical-align:middle; padding:0 10px;
             font-size:7.5px; color:#0277BD; }
.ft-right  { text-align:right; }
</style>
</head>
<body>

{{-- ── HEADER ───────────────────────────────────────────────────────── --}}
<div class="hdr">
  <table><tr>
    <td class="td-icon">
      <div class="icon-box">💧</div>
    </td>
    <td class="td-text">
      <div class="co-name">{{ strtoupper($config->perusahaan ?? 'PDAM / BUMDES') }}</div>
      <div class="co-sub">{{ $config->alamat ?? '' }}</div>
    </td>
    <td class="td-badge">
      <span class="badge">KARTU PELANGGAN AIR</span>
    </td>
  </tr></table>
</div>

{{-- ── GARIS AKSEN ──────────────────────────────────────────────────── --}}
<div class="accent"></div>

{{-- ── BODY ─────────────────────────────────────────────────────────── --}}
<div class="body">
  <table><tr>
    {{-- Kiri: info pelanggan --}}
    <td class="td-left">
      <div class="nama">{{ $customer->nama }}</div>
      <div class="alamat">{{ $customer->alamat }}</div>

      <div class="id-wrap">
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

    {{-- Kanan: QR code --}}
    <td class="td-right">
      <div class="qr-box">
        <img src="data:image/png;base64,{{ $qrBase64 }}"
             width="84" height="84" style="display:block">
      </div>
      <div class="qr-cap">Scan meter</div>
    </td>
  </tr></table>
</div>

{{-- ── FOOTER ───────────────────────────────────────────────────────── --}}
<div class="footer">
  <table><tr>
    <td>📞 {{ $config->telp ?? '-' }}</td>
    <td class="ft-right">📍 {{ \Illuminate\Support\Str::limit($config->alamat ?? '', 44) }}</td>
  </tr></table>
</div>

</body>
</html>
```

**Tombol di halaman detail pelanggan** (`resources/views/pelanggan/show.blade.php`):
```html
<a href="{{ route('pelanggan.kartu', $customer) }}"
   target="_blank"
   class="inline-flex items-center gap-2 px-4 py-2 rounded-xl
          border-2 border-purple-600 text-purple-700 font-bold
          hover:bg-purple-50 transition-colors">
  🪪 Cetak Kartu Pelanggan
</a>
```

---

## Checklist Verifikasi

Setelah implementasi, verifikasi:

- [ ] `GET /faktur/{id}/bayar` → tampil halaman pilih metode (11 metode dari DB)
- [ ] Logo brand tampil dengan warna yang benar per metode
- [ ] Cash: kalkulator kembalian bekerja, nominal cepat berfungsi
- [ ] Transfer BCA: nomor rekening tampil + tombol salin berfungsi
- [ ] GoPay: nomor e-wallet tampil + tombol salin berfungsi
- [ ] Midtrans QRIS: halaman Snap terbuka di browser
- [ ] Setelah konfirmasi lunas (semua metode): halaman detail faktur refresh & tampil LUNAS
- [ ] `GET /pelanggan/{id}/kartu` → download PDF kartu
- [ ] PDF: ukuran kartu kredit, QR terlihat jelas, nama perusahaan tampil

## Catatan Penting

1. **Nomor rekening dummy** sudah ada di DB. Ganti dengan yang asli via phpMyAdmin.
2. **Credentials Midtrans** — ambil dari `refactor/api/.env` (baris MIDTRANS_*).
3. **Webhook sudah ada** di `WebhookController` — pastikan URL dikonfigurasi di dashboard Midtrans.
4. **Jangan hapus** metode existing di `PembayaranController` — hanya tambahkan method baru.
5. **QR berisi ID numerik pelanggan** (mis. `200212011`) — sama persis dengan mobile apps,
   sehingga petugas bisa scan kartu cetak menggunakan layar Scan QR di mobile apps.
