<?php
class Pegawai extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mpegawai');
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
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar Pegawai', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'pegawai?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mpegawai->count_data();
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

        $data['datapegawai'] = $this->Mpegawai->getAll($batas,$offset); //query model semua barang

        $this->template('pegawai/vpegawai', $data);
    }

    function laporan(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar log pekerjaan', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'pegawai?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mpegawai->count_data_log();
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

        $data['datapekerjaan'] = $this->Mpegawai->getAll_log($batas,$offset); //query model semua barang

        $this->template('pegawai/vlaporan', $data);
    }

    function laporan_search()
    {
        $key= $this->input->get('key'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'pic'=> $key,
        ); //array pencarian yang akan dibawa ke model

        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++;; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'pegawai/?key='.$key;//url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mpegawai->count_data_log_search($search); // jlh total barang
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

        $query = $this->db->query("SELECT * FROM log_pekerjaan where pic like '%".$key."%' order by pic asc limit $offset, $batas")->result();

        $data['datapekerjaan'] = $query; //query model semua barang

        $this->template('pegawai/vlaporan',$data);

    }

    public function cari()
    {
        $key= $this->input->get('key'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'pegawai.nama'=> $key,
        ); //array pencarian yang akan dibawa ke model

        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++;; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'pegawai/?key='.$key;//url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mpegawai->count_search($search); // jlh total barang
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

        $query = $this->db->query("SELECT *, p.nama as nama, j.nama as jabatan, d.nama as divisi FROM pegawai p join jabatan j on p.id_jabatan = j.id join divisi d on p.id_divisi = d.id where p.nama like '%".$key."%' order by p.nama asc limit $offset, $batas")->result();

        $data['datapegawai'] = $query; //query model semua barang

        $this->template('pegawai/vpegawai',$data);

    }

    function add(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke form buat data pegawai baru', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $this->template('pegawai/vforMpegawai');
    }

    function add_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data pegawai baru ".$_POST['nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->form_validation->set_rules('is_unique[pegawai.id_pegawai]');
        $this->load->library('upload');
        $nmfile = "file_".time(); //nama file + fungsi time
        $config['upload_path'] = 'img/foto/'; //Folder untuk menyimpan hasil upload
        $config['allowed_types'] = 'gif|jpg|png|jpeg|bmp'; //type yang dapat diakses bisa anda sesuaikan
        $config['max_size'] = '3072'; //maksimum besar file 3M
        $config['max_width']  = '3000'; //lebar maksimum 5000 px
        $config['max_height']  = '3000'; //tinggi maksimu 5000 px
        $config['file_name'] = $nmfile; //nama yang terupload nantinya

        $this->upload->initialize($config);
        
        if($_FILES['foto_def']['name'])
        {
            if ($this->upload->do_upload('foto_def'))
            {
                $gbr = $this->upload->data();
                $data = array(
                  'foto_def' =>$gbr['file_name'],
                  'nip' =>$this->input->post('nip'),
                  'nama' =>$this->input->post('nama'),
                  'id_jabatan' =>$this->input->post('id_jabatan'),
                  'id_divisi' =>$this->input->post('id_divisi'),
                  'alamat' =>$this->input->post('alamat'),
                  'jenis_kelamin' =>$this->input->post('jenis_kelamin'),
                  'created_by' =>$this->session->userdata('id_user'),
                  'date_update' =>date('Y-m-d H:i:s'),
                  'status' => 'on',
                  );

                $this->Mpegawai->input_data($data); //akses model untuk menyimpan ke database
                //dibawah ini merupakan code untuk resize
                $config2['image_library'] = 'gd2'; 
                $config2['source_image'] = $this->upload->upload_path.$this->upload->file_name;
                $config2['new_image'] = 'img/foto/'; // folder tempat menyimpan hasil resize
                $config2['maintain_ratio'] = TRUE;
                $config2['width'] = 100; //lebar setelah resize menjadi 100 px
                $config2['height'] = 100; //lebar setelah resize menjadi 100 px
                $this->load->library('image_lib',$config2); 

                //pesan yang muncul jika resize error dimasukkan pada session flashdata
                if ( !$this->image_lib->resize()){
                    $this->session->set_flashdata('pesan', $this->image_lib->display_errors('', ''));   
                }
                //pesan yang muncul jika berhasil diupload pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di insert</div>");
                redirect('pegawai'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"col-md-12\"><div class=\"alert alert-danger\" id=\"alert\">".$this->upload->display_errors('', '')."</div></div>");
                redirect('pegawai/add'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'foto_def' =>'NULL',
              'foto_new' =>'NULL',
              'nip' =>$this->input->post('nip'),
              'nama' =>$this->input->post('nama'),
              'id_jabatan' =>$this->input->post('id_jabatan'),
              'id_divisi' =>$this->input->post('id_divisi'),
              'alamat' =>$this->input->post('alamat'),
              'jenis_kelamin' =>$this->input->post('jenis_kelamin'),
              'created_by' =>$this->session->userdata('id_user'),
              'date_update' =>date('Y-m-d H:i:s'),
              'status' => 'on',
              );

            $this->Mpegawai->input_data($data); //akses model untuk menyimpan ke database
               
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di insert</div>");
            redirect('pegawai'); //jika berhasil maka akan ditampilkan view upload
        }
    }

    function delete($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data pegawai', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        //$where = array('id_pegawai' => $id);
        $query = $this->db->query("UPDATE pegawai set status = 'off' where id_pegawai = ".$id." ");
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di nonaktifkan</div>");
        //$this->Mpegawai->delete_data($where,'pegawai');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function aktif($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengaktifkan data pegawai', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        //$where = array('id_pegawai' => $id);
        $query = $this->db->query("UPDATE pegawai set status = 'on' where id_pegawai = ".$id." ");
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di aktifkan</div>");
        //$this->Mpegawai->delete_data($where,'pegawai');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id_pegawai' => $id);
        $data['datapegawai'] = $this->Mpegawai->getWhere(array('id_pegawai'=>$this->uri->segment(3)))->row_array();
        $this->template('pegawai/vformpegawaiedit',$data);
    }


    function update_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Merubah data pegawai', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->load->library('upload');
        $nmfile = "file_".time(); //nama file + fungsi time
        $config['upload_path'] = 'img/foto/'; //Folder untuk menyimpan hasil upload
        $config['allowed_types'] = 'gif|jpg|png|jpeg|bmp'; //type yang dapat diakses bisa anda sesuaikan
        $config['max_size'] = '3072'; //maksimum besar file 3M
        $config['max_width']  = '3000'; //lebar maksimum 5000 px
        $config['max_height']  = '3000'; //tinggi maksimu 5000 px
        $config['file_name'] = $nmfile; //nama yang terupload nantinya

        $this->upload->initialize($config);

        if($_FILES['foto_new']['name'])
        {
            if ($this->upload->do_upload('foto_new'))
            {
                $gbr = $this->upload->data();
                $data = array(
                  'foto_def' =>$gbr['file_name'],
                  'foto_new' =>$gbr['file_name'],
                  'nip' =>$this->input->post('nip'),
                  'nama' =>$this->input->post('nama'),
                  'id_jabatan' =>$this->input->post('id_jabatan'),
                  'id_divisi' =>$this->input->post('id_divisi'),
                  'alamat' =>$this->input->post('alamat'),
                  'jenis_kelamin' =>$this->input->post('jenis_kelamin'),
                  'created_by' =>$this->session->userdata('id_user'),
                  'date_update' =>date('Y-m-d H:i:s'),
                  );

                $myid = $this->db->query("SELECT id_pegawai from pegawai where id_pegawai=".$this->input->post('id_pegawai')."");
                $myid_rs = $myid->row();

                $where = array(
                    'id_pegawai' => $myid_rs->id_pegawai
                    );

                $this->Mpegawai->update_data($where,$data,'pegawai');
                //dibawah ini merupakan code untuk resize
                $config2['image_library'] = 'gd2'; 
                $config2['source_image'] = $this->upload->upload_path.$this->upload->file_name;
                $config2['new_image'] = 'img/foto/'; // folder tempat menyimpan hasil resize
                $config2['maintain_ratio'] = TRUE;
                $config2['width'] = 100; //lebar setelah resize menjadi 100 px
                $config2['height'] = 100; //lebar setelah resize menjadi 100 px
                $this->load->library('image_lib',$config2); 

                //pesan yang muncul jika resize error dimasukkan pada session flashdata
                if ( !$this->image_lib->resize()){
                    $this->session->set_flashdata('pesan', $this->image_lib->display_errors('', ''));   
                }
                //pesan yang muncul jika berhasil diupload pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di update</div>");
                redirect('pegawai'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"col-md-12\"><div class=\"alert alert-danger\" id=\"alert\">".$this->upload->display_errors('', '')."</div></div>");
                redirect('pegawai/edit'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'foto_new' =>'NULL',
              'nip' =>$this->input->post('nip'),
              'nama' =>$this->input->post('nama'),
              'id_jabatan' =>$this->input->post('id_jabatan'),
              'id_divisi' =>$this->input->post('id_divisi'),
              'alamat' =>$this->input->post('alamat'),
              'jenis_kelamin' =>$this->input->post('jenis_kelamin'),
              'created_by' =>$this->session->userdata('id_user'),
              'date_update' =>date('Y-m-d H:i:s'),
              );

            $myid = $this->db->query("SELECT id_pegawai from pegawai where id_pegawai=".$this->input->post('id_pegawai')."");
            $myid_rs = $myid->row();

            $where = array(
                    'id_pegawai' => $myid_rs->id_pegawai
                );

            $this->Mpegawai->update_data($where,$data,'pegawai');
               
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di insert</div>");
            redirect('pegawai'); //jika berhasil maka akan ditampilkan view upload
        }
    }

    public function print_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar pegawai ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////   
        $this->load->model('Mpegawai');

        $data1 = $this->Mpegawai->print_pdf();
        if ($data1)
        {
            $data['lap_pegawai'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('pegawai/lap_pegawai',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Pegawai.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Daftar Pegawai', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   
        $this->load->model('Mpegawai');
        $data1 = $this->Mpegawai->print_pdf();
        if ($data1)
        {
            $data['lap_pegawai'] = $data1;
        }
        $this->load->view('pegawai/lap_pegawai',$data); 
    }

    public function cetak_lap_excel(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar pegawai ke excel', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Mpegawai');
        $data['lap_pegawai'] = $this->Mpegawai->print_pdf();
        $this->load->view('pegawai/lap_pegawai_excel',$data); 
    }

}
?>