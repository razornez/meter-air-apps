<?php
class MstokMasuk extends CI_Model{
 	
 	var $tabel = 'stok_masuk';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->select('*, stok_masuk.id as id_stokmasuk, stok_masuk.keterangan as keterangan_stok, p.stok as stok_produk, s.nama as satuan, p.barcode as barcode, stok_masuk.jumlah as masuk, p.nama as produk, p.foto as foto_produk, su.nama as supplier, date_format(stok_masuk.tanggal, " %d %M %Y") as tgl_masuk, stok_masuk.tanggal as tgl_masuk_ori', false);
	    $this->db->from($this->tabel);
	    $this->db->join('produk p', 'p.barcode = stok_masuk.barcode');
	    $this->db->join('satuan s', 'p.satuan = s.id');
	    $this->db->join('supplier su', 'stok_masuk.supplier = su.id');
	    $this->db->order_by("stok_masuk.tanggal", "desc");
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
	    $this->db->select('*, s.nama as satuan, p.nama as produk, su.nama as supplier, date_format(stok_masuk.tanggal, " %d %M %Y") as tgl_masuk', false);
	    $this->db->from($this->tabel);
	    $this->db->join('produk p', 'p.barcode = stok_masuk.barcode');
	    $this->db->join('satuan s', 'p.satuan = s.id');
	    $this->db->join('supplier su', 'stok_masuk.supplier = su.id');
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
		$this->db->update('stok_masuk',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai jabatan pada tabel buku
		$this->db->where($where);
		return $this->db->get('stok_masuk');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM stok_masuk ORDER BY id desc");
		return $query;
	}
}
?>