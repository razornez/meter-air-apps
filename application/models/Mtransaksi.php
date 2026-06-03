<?php
class Mtransaksi extends CI_Model {

	var $tabel = 'transaksi';

	public function __construct() {
		parent::__construct();
	}

	public function delete_temp($id) {
		$this->db->where('id', $id);
		$this->db->delete('temp_transaksi');

	}

	public function print_faktur_cust()
	{
		$query = $this->db->query("SELECT f.no_faktur, p.barcode, p.nama as produk, t.quantity, s.nama as satuan, p.harga_jual, t.diskon, t.total, f.total as total_all, c.nama as customer, f.diskon_tipe as diskon_tipe, f.biaya_kirim, f.tgl_jatuh_tempo as jatuh_tempo, f.ppn, f.diskon as diskon_all, f.subtotal, c.alamat, c.kota from faktur f join transaksi t on f.no_faktur = t.faktur join produk p on t.barcode = p.barcode join satuan s on p.satuan = s.id join customer c on f.customer = c.id where f.no_faktur = '".$this->input->get('faktur')."' ");
		return $query;
	}

	public function print_faktur()
	{
		$query = $this->db->query("SELECT f.no_faktur, p.barcode, p.nama as produk, t.quantity, s.nama as satuan, p.harga_jual, t.diskon, t.total, f.total as total_all, f.diskon_tipe as diskon_tipe, f.biaya_kirim, f.tgl_jatuh_tempo as jatuh_tempo, f.ppn, f.diskon as diskon_all, f.subtotal from faktur f join transaksi t on f.no_faktur = t.faktur join produk p on t.barcode = p.barcode join satuan s on p.satuan = s.id where f.no_faktur = '".$this->input->get('faktur')."' ");
		return $query;
	}

	public function getLatestFaktur(){
		$this->db->from('faktur');
		$this->db->select("no_faktur, DATE_FORMAT(tanggal,'%m') as tanggal");
		$this->db->order_by('id', 'DESC');
		$this->db->limit('1');
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    return $query->row();
	}

	public function getMinusStok($meter_baru, $barcode){
		$this->db->from('produk');
		$this->db->select("barcode, nama, stok, (stok - ".$meter_baru.") as tersedia");
		$this->db->where('barcode', $barcode);
		$this->db->limit('1');
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    return $query->row();
	}

	public function getDataLevel($jenis){
		$this->db->from('level_pemakaian');
		$this->db->select("*");
		$this->db->where('jenis', $jenis);
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    return $query->result();
	}

	public function inputFaktur($data){
       $this->db->insert('faktur', $data);
       return TRUE;
    }

    public function updateStok($v, $b){
       $this->db->query("UPDATE produk SET stok = stok-".$v." where produk.barcode = '".$b."' ");
    }

    public function insertHistoryMeter($data){
       $this->db->insert('history_meter', $data);
       return TRUE;
    }

    public function getProdukByBarcode($barcode){
		$this->db->where('barcode', $barcode);
		$this->db->limit('1');
		$query = $this->db->get('produk');
		return $query->row();
	}

	public function insertTransaksi($data){
       $this->db->insert('transaksi', $data);
       return TRUE;
    }

}

?>