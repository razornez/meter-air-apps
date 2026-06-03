<?php
class Mlaporan extends CI_Model{

	public function get_data() 
	{
		$query = $this->db->query("SELECT *, date_format(f.tanggal, ' %d %M %Y') as tgl_mod, f.subtotal as f_subtotal, f.diskon as f_diskon, f.biaya_kirim as f_biaya_kirim, f.total as f_total FROM faktur f join users u on f.kasir = u.id_user join transaksi t on f.no_faktur = t.faktur join produk p on t.barcode = p.barcode group by f.no_faktur order by f.id desc");
		return $query;
	}

	public function get_data_total() 
	{
		$query = $this->db->query("SELECT sum(total) as total_all FROM faktur f join users u on f.kasir = u.id_user")->row()->total_all;
		return $query;
	}

	public function get_data_filter() 
	{
		if ($this->input->post('filter_produk')=='t.produk'){
			$produk = "is not null";
		}else{
			$produk = '= "'.$this->input->post('filter_produk').'"';
		}

		if ($this->input->post('filter_customer')=='f.customer'){
			$customer = 'is not null';
		}else{
			$customer = '= '."'".$this->input->post('filter_customer')."'";
		}

		$query = $this->db->query('SELECT *, date_format(f.tanggal, " %d %M %Y") as tgl_mod, f.subtotal as f_subtotal, f.diskon as f_diskon, f.biaya_kirim as f_biaya_kirim, f.total as f_total FROM faktur f join users u on f.kasir = u.id_user join transaksi t on f.no_faktur = t.faktur join produk p on t.barcode = p.barcode where f.tanggal between "'.$this->input->post('filter_tgl_awal').'" and "'.$this->input->post('filter_tgl_akhir').'" and t.produk '.$produk.' and f.customer '.$customer.' group by f.no_faktur order by '.$this->input->post('filter_urut').' ');
		return $query;
	}

