<?php
class Project extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mproject');
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

    function index(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar proyek', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'project?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mproject->count_data();
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

        $data['dataproject'] = $this->Mproject->getAll($batas,$offset); //query model semua barang

        $this->template('project/vproject', $data);
    }

    public function cari()
    {
        $key= $this->input->get('key'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'nama'=> $key,
        ); //array pencarian yang akan dibawa ke model

        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'project/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mproject->count_search($search); // jlh total barang
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

        $data['dataproject'] = $this->Mproject->getAll($batas,$offset,$search); //query model semua barang

        $this->template('project/vproject',$data);

    }

    function add(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke form buat data proyek baru', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $this->template('project/vformproject');
    }

    function add_save(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data project baru ".$_POST['nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $user = $this->session->userdata('id_user');
        $ins_sesion = $this->db->query("INSERT INTO project (nama, deskripsi, jenis, klien, tanggal_mulai) values ('".$_POST['nama']."', '".$_POST['deskripsi']."', '".$_POST['jenis']."', '".$_POST['klien']."', '".$_POST['tanggal_mulai']."')");
        $ids = $this->db->query("SELECT id_project from project where nama = '".$_POST['nama']."' and tanggal_mulai = '".$_POST['tanggal_mulai']."' and deskripsi = '".$_POST['deskripsi']."' ORDER BY id_project desc limit 1")->result();
        foreach ($ids as $ids) {$id_se = $ids->id_project;}

        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di simpan, Selanjutnya isi data kegiatan/jadwal</div>");

        redirect('project/add_step2/'.$id_se);
    }

    function add_step2(){
        $my_id_sesion = $this->uri->segment(3);
        $page=$this->input->get('per_page');
        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = $my_id_sesion.'?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mproject->count_data_job();
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

        $data['datapekerjaan'] = $this->Mproject->getAll_job($batas,$offset,$my_id_sesion); //query model semua barang

        $this->template('project/vformproject_job', $data);
    
    }

    function add_job(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menambahkan kegiatan ke pyroyek', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->db->query("UPDATE pekerjaan set id_project = '".$this->uri->segment(3)."' where id = '".$this->uri->segment(4)."' ");
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data pekerjaan berhasil di insert</div>");
        redirect('project'.'/add_step2/'.$this->uri->segment(3)); //jika berhasil maka akan ditampilkan view upload
    }

    function remove_job(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus kegiatan dari proyek', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->db->query("UPDATE pekerjaan set id_project = NULL where id = '".$this->uri->segment(4)."' ");
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data pekerjaan berhasil dihapus</div>");
        redirect('project'.'/add_step2/'.$this->uri->segment(3)); //jika berhasil maka akan ditampilkan view upload
    }

    public function cetak_view(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Daftar Proyek', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Mproject');
        $data1 = $this->Mproject->print_pdf();
        if ($data1)
        {
            $data['lap_project'] = $data1;
        }
        $this->load->view('project/lap_project',$data); 
    }


    public function print_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar proyek ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////    
        $this->load->model('Mproject');

        $data1 = $this->Mproject->print_pdf();
        if ($data1)
        {
            $data['lap_project'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('project/lap_project',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Proyek.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    function step_result(){
        $this->template('project/vformproject_result');
    }

    public function result_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar pekerjaan proyek ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////    
        $this->load->model('Mproject');
        $data1 = $this->Mproject->print_result_header();
        if ($data1)
        {
            $data['pekerjaan'] = $data1;
        }
         
        $data2 = $this->Mproject->print_result();
        if ($data2)
        {
            $data['pekerjaan2'] = $data2;
        }
        
        ob_start();
        $content = $this->load->view('project/lap_result_project',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('L', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Pekerjaan Proyek.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function result_xls(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar pekerjaan proyek ke excel', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Mproject');
        $data1 = $this->Mproject->print_result_header();
        if ($data1)
        {
            $data['pekerjaan'] = $data1;
        }
         
        $data2 = $this->Mproject->print_result();
        if ($data2)
        {
            $data['pekerjaan2'] = $data2;
        }
        $this->load->view('project/lap_result_project_xls',$data); 
    }

    public function datadiagram()
    {
        $this->load->view('project/vdatadiagram');
    }

    function add_step3(){
        $this->template('project/vformproject_calc');
    }

    function delete($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data proyek', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $where = array('id_project' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di hapus</div>");
        $this->Mproject->delete_data($where,'project');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function laporan(){
        $this->template('project/vlaporan');
    }

    function datalaporan(){
        $this->load->view('vdatalaporan');
    }

    function datalaporan2(){
        $this->load->view('vdatalaporan2');
    }

    function datalaporanpic_dash(){
        $this->load->view('vdatalaporanpic_dash');
    }

    function datalaporan_dash(){
        $this->load->view('vdatalaporan_dash');
    }
}
?>