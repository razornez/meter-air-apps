<?php
class Config extends CI_Controller
{

    private $alert = '';

    function __construct(){
        parent::__construct();
        // konfigurasi helper & library
        $this->load->library('session');
        $this->load->database(); // load database
        $this->load->library('pagination');
        $this->load->helper('url');
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
        $data['dataconfig'] = $this->Mconfig->getWhere();
        $this->template('config/vconfig',$data);
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

        if($_FILES['foto']['name'])
        {
            if ($this->upload->do_upload('foto'))
            {
                $gbr = $this->upload->data();
                $data = array(
                  'logo' =>$gbr['file_name'],
                  'perusahaan' =>$this->input->post('perusahaan'),
                  'telp' =>$this->input->post('telp'),
                  'alamat' =>$this->input->post('alamat'),
                  'link_app' =>$this->input->post('link_app'),
                  'show_supplier' =>$this->input->post('show_supplier') == 'on' ? '1' : '0',
                  'show_stok_masuk' =>$this->input->post('show_stok_masuk') == 'on' ? '1' : '0',
                  'show_stok_keluar' =>$this->input->post('show_stok_keluar') == 'on' ? '1' : '0',
                  'show_laporan_stok' =>$this->input->post('show_laporan_stok') == 'on' ? '1' : '0',
                  'show_customer' =>$this->input->post('show_customer') == 'on' ? '1' : '0',
                  'show_ukuran' =>$this->input->post('show_ukuran') == 'on' ? '1' : '0',
                  'show_opsi_all' =>$this->input->post('show_opsi_all') == 'on' ? '1' : '0',
                  'show_alert_delete' =>$this->input->post('show_alert_delete') == 'on' ? '1' : '0',
                  'jenis_faktur' =>$this->input->post('jenis_faktur'),
                  );

                $myid = $this->input->post('id_config');
                $where = array(
                    'id' => $myid
                    );

                $this->Mconfig->update_data($where,$data,'config');
                
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
                redirect($_SERVER['HTTP_REFERER']); //jika berhasil maka akan ditampilkan view upload
            }else{
                $this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-danger\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> ".$this->upload->display_errors('', '')."</div></div>");
                redirect($_SERVER['HTTP_REFERER']);
            }
        }else{
        	$data = array(
        		'perusahaan' =>$this->input->post('perusahaan'),
        		'telp' =>$this->input->post('telp'),
        		'alamat' =>$this->input->post('alamat'),
        		'link_app' =>$this->input->post('link_app'),
        		'show_supplier' =>$this->input->post('show_supplier') == 'on' ? '1' : '0',
        		'show_stok_masuk' =>$this->input->post('show_stok_masuk') == 'on' ? '1' : '0',
        		'show_stok_keluar' =>$this->input->post('show_stok_keluar') == 'on' ? '1' : '0',
        		'show_laporan_stok' =>$this->input->post('show_laporan_stok') == 'on' ? '1' : '0',
        		'show_customer' =>$this->input->post('show_customer') == 'on' ? '1' : '0',
        		'show_ukuran' =>$this->input->post('show_ukuran') == 'on' ? '1' : '0',
                'show_opsi_all' =>$this->input->post('show_opsi_all') == 'on' ? '1' : '0',
                'show_alert_delete' =>$this->input->post('show_alert_delete') == 'on' ? '1' : '0',
        		'jenis_faktur' =>$this->input->post('jenis_faktur'),
        		);

        	$myid = $this->input->post('id_config');
        	$where = array(
        		'id' => $myid
        		);

        	$this->Mconfig->update_data($where,$data,'config');
        	$this->session->set_flashdata("pesan", "<div class=\"alert alert-fill-success\" id=\"alert\"><i class=\"mdi mdi-alert-circle\"></i> Data berhasil di update</div>");
                redirect($_SERVER['HTTP_REFERER']);
            }
        }
}
?>