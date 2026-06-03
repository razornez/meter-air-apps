<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Laporan extends CI_Controller {
	
	function  __construct(){
		parent::__construct();
		$this->load->library('session');
		$this->load->database(); // load database
		$this->load->library('pagination');
		$this->load->model('Msupplier');
		$this->load->model('Mcustomer');
		$this->load->model('Mproduk');
		$this->load->model('Mlaporan');
        $this->load->model('MstokMasuk');      
		$this->load->model('Mconfig');		
		$this->load->helper('url');
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
	
	public function index()
	{
		$this->template('laporan/vlaporan');
	}

	public function penjualan()
	{
		$data['datasupplier'] = $this->Msupplier->getAll_laporan();
		$data['datacustomer'] = $this->Mcustomer->getAll_laporan();
		$data['dataproduk'] = $this->Mproduk->getAll_laporan();
		$data['datalaporan'] = $this->Mlaporan->get_data();
		$data['total_all'] = $this->Mlaporan->get_data_total();
		$data['laba_all'] = $this->Mlaporan->get_data_laba();
		$page=$this->input->get('per_page');
		$data['jlhpage']=$page;
		$this->template('laporan/vpenjualan', $data);
	}

	public function filter()
	{
		$data['datasupplier'] = $this->Msupplier->getAll_laporan();
		$data['datacustomer'] = $this->Mcustomer->getAll_laporan();
		$data['dataproduk'] = $this->Mproduk->getAll_laporan();
		$data['datalaporan'] = $this->Mlaporan->get_data_filter();
		$data['total_all'] = $this->Mlaporan->get_data_total_filter();
		$data['laba_all'] = $this->Mlaporan->get_data_laba_filter();
		//print_r($data['total_all']);die();
		$page=$this->input->get('per_page');
		$data['jlhpage']=$page;
		$this->template('laporan/vpenjualan', $data);
	}

	public function laporan_pdf()
	{
		$data['datalaporan'] = $this->Mlaporan->get_data_filter_pop();
		$data['total_all'] = $this->Mlaporan->get_data_total_filter_pop();
		$data['laba_all'] = $this->Mlaporan->get_data_laba_filter_pop();
		$this->load->view('laporan/vpenjualan_excel', $data);
		// redirect($_SERVER['HTTP_REFERER']);
	}

}
