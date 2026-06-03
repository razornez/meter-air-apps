<?php
class Mpekerjaan extends CI_Model{
 	
 	var $tabel = 'pekerjaan';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel)->join('group_pekerjaan', 'pekerjaan.group = group_pekerjaan.id_group_kerja');
	    $this->db->order_by("tanggal_selesai", "desc");
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
	    error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
	    if ($_GET['id']==''){
	    	$sort = 'p.id asc';
	    }else if($_GET['id']!=''){
	    	$sort = 'p.id asc';
	    }else if($_GET['group']==''){
	    	$sort = 'p.id asc';
	    }else if($_GET['group']!=''){
	    	$sort = 'p.group asc';
	    }else if($_GET['time']==''){
	    	$sort = 'p.id asc';
	    }else if($_GET['time']!=''){
	    	$sort = 'p.tanggal_mulai asc';
	    }else{
	    	$_GET['id']= '';
			$_GET['group']= '';
			$_GET['time']= '';
	    }

	    $query = $this->db->query("SELECT *, TIMEDIFF(p.tanggal_selesai, NOW()) as waktu_sisa FROM pekerjaan p join group_pekerjaan g on p.group = g.id_group_kerja order by ".$sort." where p.nama like '%".$key."%' order by p.nama asc limit $offset, $batas")->result();

	    return $query;
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

	public function delete_data_pic($where,$tabel){
		$this->db->where($where);
		$this->db->delete('pic');
	}

 
	public function update_data($where,$data,$tabel){
		$this->db->where($where);
		$this->db->update('pekerjaan',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai jabatan pada tabel buku
		$this->db->where($where);
		return $this->db->get('pekerjaan');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM pekerjaan p join group_pekerjaan g on p.group = g.id_group_kerja ORDER BY id_group_kerja asc");
		return $query;
	}
}
?>