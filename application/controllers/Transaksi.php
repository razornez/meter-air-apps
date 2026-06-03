<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Transaksi extends CI_Controller {
	
	function  __construct(){
		parent::__construct();
		$this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mtransaksi');
        $this->load->model('Mcustomer');
        $this->load->model('Mproduk');
        $this->load->model('Mconfig');      
        $this->load->model('MstokMasuk');      
        $this->load->library('form_validation');
        $this->logged_in();
    }

    function logged_in() {
    	if (!($this->session->userdata('is_active'))) {
    		redirect(base_url() . "login");
    	}
    }

    private function template($content,$data=null){ 
    //method ini digunakan untuk memanggil template yang telah dibuat
    // untuk dapat digunakan pada method lainnya
    //parameter $content = lokasi file view pada folder View
    //parameter $data = data yang akan dimasukkan ke file view
    	$data['content'] = $this->load->view($content,$data,true);
    	$this->load->view('layout',$data);
    }

    public function index()
    {
      error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
      $produk = 'B1502200001';
      $limit = 50;
      $sort = '-';
      if ($this->input->get('filter_limit')){
        $limit = $this->input->get('filter_limit');
      }
      if ($this->input->get('filter_sort')){
        $sort = $this->input->get('filter_sort');
      }
      $datacustomer = $this->Mcustomer->getListCustomer($produk, $limit, $sort, '-', '-', 'cust');
      $statusDone = $this->Mcustomer->getStatusDone($produk);

      $percent = $statusDone->total_done/$statusDone->total_customer;
      $percent_friendly = number_format( $percent * 100, 2 ) . '%';
      // var_dump($percent_friendly);die();
      $data['list'] = $datacustomer;
      $data['data_cust'] = $statusDone;
      $data['percent_done'] = $percent_friendly;
    	$this->template('vtransaksi', $data);
    }

    public function save_faktur()
    {
    	error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
    	$cek=$this->db->query("SELECT no_faktur from faktur order by id desc limit 1");
    	if(count($cek->result()) == 0){
    		$no_faktur='FA/AJ/'.date('y').'/'.date('m').'/'."001";
    	} else{
    		$cek_tgl=$this->db->query("SELECT DATE_FORMAT(tanggal,'%m') as tanggal from faktur order by id desc limit 1")->row()->tanggal;
    		if($cek_tgl != date('m')){
    			$no_faktur='FA/AJ/'.date('y').'/'.date('m').'/'."001";
    		}else{
    			$get_counter= substr($cek->row()->no_faktur,-3);
    			$counter = $get_counter +1;
    			$tmp_no_faktur = str_pad($counter, 3, "0", STR_PAD_LEFT);
    			$no_faktur='FA/AJ/'.date('y').'/'.date('m').'/'.$tmp_no_faktur;
    		}

    	}
		// query membuat nomor faktur
		$total_ = str_replace(',', '',$this->input->post('total_all'));
    	$disc_ = str_replace(',', '',$this->input->post('disc_all'));
    	$ppn_ = str_replace(',', '',$this->input->post('ppn_all'));
    	$ongkir_ = str_replace(',', '',$this->input->post('ongkir_all'));

        if ($this->input->post('disctype_all')=='%'){
            $disc_ = $total_ * ($disc_ / 100);
        }else{
            $disc_ = $disc_;
        }

    	if ($disc_ == ''){$disc_ = 0;}
    	if ($ppn_ == ''){$ppn_ = 0;}
    	if ($ongkir_ == ''){$ongkir_ = 0;}

    	$total_all = ($total_ - $disc_) + ($total_ * ($ppn_ / 100)) + $ongkir_;
    	//var_dump($total_all);die();

        $get_minus_stok = $this->db->query("SELECT t.barcode, p.nama, p.stok, (p.stok - t.quantity) as tersedia from produk p join temp_transaksi t on p.barcode = t.barcode");

        if ($get_minus_stok->row()->tersedia < 0){
            $this->session->set_flashdata("pesan", '<div class="alert alert-fill-danger" id="alert"><i class="mdi mdi-alert-circle"></i> Gagal menyimpan transaksi dikarenakan stok <b>'.$get_minus_stok->row()->nama.'</b> tinggal <b>'.$get_minus_stok->row()->stok.'</b></div>');
        }else{

        	$this->db->query("INSERT INTO faktur (no_faktur, tanggal, kasir, subtotal, diskon, ppn, biaya_kirim, total, diskon_tipe, customer, tgl_jatuh_tempo, is_done) values ('".$no_faktur."', '".date('Y-m-d')."', '".$this->session->userdata('id_user')."', '".$total_."', '".$disc_."', '".$ppn_."', '".$ongkir_."', '".$total_all."', '".$this->input->post('disctype_all')."', '".$this->input->post('customer_all')."', '".$this->input->post('jth_tempo_all')."', 1) ");
    		// query insert data transaksi
        	$this->db->query("INSERT INTO transaksi (barcode, produk, harga, quantity, diskon, total, faktur) select barcode, produk, harga, quantity, diskon, total, '".$no_faktur."' as faktur from temp_transaksi ");
    		// query clean data transaksi temporary
            $get_the_trans = $this->db->query("SELECT * FROM transaksi where faktur = '".$no_faktur."' ");
            $get_the_fakt = $this->db->query("SELECT * FROM faktur where no_faktur = '".$no_faktur."' ");
        	foreach ($get_the_trans->result() as $data){
    			// var_dump($data);
        		if ($data->quantity==''){$data->quantity=0;}
        		$this->db->query("UPDATE produk SET stok = stok-".$data->quantity." where produk.barcode = '".$data->barcode."' ");
        	}

            $link_def="'".'transaksi/faktur?faktur='.$no_faktur."'";
            $link_cust="'".'transaksi/faktur_custom?faktur='.$no_faktur."'";
        	$this->db->query("TRUNCATE TABLE temp_transaksi");
            if ($this->input->post('customer_all') != '-'){
                $this->session->set_flashdata("pesan", '<div class="alert alert-fill-success" id="alert"><i class="mdi mdi-alert-circle"></i> Data transaksi <b id="no_faktur_alert">'.$no_faktur.'</b> berhasil disimpan </div><div class="modal hide" id="modalFaktur">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel-3">Cetak Faktur '.$no_faktur.'</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                        <div class="modal-body">
                          <div class="row">
                            <div class="col-md-12">
                              <div class="form-group row">
                                <label class="col-sm-3 col-form-label">Jumlah </label>
                                <div class="col-sm-9">
                                  <b style="font-size:32px;float: right;">Rp. '.number_format($get_the_fakt->row()->total).'</b>
                                  <input type="hidden" class="form-control" id="res_jum" value="'.$get_the_fakt->row()->total.'">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-3 col-form-label">Bayar</label>
                                <div class="col-sm-9">
                                  <input type="text" class="form-control" id="res_bayar" style="height: 50px;font-size: 32px;text-align:right;" onkeyup="get_kembalian()" placeholder="0">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-3 col-form-label">Kembalian</label>
                                <div class="col-sm-9">
                                  <input type="text" class="form-control" id="res_kembali" style="height: 50px;font-size: 32px;text-align:right;" readonly>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button type="button" onClick="window.open('.$link_cust.').window.print()" class="btn btn-success">Cetak Faktur</button>
                          <button type="button" class="btn btn-light" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                  </div>
                </div>');
            }else{
                $this->session->set_flashdata("pesan", '<div class="alert alert-fill-success" id="alert"><i class="mdi mdi-alert-circle"></i> Data transaksi <b id="no_faktur_alert">'.$no_faktur.'</b> berhasil disimpan </div><div class="modal hide" id="modalFaktur">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel-3">Cetak Faktur '.$no_faktur.'</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                        <div class="modal-body">
                          <div class="row">
                            <div class="col-md-12">
                              <div class="form-group row">
                                <label class="col-sm-3 col-form-label">Jumlah </label>
                                <div class="col-sm-9">
                                  <b style="font-size:32px;float: right;">Rp. '.number_format($get_the_fakt->row()->total).'</b>
                                  <input type="hidden" class="form-control" id="res_jum" value="'.$get_the_fakt->row()->total.'">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-3 col-form-label">Bayar</label>
                                <div class="col-sm-9">
                                  <input type="text" class="form-control" id="res_bayar" style="height: 50px;font-size: 32px;text-align:right;" onkeyup="get_kembalian()" placeholder="0">
                                </div>
                              </div>
                              <div class="form-group row">
                                <label class="col-sm-3 col-form-label">Kembalian</label>
                                <div class="col-sm-9">
                                  <input type="text" class="form-control" id="res_kembali" style="height: 50px;font-size: 32px;text-align:right;" readonly>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="modal-footer">
                          <button type="button" onClick="window.open('.$link_def.').window.print()" class="btn btn-success">Cetak Faktur</button>
                          <button type="button" class="btn btn-light" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                  </div>
                </div>');
            }
        }

    	redirect($_SERVER['HTTP_REFERER']);
    }

    // public function generateNoFaktur(){
    //   error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
    //   $cek=$this->Mtransaksi->getLatestFaktur();
    //   // var_dump(count($cek));die();
    //   if(count($cek) == 0){
    //       $no_faktur='FA/AJ/'.date('y').'/'.date('m').'/'."001";
    //   } else{
    //       $cek_tgl=$cek->tanggal;
    //       if($cek_tgl != date('m')){
    //           $no_faktur='FA/AJ/'.date('y').'/'.date('m').'/'."001";
    //       }else{
    //           $get_counter= substr($cek->no_faktur,-3);
    //           $counter = $get_counter +1;
    //           $tmp_no_faktur = str_pad($counter, 3, "0", STR_PAD_LEFT);
    //           $no_faktur='FA/AJ/'.date('y').'/'.date('m').'/'.$tmp_no_faktur;
    //       }

    //   }

    //   return $no_faktur;
    // }

    public function generateNoFaktur(){
      $cek=$this->Mtransaksi->getLatestFaktur();
      $no_faktur='FA/BD/'.date('y').'/'.date('m').'/';
      $no_cont = substr($cek->no_faktur,12);
      $new_faktur = $no_faktur.($no_cont+1);
      // var_dump($new_faktur);die();
      return $new_faktur;
    }


    public function save_meter()
    {
        $is_check = $this->Mcustomer->isCheckMeter($this->input->post('customer_all'))->num_rows();
        if ($is_check == 0){
          error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
          $no_faktur = $this->generateNoFaktur();
          // print_r($no_faktur);die();
          // query membuat nomor faktur
          $total_ = str_replace(',', '',$this->input->post('total_all'));
          $disc_ = str_replace(',', '',$this->input->post('disc_all'));
          $ppn_ = str_replace(',', '',$this->input->post('ppn_all'));
          $ongkir_ = str_replace(',', '',$this->input->post('ongkir_all'));
          $beban_ = 5000;
          $denda_ = 0;
          $meter_baru_ = $this->input->post('meter_baru') - $this->input->post('meter_lama');
          if ($meter_baru_ <= 0){
            $meter_baru_ = 0;
          }else if ($this->input->post('meter_baru') == $this->input->post('meter_lama')){
            $meter_baru_ = 0;
          }
          $jenis_ = $this->input->post('jenis');
          $barcode_ = 'B1502200001';
          $data_produk = $this->Mtransaksi->getProdukByBarcode('B1502200001'); 
          // var_dump($data_produk->nama);die();

          if ($this->input->post('disctype_all')=='%'){
              $disc_ = $total_ * ($disc_ / 100);
          }else{
              $disc_ = $disc_;
          }

          if ($disc_ == ''){$disc_ = 0;}
          if ($ppn_ == ''){$ppn_ = 0;}
          if ($ongkir_ == ''){$ongkir_ = 0;}
          if ($beban_ == ''){$beban_ = 0;}
          if ($denda_ == ''){$denda_ = 0;}

          $myJSON = json_decode($this->getTotalbyMeter($meter_baru_, $jenis_), true);
          $total_all = ($myJSON['total_biaya'] - $disc_) + ($myJSON['total_biaya'] * ($ppn_ / 100)) + $ongkir_ + $beban_;
          // var_dump(date('20/01/Y', strtotime('+1 years')));die();

          $get_minus_stok = $this->Mtransaksi->getMinusStok($meter_baru_, $barcode_);
          if ($get_minus_stok->tersedia < 0){
              $this->session->set_flashdata("pesan", '<div class="alert alert-fill-danger" id="alert"><i class="mdi mdi-alert-circle"></i> Gagal menyimpan transaksi dikarenakan stok <b>'.$get_minus_stok->nama.'</b> tinggal <b>'.$get_minus_stok->stok.'</b></div>');
          }else{
              if (date('m') == 12){
                  $tgl_jatuh_tempo = date('Y-01-20', strtotime('+1 years'));
              }else{
                  $tgl_jatuh_tempo = date('Y-m-20', strtotime('+1 months'));
              }
              
              $no_faktur_foto = str_replace('/', '-', $this->generateNoFaktur());
              $name_foto = 'pic_'.$no_faktur_foto.'_'.$this->input->post('customer_all').'.jpeg';

              $data = array(
                'no_faktur' =>$no_faktur,
                'tanggal' =>date('Y-m-d h:i:s'),
                'kasir' =>$this->session->userdata('id_user'),
                'subtotal' =>$myJSON['total_biaya'],
                'beban' =>$beban_,
                'denda' =>$denda_,
                'diskon' =>$disc_,
                'ppn' =>$ppn_,
                'biaya_kirim' =>$ongkir_,
                'total' =>$total_all,
                'diskon_tipe' =>'rp',
                'customer' =>$this->input->post('customer_all'),
                'tgl_jatuh_tempo' =>$tgl_jatuh_tempo,
                'foto_meter' =>$name_foto,
                'catatan' =>$this->input->post('catatan_meter'),
                'is_done' =>'1',
              );

              $data_meter = array(
                'id_pelanggan' =>$this->input->post('customer_all'),
                'meter' =>$this->input->post('meter_baru'),
                'no_faktur' =>$no_faktur,
                'tanggal_catat' =>date('Y-m-d'),
                'jam_catat' =>date('h:i:s'),
              );

              $data_trarnsaksi = array(
                'barcode' =>$barcode_,
                'produk' =>$data_produk->nama,
                'harga' =>$data_produk->harga,
                'quantity' =>$meter_baru_,
                'diskon' =>'0',
                'total' =>$myJSON['total_biaya'],
                'faktur' =>$no_faktur,
              );

              $this->Mtransaksi->inputFaktur($data); 
              $this->Mtransaksi->updateStok($meter_baru_, $barcode_); 
              $this->Mtransaksi->insertHistoryMeter($data_meter); 
              $this->Mtransaksi->insertTransaksi($data_trarnsaksi); 
              // query insert data transaksi
              // $this->db->query("INSERT INTO transaksi (barcode, produk, harga, quantity, diskon, total, faktur) values ('B1502200001',  ");
              // query clean data transaksi temporary
          }

        redirect('transaksi');
      }else{
        $this->session->set_flashdata("pesan", '<div id="alert" style="background: #ffe8e8;padding: 5px;border: 1px solid #ffa7a7;color: #9c0a0a;font-size: 12px;"><i class="mdi mdi-alert-circle"></i> Data meter bulan ini sudah di input sebelumnya, harap hapus terlebih dahulu!</div>');

        redirect($_SERVER['HTTP_REFERER']);
      }
    }

    public function save_foto_meter(){
      $no_faktur = str_replace('/', '-', $this->generateNoFaktur());
      $customer = $this->input->get('customer');
      // echo $no_faktur;die();
      if ($customer){
        $filename = 'pic_'.$no_faktur.'_'.$customer.'.jpeg';

        $url_foto = '';
        if( move_uploaded_file($_FILES['webcam']['tmp_name'],'img/foto_meter/'.$filename) ){
         $url_foto = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['REQUEST_URI']) . '/img/foto_meter/' . $filename;
        }
        echo $url_foto;
      }
      
    }

    public function getTotalbyMeter($meter, $jenis){
        $jenis = $jenis;
        $meter = $meter;
        $response = array();
        $posts = array();
        $data = $this->Mtransaksi->getDataLevel($jenis);
        $level_max = $data[count($data) - 1]->level;
        // print_r($data[0]->jenis);die();
        
        foreach ($data as $key => $value) {
            // echo $data[0]->harga;die();
            if ($value->jenis == $jenis){
                if ($meter > $value->per_pemakaian){
                    if ($value->level < $level_max){
                        $posts[] = array(
                            "level" =>  $value->level,
                            "harga" =>  $value->harga,
                            "quantity"  => $value->per_pemakaian,
                            "total" =>  $value->harga * $value->per_pemakaian,
                        );
                        $meter -= $value->per_pemakaian;    
                    }else{
                        $posts[] = array(
                            "level" =>  $value->level,
                            "harga" =>  $value->harga,
                            "quantity"  => $meter,
                            "total" =>  $value->harga * $meter,
                        );
                        $meter -= 0;
                    }
                }else if ($meter <= $value->per_pemakaian && $meter >= 0){
                    $posts[] = array(
                        "level" =>  $value->level,
                        "harga" =>  $value->harga,
                        "quantity"  => $meter,
                        "total" =>  $value->harga * $meter,
                    );
                    $meter -= $value->per_pemakaian;
                }
            }
        }

        $response['posts'] = $posts;
        $tot = 0;
        for ($i=0; $i < count($posts); $i++) { 
            $tot += $posts[$i]['total'];
        }
        $response['total_biaya'] = $tot;
        $myJSON = json_encode($response,TRUE);
        $myJSONDec = json_decode($myJSON, true);
        // var_dump($myJSONDec);die();

        return $myJSON;
    }

    public function kasir()
    {

    	redirect($_SERVER['HTTP_REFERER']);
    }

    public function data()
    {
    	$this->load->view('vdata');
    }

    public function data2()
    {
    	$this->load->view('vdata2');
    }

    public function delete_temp() {

    	$id = $this->input->post('id');
    	$this->Mtransaksi->delete_temp($id);
    }

    public function update_temp() {

    	$id = $this->input->post('id');
        $this->db->query("UPDATE temp_transaksi SET quantity=".$this->uri->segment(3).", diskon=".$this->uri->segment(4).", total=".$this->uri->segment(5)." where id =".$id." ");
    }

    public function clear() {

        $this->db->query("TRUNCATE table faktur");
        $this->db->query("TRUNCATE table transaksi");
        redirect($_SERVER['HTTP_REFERER']);
    }

    public function faktur_pdf(){
        ///////log aktivitas/////////
    	$this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh faktur ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    	///////log aktivitas////////   
    	$this->load->model('Mtransaksi');

    	$data1 = $this->Mtransaksi->print_faktur();
    	if ($data1)
    	{
    		$data['faktur'] = $data1;
    	}

    	ob_start();
    	$content = $this->load->view('faktur_pdf',$data);
    	$content = ob_get_clean();      
    	$this->load->library('html2pdf');
    	try
    	{
    		$html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(5, 5, 5, 5));
    		$html2pdf->setDefaultFont("arial");
    		$html2pdf->pdf->SetDisplayMode('fullpage');
    		$html2pdf->writeHTML($content, isset($_GET['vuehtml']));
    		$html2pdf->Output('Faktur.pdf');
    	}
    	catch(HTML2PDF_exception $e) {
    		echo $e;
    		exit;
    	}

    }

    function penyebut($nilai) {
        $nilai = abs($nilai);
        $huruf = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
        $temp = "";
        if ($nilai < 12) {
            $temp = " ". $huruf[$nilai];
        } else if ($nilai <20) {
            $temp = $this->penyebut($nilai - 10). " belas";
        } else if ($nilai < 100) {
            $temp = $this->penyebut($nilai/10)." puluh". $this->penyebut($nilai % 10);
        } else if ($nilai < 200) {
            $temp = " seratus" . $this->penyebut($nilai - 100);
        } else if ($nilai < 1000) {
            $temp = $this->penyebut($nilai/100) . " ratus" . $this->penyebut($nilai % 100);
        } else if ($nilai < 2000) {
            $temp = " seribu" . $this->penyebut($nilai - 1000);
        } else if ($nilai < 1000000) {
            $temp = $this->penyebut($nilai/1000) . " ribu" . $this->penyebut($nilai % 1000);
        } else if ($nilai < 1000000000) {
            $temp = $this->penyebut($nilai/1000000) . " juta" . $this->penyebut($nilai % 1000000);
        } else if ($nilai < 1000000000000) {
            $temp = $this->penyebut($nilai/1000000000) . " milyar" . $this->penyebut(fmod($nilai,1000000000));
        } else if ($nilai < 1000000000000000) {
            $temp = $this->penyebut($nilai/1000000000000) . " trilyun" . $this->penyebut(fmod($nilai,1000000000000));
        }     
        return $temp;
    }

    public function terbilang($nilai) {
        if($nilai<0) {
            $hasil = "minus ". trim($this->penyebut($nilai));
        } else {
            $hasil = trim($this->penyebut($nilai));
        }           
        return $hasil;
    }

    public function faktur(){
        ///////log aktivitas/////////
    	$this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Faktur', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   


        $this->load->model('Mtransaksi');
        $data1 = $this->Mtransaksi->print_faktur();

        if ($data1)
        {
            $data['faktur'] = $data1;
            $data['terbilang'] = $this->terbilang($data1->row()->total_all);
        }

        //if ($this->Mconfig->get_config()->row()->jenis_faktur == '1'){
        //    $this->load->view('faktur',$data); 
        //}else{
            $this->load->view('faktur_small',$data); 
        //}
	}

	public function faktur_custom(){
        ///////log aktivitas/////////
    	$this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Faktur', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   
    	$this->load->model('Mtransaksi');
    	$data1 = $this->Mtransaksi->print_faktur_cust();
		if ($data1)
		{
			$data['faktur'] = $data1;
            $data['terbilang'] = $this->terbilang($data1->row()->total_all);
		}
		$this->load->view('faktur_custom',$data); 
	}

    public function delete_lap(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data transaksi', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   
        $this->db->query("DELETE FROM faktur WHERE no_faktur = '".$_GET['faktur']."'");
        $this->db->query("DELETE FROM transaksi WHERE faktur = '".$_GET['faktur']."'");

        $this->session->set_flashdata("pesan", '<div class="alert alert-fill-success" id="alert"><i class="mdi mdi-alert-circle"></i> Data transaksi <b id="no_faktur_alert">'.$_GET['faktur'].'</b> berhasil dihapus </div>');

        redirect($_SERVER['HTTP_REFERER']);
    }

}