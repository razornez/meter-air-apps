<?php
class StokKeluar extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('MstokKeluar');
        $this->load->model('MstokMasuk');      
        $this->load->model('Mproduk');
        $this->load->model('Msupplier');
        $this->load->model('Mconfig');      
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
        $config['base_url'] = base_url().'stokKeluar?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->MstokKeluar->count_data();
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

        //var_dump($this->MstokKeluar->getAll($batas,$offset));die();
        $data['datastokKeluar'] = $this->MstokKeluar->getAll($batas,$offset); 
        $data['data_nolimit'] = $this->MstokKeluar->getAll_nolimit();
        $data['data_lowstok'] = $this->MstokKeluar->getAll_lowstok(); 
        $data['dataproduk'] = $this->Mproduk->getAll(0,0,0);
        // var_dump($_POST['barcode_field']);
        $this->template('stokKeluar/vstokKeluar', $data);
    }

    public function cari()
    {
        $key= $this->input->get('key'); //method get key
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
        $config['base_url'] = base_url().'stokKeluar/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->MstokKeluar->count_search($search); // jlh total barang
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

        $data['datastokKeluar'] = $this->MstokKeluar->get_search($batas,$offset,$search); //query model semua barang

        $this->template('stokKeluar/vstokKeluar',$data);

    }

    function add(){
        $this->template('stokKeluar/vformstokKeluar');
    }

    function add_aksi(){
        $this->form_validation->set_rules('is_unique[stokKeluar.id]');
        $bcd = explode(",",$this->input->post('popc_produk'));
        $produk_b = $bcd[0];
        $produk_h = $bcd[1];

        if ($this->input->post('popc_keterangan')=='Lain'){
            $keterangan = $this->input->post('popc_keterangan_lain');
        }else{
            $keterangan = $this->input->post('popc_keterangan');
        }

        if ($this->input->post('popc_tanggal') == '' or $this->input->post('popc_tanggal')==null){
            $tanggal_masuk = date('Y-m-d');
        }else{
            $tanggal_masuk = $this->input->post('popc_tanggal');
        }

        $data = array(
          'tanggal' =>$tanggal_masuk,
          'barcode' =>$produk_b,
          'jumlah' =>$this->input->post('popc_jumlah'),
          'keterangan' =>$keterangan,
        );

        $this->db->query("UPDATE produk set stok = (stok - ".$this->input->post('popc_jumlah').") where barcode = '".$produk_b."' ");

        $this->MstokKeluar->input_data($data); //akses model untuk menyimpan ke database
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
        redirect('stokKeluar'); //jika berhasil maka akan ditampilkan view upload
    }

    function delete($id){
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di hapus</div>");
        $this->db->query("UPDATE produk set stok = (stok + ".$this->input->post('list_stokKeluar').") where barcode = '".$this->input->post('list_barcode')."' ");
        $this->MstokKeluar->delete_data($where,'stok_keluar');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datastokKeluar'] = $this->MstokKeluar->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('stokKeluar/vformstokKeluaredit',$data);
    }


    function update_aksi(){

        $bcd = explode(",",$this->input->post('pop_produk'));
        $produk_b = $bcd[0];
        $produk_h = $bcd[1];

        if ($this->input->post('pop_tanggal') == '' or $this->input->post('pop_tanggal')==null){
            $tanggal_masuk = date('Y-m-d');
        }else{
            $tanggal_masuk = $this->input->post('pop_tanggal');
        }

        $data = array(
          'tanggal' =>$tanggal_masuk,
          'barcode' =>$produk_b,
          'jumlah' =>$this->input->post('pop_jumlah'),
        );

        $where = array(
            'id' => $this->input->post('pop_id_stok_masuk')
            );

        $this->MstokKeluar->update_data($where,$data,'stok_masuk'); //akses model untuk menyimpan ke database
        
        //$this->db->query("UPDATE produk set stok = (stok + ".$this->input->post('pop_jumlah').") where barcode = '".$produk_b."' ");
        
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
        redirect('stokKeluar'); //jika berhasil maka akan ditampilkan view upload
    }

    public function print_pdf(){
        $this->load->model('MstokKeluar');

        $data1 = $this->MstokKeluar->print_pdf();
        if ($data1)
        {
            $data['lap_stokKeluar'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('stokKeluar/lap_stokKeluar',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Stok Keluar.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        $this->load->model('MstokKeluar');
        $data1 = $this->MstokKeluar->print_pdf();
        if ($data1)
        {
            $data['lap_stokKeluar'] = $data1;
        }
        $this->load->view('stokKeluar/lap_stokKeluar',$data); 
    }

    public function cetak_lap_excel(){
        $this->load->model('MstokKeluar');
        $data['lap_stokKeluar'] = $this->MstokKeluar->print_pdf();
        $this->load->view('stokKeluar/lap_stok_keluar_excel',$data); 
    }

}
?>