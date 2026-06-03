<?php
class User extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Muser');
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
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar user', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'user?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Muser->count_data();
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

        $data['datauser'] = $this->Muser->getAll($batas,$offset); //query model semua barang

        $this->template('user/vuser', $data);
    }

    public function cari()
    {
        $key= $this->input->get('key'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'username'=> $key,
            'fullname'=> $key
        ); //array pencarian yang akan dibawa ke model

        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'user/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Muser->count_search($search); // jlh total barang
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

        $data['datauser'] = $this->Muser->get_search($batas,$offset,$search); //query model semua barang

        $this->template('user/vuser',$data);

    }

    function add(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke form buat data user baru', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $this->template('user/vformuser');
    }

    function add_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data user baru ".$_POST['ss_nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->form_validation->set_rules('is_unique[users.id_user]');
        $this->load->library('upload');
        $nmfile = "file_".time(); //nama file + fungsi time
        $config['upload_path'] = 'img/'; //Folder untuk menyimpan hasil upload
        $config['allowed_types'] = 'gif|jpg|png|jpeg|bmp'; //type yang dapat diakses bisa anda sesuaikan
        $config['max_size'] = '3072'; //maksimum besar file 3M
        $config['max_width']  = '3000'; //lebar maksimum 5000 px
        $config['max_height']  = '3000'; //tinggi maksimu 5000 px
        $config['file_name'] = $nmfile; //nama yang terupload nantinya

        $this->upload->initialize($config);
        
        if($_FILES['foto']['name'])
        {
            if ($this->upload->do_upload('foto'))
            {
                $gbr = $this->upload->data();
                $data = array(
                  'foto' =>$gbr['file_name'],
                  'username' =>$this->input->post('username'),
                  'password' =>$this->input->post('password'),
                  'fullname' =>$this->input->post('fullname'),
                  'is_active' =>$this->input->post('is_active'),
                  
                  );

                $this->Muser->input_data($data); //akses model untuk menyimpan ke database
                //dibawah ini merupakan code untuk resize
                $config2['image_library'] = 'gd2'; 
                $config2['source_image'] = $this->upload->upload_path.$this->upload->file_name;
                $config2['new_image'] = 'img/'; // folder tempat menyimpan hasil resize
                $config2['maintain_ratio'] = TRUE;
                $config2['width'] = 100; //lebar setelah resize menjadi 100 px
                $config2['height'] = 100; //lebar setelah resize menjadi 100 px
                $this->load->library('image_lib',$config2); 

                //pesan yang muncul jika resize error dimasukkan pada session flashdata
                if ( !$this->image_lib->resize()){
                    $this->session->set_flashdata('pesan', $this->image_lib->display_errors('', ''));   
                }
                //pesan yang muncul jika berhasil diupload pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
                redirect('user'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect('user/add'); //jika gagal maka akan ditampilkan form upload
            }
        }
    }

    function delete($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data user', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $where = array('id_user' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di hapus</div>");
        $this->Muser->delete_data($where,'users');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit(){
        $where = array('id_user' => $this->session->userdata('id_user'));
        $data['datauser'] = $this->Muser->getWhere(array('id_user'=>$this->session->userdata('id_user')))->row_array();
        $this->template('user/vformuseredit',$data);
    }


    function update_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Merubah data user', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->load->library('upload');
        $nmfile = "file_".time(); //nama file + fungsi time
        $config['upload_path'] = 'img/'; //Folder untuk menyimpan hasil upload
        $config['allowed_types'] = 'gif|jpg|png|jpeg|bmp'; //type yang dapat diakses bisa anda sesuaikan
        $config['max_size'] = '3072'; //maksimum besar file 3M
        $config['max_width']  = '3000'; //lebar maksimum 5000 px
        $config['max_height']  = '3000'; //tinggi maksimu 5000 px
        $config['file_name'] = $nmfile; //nama yang terupload nantinya

        $this->upload->initialize($config);

        if($_FILES['pop_foto']['name'])
        {
            if ($this->upload->do_upload('pop_foto'))
            {
                $gbr = $this->upload->data();
                $data = array(
                  'foto' =>$gbr['file_name'],
                  'username' =>$this->input->post('pop_username'),
                  'password' =>$this->input->post('pop_password'),
                  'fullname' =>$this->input->post('pop_fullname'),
                  'is_active' =>$this->input->post('pop_is_active'),
                  
                  );

                $where = array(
                    'id_user' => $this->input->post('pop_id_user')
                    );

                $this->Muser->update_data($where,$data,'users');
                //dibawah ini merupakan code untuk resize
                $config2['image_library'] = 'gd2'; 
                $config2['source_image'] = $this->upload->upload_path.$this->upload->file_name;
                $config2['new_image'] = 'img/'; // folder tempat menyimpan hasil resize
                $config2['maintain_ratio'] = TRUE;
                $config2['width'] = 100; //lebar setelah resize menjadi 100 px
                $config2['height'] = 100; //lebar setelah resize menjadi 100 px
                $this->load->library('image_lib',$config2); 

                //pesan yang muncul jika resize error dimasukkan pada session flashdata
                if ( !$this->image_lib->resize()){
                    $this->session->set_flashdata('pesan', $this->image_lib->display_errors('', ''));   
                }
                //pesan yang muncul jika berhasil diupload pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
                redirect('user'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect('user/edit'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'username' =>$this->input->post('pop_username'),
              'password' =>$this->input->post('pop_password'),
              'fullname' =>$this->input->post('pop_fullname'),
              'is_active' =>$this->input->post('pop_is_active'),

              );

            $where = array(
                'id_user' => $this->input->post('pop_id_user')
                );

            $this->Muser->update_data($where,$data,'users');

            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
                redirect('user');
        }
    }

    public function print_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar user ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////    
        $this->load->model('Muser');

        $data1 = $this->Muser->print_pdf();
        if ($data1)
        {
            $data['lap_user'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('user/lap_user',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar User.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Daftar User', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////      
        $this->load->model('Muser');
        $data1 = $this->Muser->print_pdf();
        if ($data1)
        {
            $data['lap_user'] = $data1;
        }
        $this->load->view('user/lap_user',$data); 
    }

    public function cetak_lap_excel(){ 
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar user ke excel', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Muser');
        $data['lap_user'] = $this->Muser->print_pdf();
        $this->load->view('user/lap_user_excel',$data); 
    }

}
?>