<?php
class Mlog extends CI_Model{
 	
 	var $tabel = 'log_aktivitas';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel)->join('users', 'log_aktivitas.id_user = users.id_user');
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

	public function count_data()
	{
	    $query = $this->db->get($this->tabel)->num_rows();
	    return $query;
	}

    public function get_search($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel)->join('users', 'log_aktivitas.id_user = users.id_user');
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

	public function getWhere($where){
		//ambil data sesuai kriteria pada tabel buku
		$this->db->where($where);
		return $this->db->get('log');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM log_aktivitas l join users u on l.id_user = u.id_user ORDER BY id desc");
		return $query;
	}

}
?>