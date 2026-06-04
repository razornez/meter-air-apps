Kamu adalah developer senior yang mengerjakan fitur payment gateway dan kartu pelanggan di aplikasi admin web. Berikut konteks lengkap proyek dan instruksi detail yang harus kamu ikuti.

---

KONTEKS PROYEK

Aplikasi admin web adalah Laravel 12 multi-tenant yang berada di folder /htdocs/meter-air. Frontend menggunakan Bootstrap 5.3.3 (via CDN), Tailwind CSS v4 (via @tailwindcss/vite), Bootstrap Icons 1.11.3 (CDN), dan vanilla JavaScript — tidak ada Alpine.js, Vue, atau Livewire. Build tool adalah Vite v7. Font yang dipakai adalah Plus Jakarta Sans (Google Fonts).

Ada mobile apps petugas lapangan yang sudah selesai di repo terpisah (/htdocs/meter-air-apps/refactor/). Database MySQL pdam dipakai bersama antara admin web dan mobile apps.

Semua code yang sudah ada JANGAN dihapus. Kamu hanya menambah dan memperluas yang sudah ada.

---

YANG SUDAH ADA DAN HARUS KAMU PAHAMI SEBELUM MULAI

File app/Services/PembayaranService.php sudah ada dengan method-method berikut yang harus kamu GUNAKAN KEMBALI, jangan dibuat ulang:

Method tandaiLunas(Faktur $faktur, string $metode = 'cash', ?int $jumlah = null, ?User $petugas = null): Pembayaran — ini yang menandai faktur lunas, membuat record di tabel pembayaran, update faktur is_lunas=true, dan insert history audit. Sudah wrapped dalam DB::transaction().

Method buatSnapToken(Faktur $faktur, ?User $petugas = null): array — ini yang membuat Midtrans Snap token dan mengembalikan array berisi 'token' dan 'redirect_url'. Sudah handle pengambilan customer dari database, custom_field1 berisi no_faktur untuk tracking webhook.

Method snapAktif(): bool — cek apakah MIDTRANS_SNAP_AKTIF=true di env.

File app/Http/Controllers/PembayaranController.php sudah ada dengan method-method berikut yang sudah berjalan:

Method tandaiLunas yang menerima POST /faktur/{faktur}/lunas dengan parameter metode (nullable: cash|transfer|qris) dan jumlah (nullable integer).

Method qris yang menangani GET /faktur/{faktur}/qris dan menampilkan QR code lokal.

Method snapToken yang menangani GET /faktur/{faktur}/snap-token sebagai endpoint AJAX yang mengembalikan JSON berisi token dan redirect_url.

