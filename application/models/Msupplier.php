<?php
class Msupplier extends CI_Model{
 	
 	var $tabel = 'supplier';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel);
	    $this->db->order_by("id", "desc");
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
	    $this->db->select("*, 's.supplier' as Semua", false);
	    $this->db->from($this->tabel);
	    $this->db->order_by("nama", "asc");
	    
	    $query = $this->db->get();
	 
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
	    $this->db->order_by("id", "desc");
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
		$this->db->update('supplier',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai jabatan pada tabel buku
		$this->db->where($where);
		return $this->db->get('supplier');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM supplier ORDER BY id desc");
		return $query;
	}
}
?>