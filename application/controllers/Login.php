<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Login extends CI_Controller {
	
	function  __construct(){
		parent::__construct();
		$this->load->library('session');
		$this->load->database(); // load database
		$this->load->library('pagination');
		$this->load->helper('url');
        $this->load->model('Mlogin');
        $this->load->model('Mconfig');      
		$this->load->model('MstokMasuk');		
	}
	
	function index() {
        if (($this->session->userdata('is_active') == 'on')) {
            
            redirect('home');
        } else {
            // print_r("adf");die();
            $this->data['message'] = "";
            $this->load->view('vlogin', $this->data);
        }
    }

    function login_app() {
        if (($this->session->userdata('is_active') == 'on')) {
            
            redirect('home/dashboard_app');
        } else {
            // print_r("adf");die();
            $this->data['message'] = "";
            $this->load->view('vlogin_app', $this->data);
        }
    }

    function custom_number_format($n, $precision = 1) {
        if ($n < 1000000) {
        // Anything less than a million
            $n_format = number_format($n / 1000, $precision) . ' Ribu';
        } else if ($n < 1000000000) {
        // Anything less than a billion
            $n_format = number_format($n / 1000000, $precision) . ' Juta';
        } else {
        // At least a billion
            $n_format = number_format($n / 1000000000, $precision) . ' Milliar';
        }

        return $n_format;
    }
	
	function cekLogin()
	{
		$username = $this->input->post('username');
        $password = $this->input->post('password');
        $result = $this->Mlogin->check_login($username, $password);
         foreach ($result as $key) {
         	$fullname=$key->fullname;
         	$foto=$key->foto;
            $id_user=$key->id_user;
            $last_login=$key->last_login;
            $is_admin=$key->is_admin;
         }
        if ($result != NULL) {
            //$user = $this->Mlogin->by_id(array('username'=>$username));
            $newdata = array(
                'username' => $username,
				'fullname' => $fullname,
				'foto' => $foto,
                'id_user' => $id_user,
                'last_login' => $last_login,
                'is_active' => '1',
                'is_admin' => $is_admin,
            );
            //print_r($newdata);
            //die();
            $this->session->set_userdata($newdata);
            ///////log aktivitas/////////
            $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Berhasil Login', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
            ///////log aktivitas////////
            $this->db->query("UPDATE users set last_login = now() where id_user = '".$this->session->userdata('id_user')."' ");
            redirect('home'); 
        } else {
            $this->session->set_flashdata("pesan", "<div class='alert alert-danger' id='alert'><i class='glyphicon glyphicon-remove'></i> Login Unsuccessfull, Please try Again!</div>");
            $this->load->view('vlogin');
        }
    }

    function cekLogin_app()
    {
        $username = $this->input->post('username');
        $password = $this->input->post('password');
        $result = $this->Mlogin->check_login($username, $password);
         foreach ($result as $key) {
            $fullname=$key->fullname;
            $foto=$key->foto;
            $id_user=$key->id_user;
            $last_login=$key->last_login;
            $is_admin=$key->is_admin;
         }
        if ($result != NULL) {
            //$user = $this->Mlogin->by_id(array('username'=>$username));
            $newdata = array(
                'username' => $username,
                'fullname' => $fullname,
                'foto' => $foto,
                'id_user' => $id_user,
                'last_login' => $last_login,
                'is_active' => '1',
                'is_admin' => $is_admin,
            );
            //print_r($newdata);
            //die();
            $this->session->set_userdata($newdata);
            ///////log aktivitas/////////
            $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Berhasil Login', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
            ///////log aktivitas////////
            $this->db->query("UPDATE users set last_login = now() where id_user = '".$this->session->userdata('id_user')."' ");
            redirect('home/dashboard_app'); 
        } else {
            $this->session->set_flashdata("pesan", "<div class='alert alert-danger' id='alert'><i class='glyphicon glyphicon-remove'></i> Login Unsuccessfull, Please try Again!</div>");
            $this->load->view('vlogin_app');
        }
    }


	function logout()
	{
		///////log aktivitas/////////
        $this->db->query("INSERT INTO log_aktivitas (id_user, aktivitas, waktu, jenis) values ('".$this->session->userdata('id_user')."', 'Berhasil Logout', '".date('Y-m-d H:i:s')."', 'aktivitas') ");
        ///////log aktivitas//////// 
        $newdata = array(
            'username' => '',
        );
        $this->session->unset_userdata($newdata);
        $this->session->sess_destroy();
        redirect(base_url('login'));
	}

	function logged_in() {
        if (!($this->session->userdata('is_active'))) {
            redirect(base_url() . "home");
        }
    }
}
