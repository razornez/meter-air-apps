<?php
class Pekerjaan extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Mpekerjaan');
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
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke halaman daftar pekerjaan', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $page=$this->input->get('per_page');
        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'pekerjaan?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mpekerjaan->count_data();
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

        $data['datapekerjaan'] = $this->Mpekerjaan->getAll($batas,$offset); //query model semua barang

        $this->template('pekerjaan/vpekerjaan', $data);
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
        $config['base_url'] = base_url().'project/add_step2/'.$this->uri->segment(3).'/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mpekerjaan->count_search($search); // jlh total barang
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

        
        $data['datapekerjaan'] = $this->Mpekerjaan->get_search($batas,$offset,$search); //query model semua barang

        $this->template('pekerjaan/vpekerjaan',$data);

    }

    function add(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Masuk ke form buat data pekerjaan baru', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////
        $this->template('pekerjaan/vformpekerjaan');
    }

    function add_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data pekerjaan baru ".$_POST['nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->form_validation->set_rules('is_unique[pekerjaan.id]');
        
        $Te = ($this->input->post('waktu_optimis') + 4*$this->input->post('waktu_realistis') + $this->input->post('waktu_pesimis'))/6;

        $deviasi = ($this->input->post('waktu_pesimis') - $this->input->post('waktu_optimis')) / 6;
        $variance = pow($deviasi,2);

        $data = array(
          'nama' =>$this->input->post('nama'),
          'deskripsi' =>$this->input->post('deskripsi'),
          'waktu_optimis' =>$this->input->post('waktu_optimis'),
          'waktu_realistis' =>$this->input->post('waktu_realistis'),
          'waktu_pesimis' =>$this->input->post('waktu_pesimis'),
          'waktu_perkiraan' =>round($Te, 0,PHP_ROUND_HALF_UP),
          'deviasi' =>round($deviasi, 2,PHP_ROUND_HALF_UP),
          'variance' =>round($variance, 2,PHP_ROUND_HALF_UP),
          'id_project' =>$this->input->post('this_id'),
          'group' =>$this->input->post('group'),
          'status' =>0,
        );   
        
        $this->Mpekerjaan->input_data($data); //akses model untuk menyimpan ke database

        $get_job = $this->db->query("SELECT id FROM pekerjaan order by id desc limit 1")->result();
        foreach ($get_job as $gj) { $gj->id; };

        $list_job = $this->db->query("SELECT * FROM pekerjaan where id_project = ".$this->input->post('this_id')." order by id asc")->result();
        foreach ($list_job as $lj){
            if ($this->input->post('job_urut'.$lj->id)=='on'){
                $this->db->query("INSERT INTO pekerjaan_urut (id_pekerjaan, aktivitas_pendahulu) values (".$gj->id.", ".$lj->id.") ");
            }else{
                echo null;
            }
        }

        $get_urut = $this->db->query("SELECT * FROM pekerjaan_urut where id_pekerjaan = ".$gj->id." ")->num_rows();
        if ($get_urut <= 0){
            $this->db->query("UPDATE pekerjaan set tanggal_mulai = (SELECT tanggal_mulai FROM project WHERE id_project = ".$this->input->post('this_id')." ) WHERE id = ".$gj->id." ");
            $this->db->query("UPDATE pekerjaan set tanggal_selesai = DATE_ADD(tanggal_mulai, INTERVAL waktu_perkiraan DAY) WHERE id = ".$gj->id." ");
        }else{
            $get_date = $this->db->query("SELECT tanggal_selesai FROM pekerjaan p join pekerjaan_urut pu on p.id = pu.aktivitas_pendahulu WHERE pu.id_pekerjaan = ".$gj->id." ORDER BY tanggal_selesai desc limit 1")->result();
            foreach ($get_date as $gd) { $gd->tanggal_selesai; };

            $this->db->query("UPDATE pekerjaan set tanggal_mulai = '".$gd->tanggal_selesai."' WHERE id = ".$gj->id." ");
            $this->db->query("UPDATE pekerjaan set tanggal_selesai = DATE_ADD(tanggal_mulai, INTERVAL waktu_perkiraan DAY) WHERE id = ".$gj->id." ");
        }

        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di insert</div>");
        redirect('project'.'/add_step2/'.$this->input->post('this_id'));
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datapekerjaan'] = $this->Mpekerjaan->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('pekerjaan/vformpekerjaanedit',$data);
    }


    function update_aksi(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Merubah data pekerjaan', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////

        $Te = ($this->input->post('waktu_optimis') + 4*$this->input->post('waktu_realistis') + $this->input->post('waktu_pesimis'))/6;

        $deviasi = ($this->input->post('waktu_pesimis') - $this->input->post('waktu_optimis')) / 6;
        $variance = pow($deviasi,2);

        $data = array(
          'nama' =>$this->input->post('nama'),
          'deskripsi' =>$this->input->post('deskripsi'),
          'waktu_optimis' =>$this->input->post('waktu_optimis'),
          'waktu_realistis' =>$this->input->post('waktu_realistis'),
          'waktu_pesimis' =>$this->input->post('waktu_pesimis'),
          'waktu_perkiraan' =>round($Te, 0,PHP_ROUND_HALF_UP),
          'deviasi' =>round($deviasi, 2,PHP_ROUND_HALF_UP),
          'variance' =>round($variance, 2,PHP_ROUND_HALF_UP),
          'group' =>$this->input->post('group'),
          );
        $myid = $this->db->query("SELECT id from pekerjaan where id=".$this->input->post('id')."");
        $myid_rs = $myid->row();

        $where = array(
            'id' => $myid_rs->id
            );

        $this->Mpekerjaan->update_data($where,$data,'pekerjaan');
        
        $get_date = $this->db->query("SELECT tanggal_selesai FROM pekerjaan p join pekerjaan_urut pu on p.id = pu.aktivitas_pendahulu WHERE pu.id_pekerjaan = ".$this->input->post('this_id')." ORDER BY tanggal_selesai desc limit 1")->result();
        foreach ($get_date as $gd) { $gd->tanggal_selesai; };

        $this->db->query("UPDATE pekerjaan set tanggal_mulai = '".$gd->tanggal_selesai."' WHERE id = ".$this->input->post('this_id')." ");
        $this->db->query("UPDATE pekerjaan set tanggal_selesai = DATE_ADD(tanggal_mulai, INTERVAL waktu_perkiraan DAY) WHERE id = ".$this->input->post('this_id')." ");
        
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di update</div>");
        redirect('project'.'/add_step2/'.$this->input->post('this_id_pro'));
            
        
    }

    function add_pic(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menambah data PIC baru', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $this->db->query("INSERT INTO pic (id_pekerjaan, id_pic) values ('".$_POST['id_pic']."', '".$_POST['data_pic']."') ");
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data PIC berhasil di insert</div>");
        redirect($_SERVER['HTTP_REFERER']); //jika berhasil maka akan ditampilkan view upload
    }

    function add_done(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Membuat data project baru ".$_POST['nama']."', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $selesai = $_POST['tgl_selesai'].' '.date('H:i:s');
        $ins_log = $this->db->query("INSERT INTO log_pekerjaan (pic, proyek, pekerjaan, tgl_selesai, sisa_waktu, keterangan) values ('".$_POST['pic']."', '".$_POST['proyek']."', '".$_POST['pekerjaan']."', '".$selesai."', '".$_POST['waktu_sisa_save']."', '".$_POST['keterangan']."')");

        $update_data_pekerjaan = $this->db->query("UPDATE pekerjaan set status = 1, tgl_done = '".$_POST['tgl_selesai']."' WHERE id = '".$_POST['id_pekerjaan']."' ");

        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di simpan</div>");

        redirect($_SERVER['HTTP_REFERER']);
    }

    function delete($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data pekerjaan', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data berhasil di hapus</div>");
        $this->Mpekerjaan->delete_data($where,'pekerjaan');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function delete_pic($id){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Menghapus data pic', '".date('Y-m-d H:i:s')."', 'action') ");
        ///////log aktivitas////////
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-success\" id=\"alert\"><i class=\"glyphicon glyphicon-ok\"></i> Data pic berhasil di hapus</div>");
        $this->Mpekerjaan->delete_data_pic($where,'pekerjaan');
        redirect($_SERVER['HTTP_REFERER']);
    }


    public function print_pdf(){
    ///////log aktivitas/////////
    $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar pekerjaan ke pdf', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
    ///////log aktivitas////////   
        $this->load->model('Mpekerjaan');

        $data1 = $this->Mpekerjaan->print_pdf();
        if ($data1)
        {
            $data['lap_pekerjaan'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('pekerjaan/lap_pekerjaan',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('L', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar Pekerjaan.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Daftar Pekerjaan', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   
        $this->load->model('Mpekerjaan');
        $data1 = $this->Mpekerjaan->print_pdf();
        if ($data1)
        {
            $data['lap_pekerjaan'] = $data1;
        }
        $this->load->view('pekerjaan/lap_pekerjaan',$data); 
    }

    public function cetak_lap_excel(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mengunduh dokumen daftar pekerjaan ke excel', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////    
        $this->load->model('Mpekerjaan');
        $data['lap_pekerjaan'] = $this->Mpekerjaan->print_pdf();
        $this->load->view('Pekerjaan/lap_pekerjaan_excel',$data); 
    }

    public function getDataJson()
    {
        //$this->db = $this->load->database('default');
        //$data = array();
        $sql = $this->db->query("SELECT * FROM pekerjaan where id_project = 9 ")->result();

        $prefix = '';
            echo "[\n";
            foreach ( $sql as $row ) {
              echo $prefix . " {\n";
              echo '  id: "' . $row->id . '",' . "\n";
              echo '  title: "' . $row->nama . '",' . "\n";

              echo '  parents: [';
              $sql_p = $this->db->query("SELECT aktivitas_pendahulu FROM pekerjaan_urut where id_pekerjaan = ".$row->id." ")->result();
              foreach ($sql_p as $p) {
                  echo $p->aktivitas_pendahulu.', ';
              }
              echo '],'. "\n";
              echo '  et: "' . $row->waktu_perkiraan . '",' . "\n";
              echo '  lt: "' . $row->waktu_pesimis . '",' . "\n";
              echo '  itemTitleColor: "#4b0082"' . "\n";
              echo " }";
              $prefix = ",\n";
            }
            echo "\n]<br><br><br>";

          $sql_slack = $this->db->query("SELECT id FROM pekerjaan where id_project = 9 and slack = 0 ")->result();

          $prefix = '';
          echo "[\n";
          foreach ( $sql_slack as $row ) {
            echo $row->id. ',' . "\n";
          }
          echo "\n],";
    }

}
?>