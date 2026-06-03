<?php
class Mproject extends CI_Model{
 	
 	var $tabel = 'project';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $query = $this->db->query("SELECT *, DATEDIFF(tanggal_selesai, tanggal_mulai) as total_date FROM project p order by id_project desc limit $offset, $batas")->result();
	    return $query;
	}

	public function getAll_job($batas =null,$offset=null,$key=null) 
    {
	    $my_id_sesion = $this->uri->segment(3);
	    //$now = date('Y-m-d H:i:s');
	    error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
	    if($_GET['id'] != ''){ 
	    	$sort='p.id asc';
	    }else if($_GET['group'] != ''){
	    	$sort='p.group asc';
	    }else if($_GET['mulai'] != ''){
	    	$sort='p.tanggal_mulai asc';
	    }else if($_GET['selesai'] != ''){
	    	$sort='p.tanggal_selesai asc';
	    }else if($_GET['sisa'] != ''){
	    	$sort='waktu_sisa asc';
	    }else if($_GET['perkiraan'] != ''){
	    	$sort='p.waktu_perkiraan asc';
	    }else{
	    	$sort='p.id asc';
	    }    

	    if($my_id_sesion != null){
	    $query = $this->db->query("SELECT *, TIMEDIFF(p.tanggal_selesai, NOW()) as waktu_sisa FROM pekerjaan p join group_pekerjaan g on p.group = g.id_group_kerja where p.id_project = ".$my_id_sesion." order by ".$sort." limit $offset, $batas");
	 	}else{
	 		die;
	 	}
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

	public function count_data_job()
	{
	    $my_id_sesion = $this->uri->segment(3);

	    $query = $this->db->query("SELECT * FROM pekerjaan p join group_pekerjaan g on p.group = g.id_group_kerja where p.id_project = ".$my_id_sesion." order by p.id asc")->num_rows();
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
		$this->db->update('project',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai kriteria pada tabel buku
		$this->db->where($where);
		return $this->db->get('project');
	}

	public function print_pdf()
	{
		$query = $this->db->query("SELECT * FROM project ORDER BY tanggal_mulai asc");
		return $query;
	}

	public function print_result_header()
	{
		$my_id_sesion = $this->uri->segment(3);
		$query = $this->db->query("SELECT *, concat(DAY(tanggal_mulai),'-',MONTHNAME(tanggal_mulai),'-',YEAR(tanggal_mulai)) as tanggal_mulai, concat(DAY(tanggal_selesai),'-',MONTHNAME(tanggal_selesai),'-',YEAR(tanggal_selesai)) as tanggal_selesai FROM project where id_project = ".$my_id_sesion." ");
		return $query;
	}

	public function print_result()
	{
		$my_id_sesion = $this->uri->segment(3);
		$query = $this->db->query("SELECT *, concat(DAY(tanggal_mulai),'-',MONTHNAME(tanggal_mulai),'-',YEAR(tanggal_mulai)) as tanggal_mulai, concat(DAY(tanggal_selesai),'-',MONTHNAME(tanggal_selesai),'-',YEAR(tanggal_selesai)) as tanggal_selesai, concat(DAY(tgl_done),'-',MONTHNAME(tgl_done),'-',YEAR(tgl_done)) as tgl_done FROM pekerjaan p WHERE status = 1 and id_project = ".$my_id_sesion." order by id asc");
		return $query;
	}

	public function print_rangking_header()
	{
		$my_id_sesion = $this->uri->segment(3);
		$query = $this->db->query("SELECT *, concat('', MONTHNAME(tanggal), ' ', YEAR(tanggal)) as periode, MONTHNAME(tanggal) as bulan, YEAR(tanggal) as tahun FROM project s join users u on s.id_user = u.id_user where s.id = '".$my_id_sesion."' limit 1");
		return $query;
	}

	public function print_rangking()
	{
		$my_id_sesion = $this->uri->segment(3);
		$query = $this->db->query("SELECT * FROM project s join saw_alternatif sa on s.id = sa.id_sesion join alternatif a on sa.id_alternatif = a.id_alternatif where s.id = '".$my_id_sesion."' ORDER BY sa.hasil_alternatif desc");
		return $query;
	}
}
?>