File resources/views/faktur/show.blade.php sudah ada dan sudah punya modal Bootstrap (#modalBayar) dengan 4 pilihan: Tunai, Transfer Bank, QRIS, dan Bayar Online Snap. Modal ini menggunakan Bootstrap Modal API dan JavaScript inline. Kamu harus MODIFIKASI modal ini untuk mengambil metode dari tabel payment_method, bukan hardcode 4 opsi.

File resources/views/pelanggan/kartu.blade.php sudah ada (189 baris) dengan layout kartu yang menggunakan barcode picqer. Kamu harus GANTI isinya dengan design baru yang identik dengan mobile apps — tetap gunakan dompdf table layout karena dompdf tidak support flexbox/grid.

File config/pembayaran.php sudah ada dengan key: webhook_secret, qris.merchant, midtrans.server_key, midtrans.client_key, midtrans.is_production, midtrans.is_sanitized, midtrans.is_3ds, snap_aktif.

---

DATABASE: TABEL BARU YANG HARUS KAMU DUKUNG

Tabel payment_method sudah ada di database pdam (dibuat oleh mobile apps). Struktur kolomnya: id (INT PK), code (VARCHAR 30 UNIQUE), name (VARCHAR 100), type (VARCHAR 20 — nilainya: cash, ewallet, bank_static, midtrans), is_active (TINYINT 1), icon (VARCHAR 10), logo_bg (VARCHAR 12 — warna hex brand contoh #4C3494), logo_text (VARCHAR 12 — teks singkat contoh OVO), logo_url (VARCHAR 255 nullable — URL gambar logo), instructions (TEXT nullable), account_number (VARCHAR 50 nullable — nomor rekening atau e-wallet perusahaan), account_name (VARCHAR 100 nullable), sort_order (INT). Tidak ada timestamps.

Data yang sudah ada di tabel: code=cash tipe=cash, code=gopay tipe=ewallet account_number=0812-3456-7890, code=ovo tipe=ewallet account_number=0821-4567-8901, code=dana tipe=ewallet account_number=0831-5678-9012, code=shopeepay tipe=ewallet is_active=0, code=bank_bca tipe=bank_static account_number=1234 5678 90, code=bank_mandiri tipe=bank_static account_number=1400 0123 4567, code=bank_bni tipe=bank_static account_number=0123 4567 89, code=bank_bri tipe=bank_static account_number=0123-01-012345-30-6, code=midtrans_qris tipe=midtrans, code=midtrans_card tipe=midtrans is_active=0.

Tabel pembayaran yang sudah ada kolom-kolomnya: id, no_faktur, metode (VARCHAR 12 — nilai: cash, transfer, qris, midtrans dan sekarang akan ditambah kode metode baru), jumlah, status (pending/paid/gagal), ref, paid_at, petugas (user_id), timestamps.

---

TASK 1: MODEL PAYMENT METHOD

Buat file app/Models/PaymentMethod.php dengan isi berikut:

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class PaymentMethod extends Model
{
    protected $table = 'payment_method';
    public $timestamps = false;

    protected $fillable = [
        'code', 'name', 'type', 'is_active', 'icon',
        'logo_bg', 'logo_text', 'logo_url',
        'instructions', 'account_number', 'account_name', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('is_active', 1)->orderBy('sort_order');
    }
}

---

TASK 2: UPDATE PEMBAYARAN SERVICE

Di app/Services/PembayaranService.php, method buatSnapToken yang sudah ada perlu diupdate agar menerima parameter kedua berupa array $enabledPayments = []. Ini penting agar bisa filter metode pembayaran yang tampil di Snap UI (misalnya untuk QRIS hanya tampil opsi QRIS saja).

Ganti signature method buatSnapToken menjadi:

public function buatSnapToken(Faktur $faktur, array $enabledPayments = [], ?User $petugas = null): array

Di dalam method tersebut, setelah array $params dibangun, tambahkan kondisi berikut sebelum memanggil Snap::getSnapToken:

if (!empty($enabledPayments)) {
    $params['enabled_payments'] = $enabledPayments;
}

Juga pastikan di dalam $params, bagian item_details menggunakan satu item saja yang jumlahnya sama persis dengan gross_amount. Ini penting karena Midtrans akan menolak jika jumlah item_details tidak sama dengan gross_amount. Contoh yang benar:

'item_details' => [
    [
        'id'       => 'tagihan',
        'price'    => (int) $faktur->total,
        'quantity' => 1,
        'name'     => 'Tagihan Air - ' . $faktur->no_faktur,
    ],
],

Dan untuk order_id, pastikan karakter slash pada no_faktur diganti dengan dash:

'order_id' => str_replace('/', '-', $faktur->no_faktur) . '-' . time(),

---

TASK 3: UPDATE PEMBAYARAN CONTROLLER

Di app/Http/Controllers/PembayaranController.php, tambahkan dua method baru. Pertama, method untuk menampilkan halaman pilih metode:

public function pilihMetode(Faktur $faktur): View
{
    abort_if($faktur->is_lunas, 403, 'Faktur sudah lunas.');

    $methods = PaymentMethod::active()->get()->groupBy('type');
    $config  = Config::current();

    return view('pembayaran.pilih-metode', compact('faktur', 'methods', 'config'));
}

Kedua, method untuk memproses pilihan metode yang dikirim:

public function proses(Request $request, Faktur $faktur): mixed
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
        default       => back()->with('error', 'Metode pembayaran tidak dikenal.'),
    };
}

Kemudian tambahkan tiga private method berikut:

