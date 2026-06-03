<?php
class Produk extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->library('zend','database');
        $this->load->helper('url');
        $this->load->model('Mproduk');
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
        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'produk?';   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mproduk->count_data();
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

        $data['datasupplier'] = $this->Msupplier->get_search(0,0);
        $data['dataproduk'] = $this->Mproduk->getAll($batas,$offset); //query model semua barang

        $this->template('produk/vproduk', $data);
    }

    public function cari()
    {
        $key= $this->input->get('search_nama'); //method get key
        $page=$this->input->get('per_page');  //method get per_page

        $search=array(
            'produk.nama'=> $key,
            'produk.barcode'=> $key,
        ); //array pencarian yang akan dibawa ke model

        $batas=5; //jlh data yang ditampilkan per halaman
        if(!$page):     //jika page bernilai kosong maka batas akhirna akan di set 0
        $offset = 0;
        else:
           $offset = $page++; // jika tidak kosong maka nilai batas akhir nya akan diset nilai page terakhir
       endif;

        $config['page_query_string'] = TRUE; //mengaktifkan pengambilan method get pada url default
        $config['base_url'] = base_url().'produk/?key='.$key;   //url yang muncul ketika tombol pada paging diklik
        $config['total_rows'] = $this->Mproduk->count_search($search); // jlh total barang
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

        $data['dataproduk'] = $this->Mproduk->get_search($batas,$offset,$search); //query model semua barang

        $this->template('produk/vproduk',$data);

    }

    function add(){
        $this->template('produk/vformproduk');
    }

    function add_aksi(){

        $cek=$this->db->query("SELECT barcode from produk order by id desc limit 1");
        if(count($cek->result()) == 0){
            $no_produk='B'.date('dmy')."0001";
        }else{
            $cek_tgl=$this->db->query("SELECT DATE_FORMAT(date_add,'%Y-%m-%d') as tanggal from produk order by id desc limit 1")->row()->tanggal;
            if($cek_tgl != date('Y-m-d')){
                $no_produk='B'.date('dmy')."0001";
            }else{
                $get_counter= substr($cek->row()->barcode,-4);
                $counter = $get_counter +1;
                $tmp_no_produk = str_pad($counter, 4, "0", STR_PAD_LEFT);
                $no_produk='B'.date('dmy').$tmp_no_produk;
            }

        }

        $this->zend->load('Zend/Barcode'); 
        $barcode = $no_produk;
        $imageResource = Zend_Barcode::factory('code128', 'image', array('text'=>$barcode), array())->draw();
        $imageName = $barcode.'.jpg';
        $imagePath = 'img/barcode/'; 
        imagejpeg($imageResource, $imagePath.$imageName); 
        $pathBarcode = $imagePath.$imageName;

        $this->load->library('upload');
        $nmfile = "file_".time(); //nama file + fungsi time
        $config['upload_path'] = 'img/produk/'; //Folder untuk menyimpan hasil upload
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
                  'barcode' =>$no_produk,
                  'nama' =>str_replace('"',"'",$this->input->post('nama')),
                  'satuan' =>$this->input->post('satuan'),
                  'kategori' =>$this->input->post('kategori'),
                  'harga' =>str_replace(',','',$this->input->post('harga')),
                  'harga_jual' =>str_replace(',','',$this->input->post('harga_jual')),
                  'date_add' =>date('Y-m-d'),
                  'stok' =>$this->input->post('stok'),
                  'barcode_img' =>$pathBarcode,
                  );

                $this->Mproduk->input_data($data); //akses model untuk menyimpan ke database
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
                redirect('produk'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect('produk'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'foto' =>'-',
              'barcode' =>$no_produk,
              'nama' =>str_replace('"',"'",$this->input->post('nama')),
              'satuan' =>$this->input->post('satuan'),
              'kategori' =>$this->input->post('kategori'),
              'harga' =>str_replace(',','',$this->input->post('harga')),
              'harga_jual' =>str_replace(',','',$this->input->post('harga_jual')),
              'date_add' =>date('Y-m-d'),
              'stok' =>$this->input->post('stok'),
              'barcode_img' =>$pathBarcode,
              );

            $this->Mproduk->input_data($data); //akses model untuk menyimpan ke database
               
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
            redirect('produk'); //jika berhasil maka akan ditampilkan view upload
        }
    }

    function delete($id){
        $where = array('id' => $id);
        $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di hapus</div>");
        $this->Mproduk->delete_data($where,'produk');
        redirect($_SERVER['HTTP_REFERER']);
    }

    function edit($id){
        $where = array('id' => $id);
        $data['dataproduk'] = $this->Mproduk->getWhere(array('id'=>$this->uri->segment(3)))->row_array();
        $this->template('produk/vformprodukedit',$data);
    }


    function update_aksi(){
        $this->load->library('upload');
        $nmfile = "file_".time(); //nama file + fungsi time
        $config['upload_path'] = 'img/produk/'; //Folder untuk menyimpan hasil upload
        $config['allowed_types'] = 'gif|jpg|png|jpeg|bmp'; //type yang dapat diakses bisa anda sesuaikan
        $config['max_size'] = '3072'; //maksimum besar file 3M
        $config['max_width']  = '3000'; //lebar maksimum 5000 px
        $config['max_height']  = '3000'; //tinggi maksimu 5000 px
        $config['file_name'] = $nmfile; //nama yang terupload nantinya

        $this->zend->load('Zend/Barcode'); 
        $barcode = $this->input->post('pop_barcode');
        $imageResource = Zend_Barcode::factory('code128', 'image', array('text'=>$barcode), array())->draw();
        $imageName = $barcode.'.jpg';
        $imagePath = 'img/barcode/'; 
        imagejpeg($imageResource, $imagePath.$imageName); 
        $pathBarcode = $imagePath.$imageName;

        $this->upload->initialize($config);
        
        if($_FILES['pop_foto']['name'])
        {
            if ($this->upload->do_upload('pop_foto'))
            {
                $gbr = $this->upload->data();
                $data = array(
                  'foto' =>$gbr['file_name'],
                  'barcode' =>$this->input->post('pop_barcode'),
                  'nama' =>str_replace('"',"'",$this->input->post('pop_nama')),
                  'satuan' =>$this->input->post('pop_satuan'),
                  'kategori' =>$this->input->post('pop_kategori'),
                  'harga' =>str_replace(',','',$this->input->post('pop_harga')),
                  'harga_jual' =>str_replace(',','',$this->input->post('pop_harga_jual')),
                  'stok' =>$this->input->post('pop_stok'),
                  'barcode_img' =>$pathBarcode,
                  );

                $where = array(
                    'id' => $this->input->post('id_produk')
                    );

                $this->Mproduk->update_data($where,$data,'produk');

                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
                redirect('produk'); //jika berhasil maka akan ditampilkan view upload
            }else{
                //pesan yang muncul jika terdapat error dimasukkan pada session flashdata
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect('produk'); //jika gagal maka akan ditampilkan form upload
            }
        }else{
            $data = array(
              'barcode' =>$this->input->post('pop_barcode'),
              'nama' =>str_replace('"',"'",$this->input->post('pop_nama')),
              'satuan' =>$this->input->post('pop_satuan'),
              'kategori' =>$this->input->post('pop_kategori'),
              'harga' =>str_replace(',','',$this->input->post('pop_harga')),
              'harga_jual' =>str_replace(',','',$this->input->post('pop_harga_jual')),
              'stok' =>$this->input->post('pop_stok'),
              'barcode_img' =>$pathBarcode,
              );

            $where = array(
            'id' => $this->input->post('id_produk')
            );

            $this->Mproduk->update_data($where,$data,'produk');
               
            $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di simpan</div>");
            redirect('produk'); //jika berhasil maka akan ditampilkan view upload
        }
    }

    public function print_pdf(){
        $this->load->model('Mproduk');

        $data1 = $this->Mproduk->print_pdf();
        if ($data1)
        {
            $data['lap_produk'] = $data1;
        }
        
        ob_start();
        $content = $this->load->view('produk/lap_produk',$data);
        $content = ob_get_clean();      
        $this->load->library('html2pdf');
        try
        {
            $html2pdf = new HTML2PDF('P', 'A4', 'en', true, 'UTF-8', array(20, 10, 20, 20));
            $html2pdf->setDefaultFont("arial");
            $html2pdf->pdf->SetDisplayMode('fullpage');
            $html2pdf->writeHTML($content, isset($_GET['vuehtml']));
            $html2pdf->Output('Laporan Daftar produk.pdf');
        }
        catch(HTML2PDF_exception $e) {
            echo $e;
            exit;
        }
        
    }

    public function cetak_view(){
        $this->load->model('Mproduk');
        $data1 = $this->Mproduk->print_pdf();
        if ($data1)
        {
            $data['lap_produk'] = $data1;
        }
        $this->load->view('produk/lap_produk',$data); 
    }

    public function cetak_lap_excel(){
        $this->load->model('Mproduk');
        $data['lap_produk'] = $this->Mproduk->print_pdf();
        $this->load->view('produk/lap_produk_excel',$data); 
    }

    public function cetak_barcode(){
        ///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Mencetak Barcode', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas////////   

            $this->load->view('produk/cetak_barcode'); 
    }

}
?>