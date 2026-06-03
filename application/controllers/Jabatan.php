<?php
class Jabatan extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mjabatan');
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
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar Jabatan', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'jabatan?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mjabatan->count_data();
        $config['per_page'] = $batas; //batas sesuai dengan variabel batas

        $config['uri_segment'] = $page; //merupakan posisi pagination dalam url pada kesempatan ini saya menggunakan method get untuk menentukan posisi pada url yaitu per_page

        $config['full_tag_open'] = '<ul class="pagination pagination-sm no-margin pull-right">';
        $config['full_tag_close'] = '</ul>';
        $config['first_link'] = '&laquo; First';
        $config['first_tag_open'] = '<li class="prev page">';
        $config['first_tag_close'] = '</li>';

        $config['last_link'] = 'Last &raquo;';
        $config['last_tag_open'] = '<li class="next page">';
        $config['last_tag_close'] = '</li>';

        $config['next_link'] = 'Next &rarr;';
        $config['next_tag_open'] = '<li class="next page">';
        $config['next_tag_close'] = '</li>';

        $config['prev_link'] = '&larr; Prev';
        $config['prev_tag_open'] = '<li class="prev page">';
        $config['prev_tag_close'] = '</li>';

        $config['cur_tag_open'] = '<li class="current"><a href="">';
        $config['cur_tag_close'] = '</a></li>';

        $config['num_tag_open'] = '<li class="page">';
        $config['num_tag_close'] = '</li>';
        $this->pagination->initialize($config);
        $data['paging']=$this->pagination->create_links();
        $data['jlhpage']=$page;

        $data['datajabatan'] = $this->Mjabatan->getAll($batas,$offset); //query model semua barang

        $this->template('jabatan/vjabatan', $data);
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
        $config['base_url'] = base_url().'jabatan/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mjabatan->count_search($search); // jlh total barang
        $config['per_page'] = $batas; //batas sesuai dengan variabel batas

        $config['uri_segment'] = $page; //merupakan posisi pagination dalam url pada kesempatan ini saya menggunakan method get untuk menentukan posisi pada url yaitu per_page

        $config['full_tag_open'] = '<ul class="pagination pagination-sm no-margin pull-right">';
        $config['full_tag_close'] = '</ul>';
        $config['first_link'] = '&laquo; First';
        $config['first_tag_open'] = '<li class="prev page">';
        $config['first_tag_close'] = '</li>';

        $config['last_link'] = 'Last &raquo;';
        $config['last_tag_open'] = '<li class="next page">';
        $config['last_tag_close'] = '</li>';

        $config['next_link'] = 'Next &rarr;';
        $config['next_tag_open'] = '<li class="next page">';
        $config['next_tag_close'] = '</li>';

        $config['prev_link'] = '&larr; Prev';
        $config['prev_tag_open'] = '<li class="prev page">';
        $config['prev_tag_close'] = '</li>';

        $config['cur_tag_open'] = '<li class="current"><a href="">';
        $config['cur_tag_close'] = '</a></li>';

        $config['num_tag_open'] = '<li class="page">';
        $config['num_tag_close'] = '</li>';
        $this->pagination->initialize($config);
        $data['paging']=$this->pagination->create_links();
        $data['jlhpage']=$page;

        $data['datajabatan'] = $this->Mjabatan->get_search($batas,$offset,$search); //query model semua barang

        $this->template('jabatan/vjabatan',$data);

    }

    function add(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke form buat data Jabatan baru', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $this->template('jabatan/vformjabatan');
    }

    function add_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data Jabatan baru ".$_POST['ss_nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->form_validation->set_rules('is_unique[Jabatan.id]');
        
        $data = array(
          'nama' =>$this->input->post('nama'),

        );

            $this->Mjabatan->input_data($data); //akses model untuk menyimpan ke database
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di insert</div>");
            redirect('Jabatan'); //jika berhasil maka akan ditampilkan view upload
    }

    function delete($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data Jabatan', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di hapus</div>");
        $this->Mjabatan->delete_data($where,'jabatan');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datajabatan'] = $this->Mjabatan->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('jabatan/vformjabatanedit',$data);
    }


    function update_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Merubah data Jabatan', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $data = array(
          'nama' =>$this->input->post('nama'),
          );
        $myid = $this->db->query("SELECT id from Jabatan where id=".$this->input->post('id')."");
        $myid_rs = $myid->row();

        $where = array(
            'id' => $myid_rs->id
            );

        $this->Mjabatan->update_data($where,$data,'jabatan');
        
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di update</div>");
        redirect('jabatan'); //jika berhasil maka akan ditampilkan view upload
            
        
    }

    public function print_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar Jabatan ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////   
        $this->load->model('Mjabatan');

        $data1 = $this->Mjabatan->print_pdf();
        if ($data1)
        {
            $data['lap_jabatan'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('jabatan/lap_jabatan',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Jabatan.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Daftar Jabatan', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   
        $this->load->model('Mjabatan');
        $data1 = $this->Mjabatan->print_pdf();
        if ($data1)
        {
            $data['lap_jabatan'] = $data1;
        }
        $this->load->view('jabatan/lap_jabatan',$data); 
    }

    public function cetak_lap_excel(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar Jabatan ke excel', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Mjabatan');
        $data['lap_jabatan'] = $this->Mjabatan->print_pdf();
        $this->load->view('jabatan/lap_jabatan_excel',$data); 
    }

}
?>