private function handleCash(Request $request, Faktur $faktur, PaymentMethod $method): mixed
{
    if ($request->isMethod('get') || !$request->filled('jumlah_diterima')) {
        return view('pembayaran.cash', compact('faktur', 'method'));
    }

    $request->validate([
        'jumlah_diterima' => 'required|integer|min:' . (int) $faktur->total,
    ]);

    $this->pembayaran->tandaiLunas(
        $faktur,
        'cash',
        (int) $request->jumlah_diterima,
        $request->user()
    );

    return redirect()
        ->route('faktur.show', $faktur)
        ->with('status', 'Pembayaran tunai berhasil. Faktur ' . $faktur->no_faktur . ' sudah lunas.');
}

private function handleTransfer(Request $request, Faktur $faktur, PaymentMethod $method): mixed
{
    if ($request->isMethod('get') || !$request->filled('konfirmasi')) {
        return view('pembayaran.transfer', compact('faktur', 'method'));
    }

    $this->pembayaran->tandaiLunas(
        $faktur,
        $method->code,
        (int) $faktur->total,
        $request->user()
    );

    return redirect()
        ->route('faktur.show', $faktur)
        ->with('status', 'Pembayaran ' . $method->name . ' dikonfirmasi. Faktur ' . $faktur->no_faktur . ' sudah lunas.');
}

private function handleMidtrans(Request $request, Faktur $faktur, PaymentMethod $method): mixed
{
    static $enabledMap = [
        'midtrans_qris' => ['other_qris', 'qris'],
        'midtrans_card' => ['credit_card'],
    ];

    try {
        $result = $this->pembayaran->buatSnapToken(
            $faktur,
            $enabledMap[$method->code] ?? [],
            $request->user()
        );
    } catch (\Throwable $e) {
        return back()->with('error', 'Gagal membuat sesi pembayaran: ' . $e->getMessage());
    }

    return view('pembayaran.midtrans', [
        'faktur'    => $faktur,
        'method'    => $method,
        'snapToken' => $result['token'],
    ]);
}

Pastikan juga menambahkan use statement untuk PaymentMethod di bagian atas controller:

use App\Models\PaymentMethod;

---

TASK 4: UPDATE ROUTES

Di routes/web.php, dalam group route yang sudah ada (sudah ada auth middleware dan tenant middleware), tambahkan dua route baru di dekat route faktur yang sudah ada:

Route::get('/faktur/{faktur}/bayar', [PembayaranController::class, 'pilihMetode'])
     ->name('pembayaran.pilih-metode');

Route::match(['get', 'post'], '/faktur/{faktur}/bayar/proses', [PembayaranController::class, 'proses'])
     ->name('pembayaran.proses');

---

TASK 5: UPDATE MODAL DI FAKTUR SHOW

Di resources/views/faktur/show.blade.php, temukan modal #modalBayar yang sudah ada. Di dalam controller atau view yang merender halaman ini, pastikan variable $paymentMethods dikirim berisi koleksi dari PaymentMethod::active()->get(). Jika view dirender lewat FakturController@show, tambahkan pengambilan data ini di sana:

$paymentMethods = \App\Models\PaymentMethod::active()->get()->groupBy('type');

Kemudian di dalam modal, ganti isi daftar pilihan metode yang sekarang hardcode dengan versi dinamis. Ganti bagian daftar 4 opsi hardcode dengan:

@php
$typeLabel = [
    'cash'         => 'Tunai',
    'ewallet'      => 'Dompet Digital',
    'bank_static'  => 'Transfer Bank',
    'midtrans'     => 'Gateway',
];
@endphp

@foreach($paymentMethods as $type => $methods)
<div class="px-3 pt-3 pb-1">
    <small class="text-muted fw-bold text-uppercase" style="letter-spacing:.08em">
        {{ $typeLabel[$type] ?? $type }}
    </small>
