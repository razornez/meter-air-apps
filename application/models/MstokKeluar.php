<?php
class MstokKeluar extends CI_Model{
 	
 	var $tabel = 'stok_keluar';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->select('*, stok_keluar.id as id_stokKeluar, stok_keluar.keterangan as keterangan_stok, p.stok as stok_produk, s.nama as satuan, p.barcode as barcode, stok_keluar.jumlah as keluar, p.nama as produk, p.foto as foto_produk, date_format(stok_keluar.tanggal, " %d %M %Y") as tgl_masuk, stok_keluar.tanggal as tgl_masuk_ori', false);
	    $this->db->from($this->tabel);
	    $this->db->join('produk p', 'p.barcode = stok_keluar.barcode');
	    $this->db->join('satuan s', 'p.satuan = s.id');
	    $this->db->order_by("stok_keluar.tanggal", "desc");
	    if($batas != null){
	       $this->db->limit($batas,$offset);
	    }
	    if ($key != null) {
	       $this->db->or_like($key);
	    }
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    if ($query->num_rows() > 0) {
	        return $query->result();
	    }
	}

	public function getAll_lowstok() 
    {
	    $this->db->select('*, s.nama as satuan, p.nama as produk', false);
	    $this->db->from('produk p');
	    $this->db->join('satuan s', 'p.satuan = s.id');
	    $this->db->order_by("stok", "asc");
	    $this->db->limit(3);
	    
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    if ($query->num_rows() > 0) {
	        return $query->result();
	    }
	}

	public function getAll_nolimit() 
    {
	    $this->db->select('*, s.nama as satuan, p.nama as produk, date_format(stok_keluar.tanggal, " %d %M %Y") as tgl_masuk', false);
	    $this->db->from($this->tabel);
	    $this->db->join('produk p', 'p.barcode = stok_keluar.barcode');
	    $this->db->join('satuan s', 'p.satuan = s.id');
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    if ($query->num_rows() > 0) {
	        return $query->result();
	    }
	}

	public function count_data()
	{
	    $query = $this->db->get($this->tabel)->num_rows();
	    return $query;
	}

    public function get_search($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel);
	    if($batas != null){
	       $this->db->limit($batas,$offset);
	    }
	    if ($key != null) {
	       $this->db->or_like($key);
	    }
	    $query = $this->db->get();
	 
	    //cek apakah ada barang
	    if ($query->num_rows() > 0) {
	        return $query->result();
	    }
	}

	public function count_search($orlike) 
	{
	    $this->db->or_like($orlike);
	    $query = $this->db->get($this->tabel);
	 
	    return $query->num_rows();
	}

	public function input_data($data){
       $this->db->insert($this->tabel, $data);
       return TRUE;
    }

	public function delete_data($where,$tabel){
		$this->db->where($where);
		$this->db->delete($tabel);
	}

 
	public function update_data($where,$data,$tabel){
		$this->db->where($where);
		$this->db->update('stok_keluar',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai jabatan pada tabel buku
		$this->db->where($where);
		return $this->db->get('stok_keluar');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM stok_keluar ORDER BY id desc");
		return $query;
	}
}
?>