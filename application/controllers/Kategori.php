<?php
class Kategori extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mkategori');
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
        $config['base_url'] = base_url().'kategori?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mkategori->count_data();
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

        $data['datakategori'] = $this->Mkategori->getAll($batas,$offset); //query model semua barang

        $this->template('kategori/vkategori', $data);
    }

    public function cari()
    {
        $key= $this->input->get('search_nama'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'nama'=> $key,
            'deskripsi'=> $key,
        ); //array pencarian yang akan dibawa ke model

        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'kategori/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mkategori->count_search($search); // jlh total barang
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

        $data['datakategori'] = $this->Mkategori->get_search($batas,$offset,$search); //query model semua barang

        $this->template('kategori/vkategori',$data);

    }

    function add(){
        $this->template('kategori/vformkategori');
    }

    function add_aksi(){
        $this->form_validation->set_rules('is_unique[kategori.id]');
        
        $data = array(
          'nama' =>$this->input->post('nama'),
          'deskripsi' =>$this->input->post('deskripsi'),

        );

            $this->Mkategori->input_data($data); //akses model untuk menyimpan ke database
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
            redirect('kategori'); //jika berhasil maka akan ditampilkan view upload
    }

    function delete($id){
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di hapus</div>");
        $this->Mkategori->delete_data($where,'kategori');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datakategori'] = $this->Mkategori->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('kategori/vformkategoriedit',$data);
    }


    function update_aksi(){
        $data = array(
          'nama' =>$this->input->post('pop_nama'),
          'deskripsi' =>$this->input->post('pop_deskripsi'),
          );

        $where = array(
            'id' => $this->input->post('id_kategori')
            );

        $this->Mkategori->update_data($where,$data,'kategori');
        
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
        redirect('kategori'); //jika berhasil maka akan ditampilkan view upload
            
        
    }

    public function print_pdf(){
        $this->load->model('Mkategori');

        $data1 = $this->Mkategori->print_pdf();
        if ($data1)
        {
            $data['lap_kategori'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('kategori/lap_kategori',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar kategori.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        $this->load->model('Mkategori');
        $data1 = $this->Mkategori->print_pdf();
        if ($data1)
        {
            $data['lap_kategori'] = $data1;
        }
        $this->load->view('kategori/lap_kategori',$data); 
    }

    public function cetak_lap_excel(){
        $this->load->model('Mkategori');
        $data['lap_kategori'] = $this->Mkategori->print_pdf();
        $this->load->view('kategori/lap_kategori_excel',$data); 
    }

}
?>