</div>
@foreach($methods as $method)
<a href="{{ route('pembayaran.proses', $faktur) }}?method_code={{ $method->code }}"
   class="d-flex align-items-center gap-3 px-3 py-2 border-bottom text-decoration-none text-dark pay-option">
    <div class="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 fw-black"
         style="width:44px;height:44px;background:{{ $method->logo_bg }};color:#fff;font-size:11px;font-weight:900">
        @if($method->logo_url)
        <img src="{{ $method->logo_url }}" alt="{{ $method->name }}"
             style="width:28px;height:28px;object-fit:contain"
             onerror="this.style.display='none';this.parentElement.textContent='{{ $method->logo_text }}'">
        @else
        {{ $method->logo_text }}
        @endif
    </div>
    <div class="flex-grow-1 min-w-0">
        <div class="fw-semibold" style="font-size:14px">{{ $method->name }}</div>
        @if($method->account_number)
        <small class="text-muted text-truncate d-block">{{ $method->account_number }}</small>
        @elseif($method->instructions)
        <small class="text-muted text-truncate d-block">{{ Str::limit($method->instructions, 50) }}</small>
        @endif
    </div>
    <i class="bi bi-chevron-right text-muted"></i>
</a>
@endforeach
@endforeach

Tombol yang sebelumnya membuka modal langsung bisa diganti atau dipertahankan sebagai fallback. Jika ingin membuka modal, ganti href menjadi tombol yang membuka modal #modalBayar. Jika ingin navigasi langsung ke halaman pilih-metode yang terpisah, gunakan:

<a href="{{ route('pembayaran.pilih-metode', $faktur) }}" class="btn btn-primary">
    <i class="bi bi-credit-card me-1"></i> Proses Pembayaran
</a>

---

TASK 6: BUAT VIEW PEMBAYARAN CASH

Buat file resources/views/pembayaran/cash.blade.php dengan konten berikut. Perhatikan bahwa layout extend menggunakan layouts.app yang sudah ada, dan class CSS menggunakan Bootstrap 5 yang sudah ada di project ini (bukan Tailwind karena Tailwind di project ini digunakan untuk komponen custom, sementara layout utama menggunakan Bootstrap).

@extends('layouts.app')

@section('title', 'Pembayaran Tunai')

@section('content')
<div class="container py-4" style="max-width:480px">

    <div class="rounded-4 p-4 mb-4 text-white" style="background:linear-gradient(135deg,#1565C0,#0D47A1)">
        <div class="small fw-bold opacity-75 text-uppercase mb-1" style="letter-spacing:.1em">Total Tagihan</div>
        <div class="display-5 fw-black">Rp {{ number_format($faktur->total) }}</div>
        <div class="small opacity-60 mt-1">{{ $faktur->no_faktur }}</div>
    </div>

    <form method="POST" action="{{ route('pembayaran.proses', $faktur) }}">
        @csrf
        <input type="hidden" name="method_code" value="cash">
        <input type="hidden" name="konfirmasi" value="1">

        <label class="form-label fw-bold text-muted small text-uppercase mb-2" style="letter-spacing:.08em">
            Uang Diterima
        </label>
        <div class="input-group input-group-lg mb-3" style="border:2px solid #1565C0;border-radius:12px;overflow:hidden">
            <span class="input-group-text bg-white border-0 fw-bold text-muted">Rp</span>
            <input type="number" id="jumlahInput" name="jumlah_diterima"
                   class="form-control border-0 fw-black fs-3"
                   style="letter-spacing:-.5px"
                   min="{{ $faktur->total }}" required
                   oninput="hitungKembalian(this.value)">
        </div>

        <div class="d-flex gap-2 flex-wrap mb-4">
            @php
            $nominal = collect([50000,100000,200000,500000,1000000])
                ->filter(fn($v) => $v >= $faktur->total)
                ->values()->take(5);
            @endphp
            @foreach($nominal as $nom)
            <button type="button"
                    class="btn btn-outline-secondary btn-sm fw-bold rounded-3"
                    onclick="setNominal({{ $nom }})">
                {{ $nom >= 1000000 ? ($nom/1000000).'jt' : ($nom/1000).'rb' }}
            </button>
            @endforeach
        </div>

        <div id="kembalianBox" class="rounded-3 p-3 mb-4 d-none">
            <div class="small fw-bold text-uppercase opacity-75 mb-1" style="letter-spacing:.08em">Kembalian</div>
            <div id="kembalianVal" class="fs-2 fw-black"></div>
        </div>

        <button type="submit" id="btnKonfirmasi"
                class="btn btn-lg w-100 fw-bold text-white rounded-3 py-3"
                style="background:#059669;font-size:1.1rem"
                disabled>
            <i class="bi bi-check-circle me-2"></i>Konfirmasi Lunas
        </button>
    </form>
