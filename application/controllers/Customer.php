<?php
class Customer extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mcustomer');
        $this->load->model('Mtransaksi');
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

    private function alert($open_tag=null,$close_tag=null,$data=null){ 
    //method ini untuk membuat alert yang dapat digunakan pada method lain
        if($data!=null) $data = $open_tag.$data.$close_tag;
        return $data;
        //contoh : $this->alert('<h1>','</h1>','Hello world'); Output : <h1>Hello World</h1>
    }

    function index(){
        $page=$this->input->get('per_page');
        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'customer?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mcustomer->count_data();
        $config['per_page'] = $batas; //batas sesuai dengan variabel batas

        $config['uri_segment'] = $page; //merupakan posisi pagination dalam url pada kesempatan ini saya menggunakan method get untuk menentukan posisi pada url yaitu per_page

        $config['first_link'] = 'First';
        $config['first_tag_open'] = '<span class="jsgrid-pager-nav-button jsgrid-pager-nav-inactive-button">';
        $config['first_tag_close'] = '</span>';

        $config['last_link'] = 'Last';
        $config['last_tag_open'] = '<span class="jsgrid-pager-nav-button">';
        $config['last_tag_close'] = '</span>';

        $config['next_link'] = 'Next';
        $config['next_tag_open'] = '<span class="jsgrid-pager-nav-button">';
        $config['next_tag_close'] = '</span>';

        $config['prev_link'] = 'Prev';
        $config['prev_tag_open'] = '<span class="jsgrid-pager-nav-button jsgrid-pager-nav-inactive-button">';
        $config['prev_tag_close'] = '</span>';

        $config['cur_tag_open'] = '<span class="jsgrid-pager-page jsgrid-pager-current-page">';
        $config['cur_tag_close'] = '</span>';

        $config['num_tag_open'] = '<span class="jsgrid-pager-page">';
        $config['num_tag_close'] = '</span>';
        $this->pagination->initialize($config);
        $data['paging']=$this->pagination->create_links();
        $data['jlhpage']=$page;

        $data['datacustomer'] = $this->Mcustomer->getAll($batas,$offset); //query model semua barang

        $this->template('customer/vcustomer', $data);
    }

    public function cari()
    {
        $key= $this->input->get('search_nama'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'nama'=> $key,
        ); //array pencarian yang akan dibawa ke model

        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'customer/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mcustomer->count_search($search); // jlh total barang
        $config['per_page'] = $batas; //batas sesuai dengan variabel batas

        $config['uri_segment'] = $page; //merupakan posisi pagination dalam url pada kesempatan ini saya menggunakan method get untuk menentukan posisi pada url yaitu per_page

        $config['first_link'] = 'First';
        $config['first_tag_open'] = '<span class="jsgrid-pager-nav-button jsgrid-pager-nav-inactive-button">';
        $config['first_tag_close'] = '</span>';

        $config['last_link'] = 'Last';
        $config['last_tag_open'] = '<span class="jsgrid-pager-nav-button">';
        $config['last_tag_close'] = '</span>';

        $config['next_link'] = 'Next';
        $config['next_tag_open'] = '<span class="jsgrid-pager-nav-button">';
        $config['next_tag_close'] = '</span>';

        $config['prev_link'] = 'Prev';
        $config['prev_tag_open'] = '<span class="jsgrid-pager-nav-button jsgrid-pager-nav-inactive-button">';
        $config['prev_tag_close'] = '</span>';

        $config['cur_tag_open'] = '<span class="jsgrid-pager-page jsgrid-pager-current-page">';
        $config['cur_tag_close'] = '</span>';

        $config['num_tag_open'] = '<span class="jsgrid-pager-page">';
        $config['num_tag_close'] = '</span>';
        $this->pagination->initialize($config);
        $data['paging']=$this->pagination->create_links();
        $data['jlhpage']=$page;

        $data['datacustomer'] = $this->Mcustomer->get_search($batas,$offset,$search); //query model semua barang

        $this->template('customer/vcustomer',$data);

    }

    function add(){
        $this->template('customer/vformcustomer');
    }

    function add_aksi(){
        $this->form_validation->set_rules('is_unique[customer.id]');
        
        $data = array(
          'nama' =>$this->input->post('nama'),
          'alamat' =>$this->input->post('alamat'),
          'tipe' =>$this->input->post('tipe'),
          'kota' =>$this->input->post('kota'),

        );

            $this->Mcustomer->input_data($data); //akses model untuk menyimpan ke database
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
            redirect('customer'); //jika berhasil maka akan ditampilkan view upload
    }

    function delete($id){
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di hapus</div>");
        $this->Mcustomer->delete_data($where,'customer');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datacustomer'] = $this->Mcustomer->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('customer/vformcustomeredit',$data);
    }


    function update_aksi(){
        $data = array(
          'nama' =>$this->input->post('pop_nama'),
          'alamat' =>$this->input->post('pop_alamat'),
          'tipe' =>$this->input->post('pop_tipe'),
          'kota' =>$this->input->post('pop_kota'),
          );

        $where = array(
            'id' => $this->input->post('id_customer')
            );

        $this->Mcustomer->update_data($where,$data,'customer');
        
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
        redirect('customer'); //jika berhasil maka akan ditampilkan view upload
            
        
    }

    public function print_pdf(){
        $this->load->model('Mcustomer');

        $data1 = $this->Mcustomer->print_pdf();
        if ($data1)
        {
            $data['lap_customer'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('customer/lap_customer',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar customer.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        $this->load->model('Mcustomer');
        $data1 = $this->Mcustomer->print_pdf();
        if ($data1)
        {
            $data['lap_customer'] = $data1;
        }
        $this->load->view('customer/lap_customer',$data); 
    }

    public function cetak_lap_excel(){
        $this->load->model('Mcustomer');
        $data['lap_customer'] = $this->Mcustomer->print_pdf();
        $this->load->view('customer/lap_customer_excel',$data); 
    }

    public function scan(){
        $content_ = base64_decode($this->uri->segment(3));
        $data['data'] = $this->Mcustomer->getWhere(array('id'=>$content_))->row();
        $where = array('id_pelanggan' => $content_);
        $data['data_history'] = $this->Mcustomer->getHistoryMeter($where);
        // var_dump($this->Mcustomer->getHistoryMeter($where));die();
        if ($data['data']){
            $this->template('customer/scan_customer',$data);
        }else{
            $this->template('customer/scan_customer_null',$data);
        }
    }

    function detail_customer(){
        $produk = 'B1502200001';
        $data['riwayat'] = $this->Mcustomer->getListCustomer($produk, '100', 'date', $this->input->get('customer'), $this->input->get('no_faktur'), '-');
        $data['data'] = $this->Mcustomer->getWhere(array('id'=>$this->input->get('customer')))->row();
        $where = array('id_pelanggan' => $this->uri->segment(3));
        $data['data_history'] = $this->Mcustomer->getHistoryMeter($where);
        // var_dump($data['riwayat']);die();
        if ($data['data']){
            $this->template('customer/detail_customer',$data);
        }else{
            $this->template('customer/scan_customer_null',$data);
        }
    }

    public function getTotalbyMeterAjax(){
        $jenis = $this->input->get('get_jenis');
        $meter = $this->input->get('get_meter');
        $response = array();
        $posts = array();
        $data = $this->Mtransaksi->getDataLevel($jenis);
        $level_max = $data[count($data) - 1]->level;
        // print_r($data[count($data) - 1]->level);die();
        
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
        header('Content-Type: application/json');
        echo $myJSON;
    }


}
?>