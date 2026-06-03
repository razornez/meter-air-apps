<?php
class Mconfig extends CI_Model{
 	
 	var $tabel = 'config';

	public function update_data($where,$data,$tabel){
		$this->db->where($where);
		$this->db->update('config',$data);
	}	

	public function get_config()
	{
		$query = $this->db->query("SELECT * FROM config");
		return $query;
	}

	public function getWhere(){
		//ambil data sesuai jabatan pada tabel buku
		$query = $this->db->query("SELECT * FROM config where id ='".$_GET['id']."' ")->row();
		return $query;
	}
}
?>