</div>

<script>
const tagihan = {{ (int) $faktur->total }};

function setNominal(v) {
    document.getElementById('jumlahInput').value = v;
    hitungKembalian(v);
}

function hitungKembalian(raw) {
    const diterima = parseInt(raw) || 0;
    const box = document.getElementById('kembalianBox');
    const val = document.getElementById('kembalianVal');
    const btn = document.getElementById('btnKonfirmasi');

    box.classList.remove('d-none');

    if (diterima >= tagihan) {
        box.className = 'rounded-3 p-3 mb-4 bg-success bg-opacity-10 border border-success';
        val.className = 'fs-2 fw-black text-success';
        val.textContent = 'Rp ' + (diterima - tagihan).toLocaleString('id-ID');
        btn.disabled = false;
        btn.style.opacity = '1';
    } else {
        box.className = 'rounded-3 p-3 mb-4 bg-danger bg-opacity-10 border border-danger';
        val.className = 'fs-5 fw-bold text-danger';
        val.textContent = 'Kurang Rp ' + (tagihan - diterima).toLocaleString('id-ID');
        btn.disabled = true;
        btn.style.opacity = '.5';
    }
}
</script>
@endsection

---

TASK 7: BUAT VIEW PEMBAYARAN TRANSFER

Buat file resources/views/pembayaran/transfer.blade.php:

@extends('layouts.app')

@section('title', 'Transfer via ' . $method->name)

@section('content')
<div class="container py-4" style="max-width:480px">

    <div class="rounded-4 p-4 mb-4 d-flex align-items-center gap-3"
         style="background:{{ $method->logo_bg }}18;border:2px solid {{ $method->logo_bg }}44">
        <div class="rounded-3 d-flex align-items-center justify-content-center text-white fw-black flex-shrink-0"
             style="width:56px;height:56px;background:{{ $method->logo_bg }};font-size:12px">
            @if($method->logo_url)
            <img src="{{ $method->logo_url }}" alt="{{ $method->name }}"
                 style="width:36px;height:36px;object-fit:contain"
                 onerror="this.parentElement.textContent='{{ $method->logo_text }}'">
            @else
            {{ $method->logo_text }}
            @endif
        </div>
        <div>
            <div class="fs-4 fw-black text-dark">{{ $method->name }}</div>
            <div class="small text-muted">{{ $method->type === 'ewallet' ? 'Dompet Digital' : 'Transfer Bank' }}</div>
        </div>
    </div>

    <div class="rounded-4 p-4 mb-3 text-white" style="background:#111827">
        <div class="small fw-bold opacity-60 text-uppercase mb-1" style="letter-spacing:.1em">Jumlah Transfer</div>
        <div class="display-5 fw-black">Rp {{ number_format($faktur->total) }}</div>
    </div>

    @if($method->account_number)
    <div class="card rounded-4 mb-3 shadow-sm">
        <div class="card-body">
            <div class="small fw-bold text-muted text-uppercase mb-2" style="letter-spacing:.08em">
                Nomor {{ $method->type === 'ewallet' ? 'Akun' : 'Rekening' }}
            </div>
            <div class="d-flex align-items-center gap-3">
                <code class="fs-4 fw-black text-dark flex-grow-1" id="noRek">{{ $method->account_number }}</code>
                <button class="btn btn-sm fw-bold text-white rounded-3"
                        style="background:{{ $method->logo_bg }}"
                        onclick="salin('{{ $method->account_number }}', this)">
                    Salin
                </button>
            </div>
            @if($method->account_name)
            <div class="text-muted mt-2" style="font-size:13px">
                Atas nama: <strong>{{ $method->account_name }}</strong>
            </div>
            @endif
        </div>
    </div>
    @else
    <div class="alert alert-warning rounded-3 mb-3">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Nomor {{ $method->type === 'ewallet' ? 'e-wallet' : 'rekening' }} belum diisi.
        Update melalui phpMyAdmin di tabel <code>payment_method</code>, kolom account_number.
    </div>
    @endif

    @if($method->instructions)
    <div class="rounded-3 p-3 mb-3" style="background:#FFFBEB;border:1px solid #FDE68A">
        <div class="small fw-bold mb-1" style="color:#92400E">
            <i class="bi bi-info-circle me-1"></i>Petunjuk
        </div>
        <div class="small" style="color:#78350F">{{ $method->instructions }}</div>
    </div>
    @endif

    <form method="POST" action="{{ route('pembayaran.proses', $faktur) }}">
        @csrf
        <input type="hidden" name="method_code" value="{{ $method->code }}">
        <input type="hidden" name="konfirmasi" value="1">
        <button type="submit"
                class="btn btn-lg w-100 fw-black text-white rounded-3 py-3"
                style="background:{{ $method->logo_bg }};font-size:1rem"
                onclick="return confirm('Konfirmasi: Anda sudah menerima transfer dari pelanggan untuk faktur {{ $faktur->no_faktur }}?')">
            <i class="bi bi-check-circle me-2"></i>Sudah Transfer — Tandai Lunas
        </button>
    </form>

    <p class="text-center text-muted mt-3" style="font-size:12px">
        Klik tombol ini hanya setelah memastikan transfer sudah masuk.
    </p>
