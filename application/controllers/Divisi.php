<?php
class Divisi extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mdivisi');
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
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar Divisi', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'divisi?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mdivisi->count_data();
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

        $data['datadivisi'] = $this->Mdivisi->getAll($batas,$offset); //query model semua barang

        $this->template('divisi/vdivisi', $data);
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
        $config['base_url'] = base_url().'divisi/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mdivisi->count_search($search); // jlh total barang
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

        $data['datadivisi'] = $this->Mdivisi->get_search($batas,$offset,$search); //query model semua barang

        $this->template('divisi/vdivisi',$data);

    }

    function add(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke form buat data Divisi baru', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $this->template('divisi/vformdivisi');
    }

    function add_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data Divisi baru ".$_POST['ss_nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->form_validation->set_rules('is_unique[divisi.id]');
        
        $data = array(
          'nama' =>$this->input->post('nama'),

        );

            $this->Mdivisi->input_data($data); //akses model untuk menyimpan ke database
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di insert</div>");
            redirect('divisi'); //jika berhasil maka akan ditampilkan view upload
    }

    function delete($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data Divisi', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di hapus</div>");
        $this->Mdivisi->delete_data($where,'divisi');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datadivisi'] = $this->Mdivisi->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('divisi/vformdivisiedit',$data);
    }


    function update_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Merubah data Divisi', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $data = array(
          'nama' =>$this->input->post('nama'),
          );
        $myid = $this->db->query("SELECT id from divisi where id=".$this->input->post('id')."");
        $myid_rs = $myid->row();

        $where = array(
            'id' => $myid_rs->id
            );

        $this->Mdivisi->update_data($where,$data,'divisi');
        
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di update</div>");
        redirect('divisi'); //jika berhasil maka akan ditampilkan view upload
            
        
    }

    public function print_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar Divisi ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////   
        $this->load->model('Mdivisi');

        $data1 = $this->Mdivisi->print_pdf();
        if ($data1)
        {
            $data['lap_divisi'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('divisi/lap_divisi',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Divisi.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Daftar Divisi', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   
        $this->load->model('Mdivisi');
        $data1 = $this->Mdivisi->print_pdf();
        if ($data1)
        {
            $data['lap_divisi'] = $data1;
        }
        $this->load->view('divisi/lap_divisi',$data); 
    }

    public function cetak_lap_excel(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar divisi ke excel', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Mdivisi');
        $data['lap_divisi'] = $this->Mdivisi->print_pdf();
        $this->load->view('divisi/lap_divisi_excel',$data); 
    }

}
?>