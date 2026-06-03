<?php
class Supplier extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
        $this->load->model('Msupplier');
        $this->load->model('MstokMasuk');      
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
        $batas=10; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'supplier?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Msupplier->count_data();
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

        $data['datasupplier'] = $this->Msupplier->getAll($batas,$offset); //query model semua barang

        $this->template('supplier/vsupplier', $data);
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
        $config['base_url'] = base_url().'supplier/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Msupplier->count_search($search); // jlh total barang
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

        $data['datasupplier'] = $this->Msupplier->get_search($batas,$offset,$search); //query model semua barang

        $this->template('supplier/vsupplier',$data);

    }

    function add(){
        $this->template('supplier/vformsupplier');
    }

    function add_aksi(){
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
                  'nama' =>$this->input->post('nama'),
                  'alamat' =>$this->input->post('alamat'),
                  'telepon' =>$this->input->post('telepon'),
                  'keterangan' =>$this->input->post('keterangan'),
                  );

                $this->Msupplier->input_data($data); //akses model untuk menyimpan ke database
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
                redirect('supplier'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect('supplier'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'foto' =>'-',
              'nama' =>$this->input->post('nama'),
              'alamat' =>$this->input->post('alamat'),
              'telepon' =>$this->input->post('telepon'),
              'keterangan' =>$this->input->post('keterangan'),
              );

            $this->Msupplier->input_data($data); //akses model untuk menyimpan ke database
               
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
            redirect('supplier'); //jika berhasil maka akan ditampilkan view upload
        }
    }

    function delete($id){
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di hapus</div>");
        $this->Msupplier->delete_data($where,'supplier');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['datasupplier'] = $this->Msupplier->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('supplier/vformsupplieredit',$data);
    }


    function update_aksi(){
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
                  'nama' =>$this->input->post('pop_nama'),
                  'alamat' =>$this->input->post('pop_alamat'),
                  'telepon' =>$this->input->post('pop_telepon'),
                  'keterangan' =>$this->input->post('pop_keterangan'),
                  );

                $where = array(
                    'id' => $this->input->post('id_supplier')
                    );

                $this->Msupplier->update_data($where,$data,'supplier');

                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
                redirect('supplier'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect('supplier'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'nama' =>$this->input->post('pop_nama'),
              'alamat' =>$this->input->post('pop_alamat'),
              'telepon' =>$this->input->post('pop_telepon'),
              'keterangan' =>$this->input->post('pop_keterangan'),
              );

            $where = array(
            'id' => $this->input->post('id_supplier')
            );

            $this->Msupplier->update_data($where,$data,'supplier');
               
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
            redirect('supplier'); //jika berhasil maka akan ditampilkan view upload
        }
            
        
    }

    public function print_pdf(){
        $this->load->model('Msupplier');

        $data1 = $this->Msupplier->print_pdf();
        if ($data1)
        {
            $data['lap_supplier'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('supplier/lap_supplier',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar supplier.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        $this->load->model('Msupplier');
        $data1 = $this->Msupplier->print_pdf();
        if ($data1)
        {
            $data['lap_supplier'] = $data1;
        }
        $this->load->view('supplier/lap_supplier',$data); 
    }

    public function cetak_lap_excel(){
        $this->load->model('Msupplier');
        $data['lap_supplier'] = $this->Msupplier->print_pdf();
        $this->load->view('supplier/lap_supplier_excel',$data); 
    }

}
?>