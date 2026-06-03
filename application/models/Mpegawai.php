<?php
class Mpegawai extends CI_Model{
 	
 	var $tabel = 'pegawai';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $query = $this->db->query("SELECT *, p.nama as nama, j.nama as jabatan, d.nama as divisi FROM pegawai p join jabatan j on p.id_jabatan = j.id join divisi d on p.id_divisi = d.id order by p.nama asc limit $offset, $batas");
	    //cek apakah ada barang
	    if ($query->num_rows() > 0) {
	        return $query->result();
	    }
	}

	public function getAll_log($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from('log_pekerjaan');
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

	public function count_data()
	{
	    $query = $this->db->get($this->tabel)->num_rows();
	    return $query;
	}

	public function count_data_log()
	{
	    $query = $this->db->get('log_pekerjaan')->num_rows();
	    return $query;
	}

	public function count_data_log_search($orlike)
	{
	    $this->db->or_like($orlike);
	    $query = $this->db->get('log_pekerjaan');
	 
	    return $query->num_rows();
	}


    public function get_search($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel)->join('divisi', 'pegawai.id_divisi = divisi.id')->join('jabatan', 'pegawai.id_jabatan = jabatan.id');
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
		$this->db->update('pegawai',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai kriteria pada tabel buku
		$this->db->where($where);
		return $this->db->get('pegawai');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT *, p.nama as nama, j.nama as jabatan, d.nama as divisi FROM pegawai p join jabatan j on p.id_jabatan = j.id join divisi d on p.id_divisi = d.id order by p.nama asc");
		return $query;
	}
}
?>