</div>

<script>
function salin(teks, btn) {
    navigator.clipboard.writeText(teks).then(function() {
        var orig = btn.textContent;
        btn.textContent = '✓ Disalin';
        setTimeout(function() { btn.textContent = orig; }, 2000);
    });
}
</script>
@endsection

---

TASK 8: UPDATE VIEW MIDTRANS (YANG SUDAH ADA)

File resources/views/pembayaran/qris.blade.php yang sudah ada tidak perlu diubah. Yang perlu dilakukan adalah menambah satu view baru untuk metode Midtrans dari tabel payment_method.

Buat file resources/views/pembayaran/midtrans.blade.php:

@extends('layouts.app')

@section('title', 'Bayar via ' . $method->name)

@section('content')
<div class="container py-5 text-center">
    <div class="spinner-border text-primary mb-3"></div>
    <p class="text-muted">Memuat halaman pembayaran {{ $method->name }}...</p>
</div>
@endsection

@push('scripts')
<script src="{{ config('pembayaran.midtrans.is_production')
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js' }}"
    data-client-key="{{ config('pembayaran.midtrans.client_key') }}"></script>
<script>
window.onload = function() {
    snap.pay('{{ $snapToken }}', {
        onSuccess: function(result) {
            window.location.href = '{{ route('faktur.show', $faktur) }}?payment=success';
        },
        onPending: function(result) {
            window.location.href = '{{ route('faktur.show', $faktur) }}?payment=pending';
        },
        onError: function(result) {
            window.location.href = '{{ route('faktur.show', $faktur) }}?payment=error';
        },
        onClose: function() {
            window.location.href = '{{ route('faktur.show', $faktur) }}';
        }
    });
};
</script>
@endpush

---

TASK 9: UPDATE ENV

Di file .env, tambahkan atau update baris berikut (ambil nilai dari /htdocs/meter-air-apps/refactor/api/.env baris MIDTRANS_*):

MIDTRANS_SERVER_KEY=<salin dari refactor/api/.env>
MIDTRANS_CLIENT_KEY=<salin dari refactor/api/.env>
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SNAP_AKTIF=true

---

TASK 10: REDESIGN KARTU PELANGGAN

File resources/views/pelanggan/kartu.blade.php yang sudah ada perlu di-REPLACE seluruh isinya dengan design berikut yang identik dengan mobile apps. Ukuran kartu adalah 323x204px (kartu kredit standar).

PERHATIAN PENTING: dompdf tidak mendukung flexbox, CSS grid, display:inline-flex, atau properti gap. Gunakan hanya table layout, float, block, dan inline-block. Unit yang aman: px. Gunakan font DejaVu Sans.

Ganti seluruh isi file dengan:

