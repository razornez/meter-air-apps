<?php
class Mproduk extends CI_Model{
 	
 	var $tabel = 'produk';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->select('*, produk.id as id_produk, s.nama as satuan, k.nama as kategori, produk.nama as produk', false);
	    $this->db->from($this->tabel);
	    $this->db->join('satuan s', 's.id = produk.satuan');
	    $this->db->join('kategori k', 'k.id = produk.kategori');
	    $this->db->order_by("id_produk", "desc");
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

	public function getAll_laporan() 
    {
	    $query = $this->db->query("SELECT nama FROM produk UNION SELECT 't.produk' order by nama asc");
	 
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
	    $this->db->select('*, produk.id as id_produk, s.nama as satuan, k.nama as kategori, produk.nama as produk', false);
	    $this->db->from($this->tabel);
	    $this->db->join('satuan s', 's.id = produk.satuan');
	    $this->db->join('kategori k', 'k.id = produk.kategori');
	    $this->db->order_by("id_produk", "desc");
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
		$this->db->update('produk',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai jabatan pada tabel buku
		$this->db->where($where);
		return $this->db->get('produk');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM produk ORDER BY id desc");
		return $query;
	}
}
?>