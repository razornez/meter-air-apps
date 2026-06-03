<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends CI_Controller {
	
	function  __construct(){
		parent::__construct();
		$this->load->library('session');
		$this->load->database(); // load database
		$this->load->library('pagination');
		$this->load->model('Mconfig');		
		$this->load->model('MstokMasuk');		
		$this->load->helper('url');
		$this->logged_in();
	}

	function logged_in() {
        if (!($this->session->userdata('is_active'))) {
            redirect(base_url() . "login");
        }
    }

	private function template($content,$data=null){ 
    //method ini digunakan untuk memanggil template yang telah dibuat
    // untuk dapat digunakan pada method lainnya
    //parameter $content = lokasi file view pada folder View
    //parameter $data = data yang akan dimasukkan ke file view
        $data['content'] = $this->load->view($content,$data,true);
        $this->load->view('layout',$data);
    }
	
	public function index()
	{
		$pendapatan = $this->db->query("SELECT sum(total) as pendapatan from faktur")->row()->pendapatan;
		$penjualan = $this->db->query("SELECT count(id) as penjualan from transaksi")->row()->penjualan;
		$supplier = $this->db->query("SELECT count(id) as supplier from supplier")->row()->supplier;
		$produk = $this->db->query("SELECT count(id) as produk from produk")->row()->produk;

		$penjualan_terakhir = $this->db->query("SELECT p.foto as foto, t.produk, t.total,  date_format(f.tanggal, ' %d %M %Y') as tanggal from transaksi t join produk p on t.barcode = p.barcode join faktur f on t.faktur = f.no_faktur order by t.id desc limit 5");
		$penjualan_hari_ini = $this->db->query("SELECT count(total) as hari_ini from faktur where tanggal = CURDATE()")->row();
		$penjualan_kemarin = $this->db->query("SELECT count(total) as hari_kemarin from faktur where tanggal = CURDATE() - INTERVAL 1 DAY")->row();
		$produk_terlaris = $this->db->query("SELECT p.nama, count(t.barcode) as total_jual from produk p join transaksi t on p.barcode = t.barcode join faktur f on f.no_faktur = t.faktur group by p.nama order by total_jual desc limit 5");
		$bulan_ini = $this->db->query("SELECT sum(total) as total, tanggal FROM faktur where MONTH(tanggal) = MONTH(CURRENT_DATE()) group by tanggal order by tanggal asc");
		$laba_hari_ini = $this->db->query("SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, sum(t.quantity) as qty, f.total as bruto, sum(p.harga*t.quantity) as netto, f.total-(sum(p.harga*t.quantity)) as laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			where f.tanggal = '".date('Y-m-d')."'
			group by f.no_faktur
			order by f.no_faktur) x")->row()->total_laba;
		$semua_laba = $this->db->query("SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, sum(t.quantity) as qty, f.total as bruto, sum(p.harga*t.quantity) as netto, f.total-(sum(p.harga*t.quantity)) as laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			group by f.no_faktur
			order by f.no_faktur) x")->row()->total_laba;
		$data['pendapatan'] = $this->custom_number_format($pendapatan);
		$data['penjualan'] = number_format($penjualan);
		$data['supplier'] = number_format($supplier);
		$data['produk'] = number_format($produk);
		$data['penjualan_terakhir'] = $penjualan_terakhir;
		$data['penjualan_hari_ini'] = $penjualan_hari_ini;
		$data['penjualan_kemarin'] = $penjualan_kemarin;
		$data['produk_terlaris'] = $produk_terlaris;
		$data['bulan_ini'] = $bulan_ini;
		$data['laba_hari_ini'] = $laba_hari_ini;
		$data['semua_laba'] = $this->custom_number_format($semua_laba);

		$this->template('vhome', $data);
	}

	function dashboard_app(){
        $pendapatan = $this->db->query("SELECT sum(total) as pendapatan from faktur")->row()->pendapatan;
        $penjualan = $this->db->query("SELECT count(id) as penjualan from transaksi")->row()->penjualan;
        $supplier = $this->db->query("SELECT count(id) as supplier from supplier")->row()->supplier;
        $produk = $this->db->query("SELECT count(id) as produk from produk")->row()->produk;

        $penjualan_terakhir = $this->db->query("SELECT p.foto as foto, t.produk, t.total,  date_format(f.tanggal, ' %d %M %Y') as tanggal from transaksi t join produk p on t.barcode = p.barcode join faktur f on t.faktur = f.no_faktur order by t.id desc limit 5");
        $penjualan_hari_ini = $this->db->query("SELECT count(total) as hari_ini from faktur where tanggal = CURDATE()")->row();
        $penjualan_kemarin = $this->db->query("SELECT count(total) as hari_kemarin from faktur where tanggal = CURDATE() - INTERVAL 1 DAY")->row();
        $produk_terlaris = $this->db->query("SELECT p.nama, count(t.barcode) as total_jual from produk p join transaksi t on p.barcode = t.barcode join faktur f on f.no_faktur = t.faktur group by p.nama order by total_jual desc limit 5");
        $bulan_ini = $this->db->query("SELECT sum(total) as total, tanggal FROM faktur where MONTH(tanggal) = MONTH(CURRENT_DATE()) group by tanggal order by tanggal asc");
        $laba_hari_ini = $this->db->query("SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, sum(t.quantity) as qty, f.total as bruto, sum(p.harga*t.quantity) as netto, f.total-(sum(p.harga*t.quantity)) as laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			where f.tanggal = '".date('Y-m-d')."'
			group by f.no_faktur
			order by f.no_faktur) x")->row()->total_laba;
        $semua_laba = $this->db->query("SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, sum(t.quantity) as qty, f.total as bruto, sum(p.harga*t.quantity) as netto, f.total-(sum(p.harga*t.quantity)) as laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			group by f.no_faktur
			order by f.no_faktur) x")->row()->total_laba;
        $data['pendapatan'] = $this->custom_number_format($pendapatan);
        $data['penjualan'] = number_format($penjualan);
        $data['supplier'] = number_format($supplier);
        $data['produk'] = number_format($produk);
        $data['penjualan_terakhir'] = $penjualan_terakhir;
        $data['penjualan_hari_ini'] = $penjualan_hari_ini;
        $data['penjualan_kemarin'] = $penjualan_kemarin;
        $data['produk_terlaris'] = $produk_terlaris;
        $data['bulan_ini'] = $bulan_ini;
        $data['laba_hari_ini'] = $laba_hari_ini;
		$data['semua_laba'] = $this->custom_number_format($semua_laba);

        $this->load->view('dashboard_app', $data);
    }

	public function kasir()
	{
		
		redirect($_SERVER['HTTP_REFERER']);
	}

	public function data()
	{
		$this->load->view('vdata');
	}

	public function data2()
	{
		$this->load->view('vdata2');
	}
	
	function custom_number_format($n, $precision = 1) {
		if ($n < 1000000) {
        // Anything less than a million
			$n_format = number_format($n / 1000, $precision) . ' Ribu';
		} else if ($n < 1000000000) {
        // Anything less than a billion
			$n_format = number_format($n / 1000000, $precision) . ' Juta';
		} else {
        // At least a billion
			$n_format = number_format($n / 1000000000, $precision) . ' Milliar';
		}

		return $n_format;
	}
}