	public function get_data_total_filter() 
	{
		if ($this->input->post('filter_produk')=='t.produk'){
			$produk = "is not null";
		}else{
			$produk = '= "'.$this->input->post('filter_produk').'"';
		}

		if ($this->input->post('filter_customer')=='f.customer'){
			$customer = '';
		}else{
			$customer = 'and f.customer = '."'".$this->input->post('filter_customer')."'";
		}

		$query = $this->db->query('SELECT sum(x.total) as total_all from
		(
		    SELECT f.total
		    FROM faktur f 
		    join users u on f.kasir = u.id_user 
		    join transaksi t on f.no_faktur = t.faktur 
		    join produk p on t.barcode = p.barcode 
		    where f.tanggal between "'.$this->input->post('filter_tgl_awal').'" and "'.$this->input->post('filter_tgl_akhir').'" and t.produk '.$produk.' '.$customer.' 
		        and t.produk is not null 
		    group by f.no_faktur
		   ) x')->row()->total_all;
		return $query;
	}

	public function get_data_laba() 
	{

		$query = $this->db->query("SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, sum(t.quantity) as qty, f.total as bruto, sum(p.harga*t.quantity) as netto, f.total-(sum(p.harga*t.quantity)) as laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			group by f.no_faktur
			order by f.no_faktur) x")->row()->total_laba;
		return $query;
	}

	public function get_data_laba_filter() 
	{
		if ($this->input->post('filter_produk')=='t.produk'){
			$produk = "is not null";
		}else{
			$produk = '= "'.$this->input->post('filter_produk').'"';
		}

		if ($this->input->post('filter_customer')=='f.customer'){
			$customer = '';
		}else{
			$customer = 'and f.customer = '."'".$this->input->post('filter_customer')."'";
		}

		$query = $this->db->query('SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, t.produk, sum(t.quantity) as qty, (((p.harga_jual*t.quantity)-t.diskon)-f.diskon)+f.biaya_kirim As bruto, sum(p.harga*t.quantity) as netto, ((((p.harga_jual*t.quantity)-t.diskon)-f.diskon)+f.biaya_kirim) - (Sum(p.harga * t.quantity)) AS laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			where f.tanggal between "'.$this->input->post('filter_tgl_awal').'" and "'.$this->input->post('filter_tgl_akhir').'" '.$customer.' 
			group by f.no_faktur, t.produk
			order by f.no_faktur) x where x.produk '.$produk.'')->row()->total_laba;
		return $query;
	}

	public function count_search($orlike) 
	{
		$this->db->or_like($orlike);
		$query = $this->db->get($this->tabel);

		return $query->num_rows();
	}

	public function get_data_filter_pop() 
	{
		if ($this->input->post('pop_filter_produk')=='t.produk'){
			$produk = "is not null";
		}else{
			$produk = '= "'.$this->input->post('pop_filter_produk').'"';
		}

		if ($this->input->post('pop_filter_customer')=='f.customer'){
			$customer = 'is not null';
		}else{
			$customer = '= '."'".$this->input->post('pop_filter_customer')."'";
		}

		$query = $this->db->query('SELECT *, date_format(f.tanggal, " %d %M %Y") as tgl_mod, f.subtotal as f_subtotal, f.diskon as f_diskon, f.biaya_kirim as f_biaya_kirim, f.total as f_total FROM faktur f join users u on f.kasir = u.id_user join transaksi t on f.no_faktur = t.faktur join produk p on t.barcode = p.barcode where f.tanggal between "'.$this->input->post('pop_filter_tgl_awal').'" and "'.$this->input->post('pop_filter_tgl_akhir').'" and t.produk '.$produk.' and f.customer '.$customer.' group by f.no_faktur order by '.$this->input->post('pop_filter_urut').' ');
		return $query;
	}

	public function get_data_total_filter_pop() 
	{
		if ($this->input->post('pop_filter_produk')=='t.produk'){
			$produk = "is not null";
		}else{
			$produk = '= "'.$this->input->post('pop_filter_produk').'"';
		}

		if ($this->input->post('pop_filter_customer')=='f.customer'){
			$customer = '';
		}else{
			$customer = 'and f.customer = '."'".$this->input->post('filter_customer')."'";
		}

		$query = $this->db->query('SELECT sum(x.total) as total_all from
		(
		    SELECT f.total
		    FROM faktur f 
		    join users u on f.kasir = u.id_user 
		    join transaksi t on f.no_faktur = t.faktur 
		    join produk p on t.barcode = p.barcode 
		    where f.tanggal between "'.$this->input->post('pop_filter_tgl_awal').'" and "'.$this->input->post('pop_filter_tgl_akhir').'" and t.produk '.$produk.' '.$customer.' 
		        and t.produk is not null 
		    group by f.no_faktur
		   ) x')->row()->total_all;
		return $query;
	}

	public function get_data_laba_filter_pop() 
	{
		if ($this->input->post('pop_filter_produk')=='t.produk'){
			$produk = "is not null";
		}else{
			$produk = '= "'.$this->input->post('pop_filter_produk').'"';
		}

		if ($this->input->post('pop_filter_customer')=='f.customer'){
			$customer = '';
		}else{
			$customer = 'and f.customer = '."'".$this->input->post('pop_filter_customer')."'";
		}

		$query = $this->db->query('SELECT sum(x.laba) as total_laba from (SELECT f.no_faktur, t.produk, sum(t.quantity) as qty, (((p.harga_jual*t.quantity)-t.diskon)-f.diskon)+f.biaya_kirim As bruto, sum(p.harga*t.quantity) as netto, ((((p.harga_jual*t.quantity)-t.diskon)-f.diskon)+f.biaya_kirim) - (Sum(p.harga * t.quantity)) AS laba
			from faktur f
			left join transaksi t on t.faktur=f.no_faktur
			left join produk p on p.barcode=t.barcode
			where f.tanggal between "'.$this->input->post('pop_filter_tgl_awal').'" and "'.$this->input->post('pop_filter_tgl_akhir').'" '.$customer.' 
			group by f.no_faktur, t.produk
			order by f.no_faktur) x where x.produk '.$produk.'')->row()->total_laba;
		return $query;
	}

}
?>