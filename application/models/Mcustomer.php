<?php
class Mcustomer extends CI_Model{
 	
 	var $tabel = 'customer';
    

    public function getAll($batas =null,$offset=null,$key=null) 
    {
	    $this->db->from($this->tabel);
	    $this->db->order_by("nama", "asc");
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
	    $query = $this->db->query("SELECT nama FROM customer UNION SELECT 'c.customer' order by nama asc");
	 
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
	    $this->db->order_by("nama", "asc");
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
		$this->db->update('customer',$data);
	}	

	public function getWhere($where){
		//ambil data sesuai jabatan pada tabel buku
		$this->db->where($where);
		return $this->db->get('customer');
	}

	public function print_pdf()
	{
		$this->db->from($this->tabel);
	    $this->db->order_by("nama", "asc");
		$query = $this->db->get();
		return $query;
	}

	public function getHistoryMeter($where){
		$this->db->where($where);
	    $this->db->order_by("meter", "desc");
		$this->db->limit('1');
		$query = $this->db->get('history_meter');
		return $query->row();
	}

	public function getListCustomer($produk, $limit, $sort, $customer, $no_faktur, $group_by){
		if ($sort == '-'){
			$sort = 'p.id asc, f.tanggal desc';
		}else if ($sort == 'nama'){
			$sort = 'p.nama asc';
		}else if ($sort == 'date'){
			$sort = 'f.tanggal desc';
		}else{
			$sort = 'p.id asc, f.tanggal desc';
		}

		if ($produk == '-'){
			$produk = 't.barcode is not null';
		}else{
			$produk = "t.barcode = '".$produk."'";
		}

		if ($customer == '-'){
			$customer =  'p.id is not null';
		}else{
			$customer = 'p.id = '.$customer;
		}

		if ($no_faktur == '-'){
			$no_faktur =  'f.no_faktur is not null';
		}else{
			$no_faktur = "f.no_faktur = '".$no_faktur."'";
		}

		if ($group_by == '-'){
			$group_by = 'f.no_faktur';
		}else{
			$group_by = array('f.id');
		}
		$this->db->from('faktur f');
		$this->db->select('f.no_faktur, p.nama, f.subtotal, f.total, f.foto_meter, hm.meter as mtr_last, f.tanggal, f.denda, f.beban, p.id as customer, t.quantity, date_format(f.tanggal, " %d %M %Y %h:%i:%s") as tgl_catat, f.tgl_jatuh_tempo, date_format(f.tgl_jatuh_tempo, "%d %M %Y") as tgl_jth_tempo, is_lunas', false);
		$this->db->join('transaksi t', 't.faktur = f.no_faktur');
		$this->db->join('customer p', 'p.id = f.customer');
		$this->db->join('history_meter hm', 'hm.no_faktur = f.no_faktur','left');
		$this->db->where($produk);
		$this->db->where($customer);
		$this->db->where($no_faktur);
	    $this->db->order_by($sort);
	    $this->db->group_by($group_by);
	    $this->db->limit($limit);
	    $query = $this->db->get();
		return $query->result();
	}

	public function getDetailTransaksi($pelanggan){
		$this->db->from('history_transaksi h');
		$this->db->join('pelanggan p', 'p.id = h.pelanggan');
		$this->db->where('h.pelanggan', $pelanggan);
	    $this->db->order_by("id", "desc");
		$query = $this->db->get();
		return $query->result();
	}

	public function getStatusDone($produk){
		$this->db->from('faktur f');
		$this->db->select('(select count(id) from customer) as total_customer, count(f.id) total_done', false);
		$this->db->join('transaksi t', 't.faktur = f.no_faktur');
		$this->db->where('MONTH(tanggal)', date('m'));
		$this->db->where('t.barcode', $produk);
	    // $this->db->group_by("customer");
		$query = $this->db->get();
		return $query->row();
	}

	public function isCheckMeter($customer){
		$this->db->from('faktur f');
		$this->db->select('*');
		$this->db->where('MONTH(tanggal)', date('m'));
		$this->db->where('YEAR(tanggal)', date('Y'));
		$this->db->where('customer', $customer);
	    // $this->db->group_by("customer");
		return $this->db->get();
	}
}
?>