<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; font-family:"DejaVu Sans",Arial,sans-serif; }
html, body { width:323px; height:204px; background:#fff; overflow:hidden; }

.hdr { background:#0277BD; width:323px; height:38px; }
.hdr table { width:323px; height:38px; border-collapse:collapse; }
.hdr td { vertical-align:middle; }
.td-icon { width:46px; padding-left:12px; }
.icon-box { width:26px; height:26px; background:rgba(255,255,255,0.2); border-radius:6px; text-align:center; line-height:28px; color:#fff; font-size:15px; }
.td-name { padding-left:6px; }
.co-name { font-size:9px; font-weight:bold; color:#fff; letter-spacing:0.4px; }
.co-sub { font-size:6px; color:rgba(255,255,255,0.8); }
.td-badge { width:82px; padding-right:12px; text-align:right; }
.badge { display:inline-block; background:rgba(255,255,255,0.22); color:#fff; font-size:6px; font-weight:bold; padding:2px 6px; border-radius:3px; letter-spacing:0.5px; }

.accent { background:#0277BD; height:3px; width:323px; }

.body { width:323px; height:139px; }
.body > table { width:323px; height:139px; border-collapse:collapse; }
.td-left { width:192px; vertical-align:top; padding:12px 0 8px 14px; }
.td-right { width:119px; vertical-align:top; padding:10px 14px 0 6px; text-align:center; }

.nama { font-size:12px; font-weight:bold; color:#1A2530; }
.alamat { font-size:8px; color:#6B7A8D; margin-top:3px; line-height:1.4; }

.id-wrap { margin-top:9px; }
.id-wrap table { border-collapse:collapse; }
.id-box { background:#F0F7FF; border-radius:6px; padding:5px 8px; }
.id-lbl { font-size:7px; font-weight:bold; color:#0277BD; letter-spacing:0.5px; }
.id-val { font-size:13px; font-weight:900; color:#1A2530; margin-top:2px; }
.tipe-cell { padding-left:6px; }
.tipe-box { background:#E8F5E9; border-radius:6px; padding:5px 6px; text-align:center; width:36px; }
.tipe-lbl { font-size:7px; font-weight:bold; color:#2E7D32; letter-spacing:0.5px; }
.tipe-val { font-size:18px; font-weight:900; color:#1A2530; margin-top:2px; }

.qr-wrap { width:90px; border:1px solid #E1E8EF; border-radius:6px; padding:3px; background:#fff; display:inline-block; }
.qr-cap { font-size:7.5px; color:#6B7A8D; margin-top:4px; text-align:center; }

.footer { background:#F0F7FF; width:323px; height:24px; }
.footer table { width:323px; height:24px; border-collapse:collapse; }
.footer td { vertical-align:middle; padding:0 10px; font-size:7.5px; color:#0277BD; }
.ft-right { text-align:right; }
</style>
</head>
<body>

<div class="hdr">
  <table><tr>
    <td class="td-icon"><div class="icon-box">&#128167;</div></td>
    <td class="td-name">
      <div class="co-name">{{ strtoupper($config->perusahaan ?? 'PDAM / BUMDES') }}</div>
      <div class="co-sub">{{ $config->alamat ?? '' }}</div>
    </td>
    <td class="td-badge"><span class="badge">KARTU PELANGGAN AIR</span></td>
  </tr></table>
</div>

<div class="accent"></div>

<div class="body">
  <table><tr>
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
          <td class="tipe-cell">
            <div class="tipe-box">
              <div class="tipe-lbl">TIPE</div>
              <div class="tipe-val">{{ $customer->tipe ?? '-' }}</div>
            </div>
          </td>
        </tr></table>
      </div>
    </td>

    <td class="td-right">
      <div class="qr-wrap">
        <img src="data:image/png;base64,{{ $qrBase64 }}"
             width="84" height="84" style="display:block">
      </div>
      <div class="qr-cap">Scan meter</div>
    </td>
  </tr></table>
</div>

<div class="footer">
  <table><tr>
    <td>&#128222; {{ $config->telp ?? '-' }}</td>
    <td class="ft-right">&#128205; {{ Str::limit($config->alamat ?? '', 44) }}</td>
  </tr></table>
</div>

</body>
</html>

---

TASK 11: UPDATE CONTROLLER KARTU PELANGGAN

Di app/Http/Controllers/PelangganController.php, temukan method kartu() yang sudah ada dan update agar menggunakan QR code (bukan barcode picqer seperti sebelumnya). Ganti isinya menjadi:

public function kartu(Customer $customer): \Illuminate\Http\Response
{
    $config = Config::current();

    $qrResult = \Endroid\QrCode\Builder\Builder::create()
        ->writer(new \Endroid\QrCode\Writer\PngWriter())
        ->data((string) $customer->id)
        ->size(90)
        ->margin(2)
        ->build();

    $qrBase64 = base64_encode($qrResult->getString());

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pelanggan.kartu', compact('customer', 'config', 'qrBase64'));

    $pdf->setPaper([0, 0, 242.7, 153.1]);
    $pdf->set_option('dpi', 96);

    return $pdf->stream('kartu-' . $customer->id . '.pdf');
}

---

CHECKLIST VERIFIKASI

Setelah semua task selesai, verifikasi hal-hal berikut satu per satu:

Pertama, buka halaman detail faktur yang belum lunas. Klik tombol Proses Pembayaran. Pastikan muncul daftar metode pembayaran yang diambil dari tabel payment_method, bukan hardcode. Pastikan logo brand tampil dengan warna yang benar (warna hex dari kolom logo_bg).

Kedua, pilih Tunai. Pastikan muncul halaman kalkulator kembalian. Masukkan nominal yang lebih besar dari tagihan. Pastikan kembalian terhitung benar dan tombol konfirmasi aktif. Submit dan pastikan faktur berubah menjadi lunas.

Ketiga, buka faktur lain yang belum lunas. Pilih GoPay. Pastikan muncul nomor akun GoPay (0812-3456-7890). Tombol Salin harus berfungsi mengcopy ke clipboard. Klik Sudah Transfer dan pastikan faktur berubah lunas.

Keempat, pilih BCA. Pastikan nomor rekening (1234 5678 90) tampil besar. Konfirmasi dan pastikan faktur berubah lunas.

Kelima, pilih QRIS Midtrans. Pastikan halaman Snap Midtrans terbuka di browser. Ini memerlukan MIDTRANS_SNAP_AKTIF=true di .env dan credentials yang benar.

Keenam, buka halaman detail pelanggan mana saja. Klik tombol Cetak Kartu Pelanggan. Pastikan PDF ter-download dengan layout: header biru di atas, nama dan alamat pelanggan di kiri, QR code di kanan (isi QR = ID pelanggan numerik), footer biru muda dengan nomor telp dan alamat. Ukuran harus seukuran kartu kredit.

Ketujuh, scan QR dari kartu yang dicetak menggunakan mobile apps (fitur Scan QR Meter). Pastikan langsung membuka form catat meter untuk pelanggan yang benar.

---

CATATAN PENTING

Satu: semua method yang sudah ada di PembayaranService dan PembayaranController JANGAN dihapus karena masih dipakai oleh fitur lain (QRIS lokal, workflow existing).

Dua: tabel payment_method menggunakan type VARCHAR bukan ENUM, jadi tidak perlu migrasi apapun untuk mengubah nilai type.

Tiga: nomor rekening dan e-wallet yang ada sekarang masih dummy. Admin bisa menggantinya kapan saja melalui phpMyAdmin dengan query: UPDATE payment_method SET account_number='NOMOR_ASLI', account_name='NAMA_ASLI' WHERE code='gopay';

Empat: untuk QR pada kartu pelanggan, pastikan package endroid/qr-code sudah terpasang (sudah ada di composer.json). Jika ada error namespace, gunakan: use Endroid\QrCode\Builder\Builder; use Endroid\QrCode\Writer\PngWriter;

Lima: jika ada error pada kartu PDF terkait emoji (karakter 💧 dan 📞), ganti dengan entitas HTML: &#128167; untuk tetesan air dan &#128222; untuk telepon dan &#128205; untuk pin lokasi. Sudah dilakukan di template yang diberikan di atas.
