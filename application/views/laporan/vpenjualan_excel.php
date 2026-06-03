<?php 
// date_default_timezone_set("Asia/Jakarta");
// var_dump((string)number_format(20000));die();

?>
<!-- silakan desain dengan menggunakan CSS -->
<style type="text/css">
body{
	margin: 10px 100px 100px 100px;
}
</style>
<html>
<body>
<!-- <center> -->
<?php
header("Content-type: application/vnd-ms-excel");
header("Content-Disposition: attachment; filename=Laporan Penjualan.xls");
$tgl_awal = date_create($this->input->post('pop_filter_tgl_awal'));
$tgl_akhir = date_create($this->input->post('pop_filter_tgl_akhir'));
$awal = date_format($tgl_awal, 'd M Y');
$akhir = date_format($tgl_akhir, 'd M Y');
?>
<h5 style='margin: 0px !important; text-align:center;'>Laporan Penjualan dari tanggal <?php echo $awal == '' ? '1 Mei 2018' : $awal ?><?php echo ' s/d ' ?><?php echo $akhir == '' ? ' Sekarang ' : $akhir ?><?php echo ' Produk ' ?><?php echo $this->input->post('pop_filter_produk') == 't.produk' ? ' semua ' : $this->input->post('pop_filter_produk') ?></h5><br>
<table border='1' cellpadding='0' cellspacing='0'>
	<tr class="jsgrid-header-row">
		<th style="width: 50px;">No</th>
		<th style="width: 100px;">Tanggal</th>
		<th style="width: 100px;">Faktur</th>
		<th style="width: 250px;">Produk</th>
		<th>Subtotal</th>
		<th>Diskon</th>
		<th>Ongkir</th>
		<th>Total</th>
	</tr>
    <?php
    if(empty($datalaporan)){ ?>
      <tr>
        <td>Data tidak ditemukan</td>
      </tr>
    <?php }else{
      $no=1;
    foreach ($datalaporan->result() as $data) { ?>
      <tbody>
        <tr>
          <td style='width:40px;text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo $no++ ?></td>
          <td style='width:40px;text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo $data->tgl_mod ?></td>
          <td style='width:40px;text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo $data->no_faktur ?></td>
          <td style='width:40px;text-align:center;padding-top:5px;padding-bottom:5px;'>
            <div>
              <table border='1' cellpadding='0' cellspacing='0'>
                <tbody>
                  <?php 
                  $data_produk = $this->db->query("SELECT * from transaksi t where faktur = '".$data->no_faktur."' ")->result();
                  foreach ($data_produk as $prod) { 
                    ?>
                    <tr>
                      <td style="width:30px;font-size: 0.65rem;border: none;padding: 5px;border-radius: 0px;margin-bottom: 2px;text-align: center" class="badge badge-inverse-primary badge-pill" >
                        <?php echo $prod->quantity ?>
                      </td>
                      <td style="font-size:12px;border: none;padding: 1px;"><?php echo $prod->produk ?></td>
                      <td style="font-size:12px;text-align:right;border: none;padding: 1px;"><?php echo number_format($prod->total) ?></td>
                    </tr>
                  <?php } ?>
                </tbody>
              </table>
            </div>
          </td>
          <td style='text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo (string)number_format($data->f_subtotal) ?></td>
          <td style='text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo number_format($data->f_diskon) ?></td>
          <td style='text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo number_format($data->f_biaya_kirim) ?></td>
          <td style='text-align:center;padding-top:5px;padding-bottom:5px;'><?php echo "Rp " . number_format($data->f_total,0,',','.'); ?></td>
        </tr>
      <?php }} ?>
      <tr>
        <td style='width: 70px;font-weight: 700;text-align:center;padding-top:5px;padding-bottom:5px;' colspan="5"> Total :</td>
        <td style='width: 70px;font-weight: 700;text-align:center;padding-top:5px;padding-bottom:5px;' colspan="3"><?php echo number_format($total_all) ?></td>
      </tr>
      <tr>
        <td style='width: 70px;font-weight: 700;text-align:center;padding-top:5px;padding-bottom:5px;' colspan="5"> Laba :</td>
        <td style='width: 70px;font-weight: 700;text-align:center;padding-top:5px;padding-bottom:5px;' colspan="3"><?php echo number_format($laba_all) ?></td>
      </tr>
    </tbody>
</table>
	    <!-- <page>
		  <page_footer>
		    [[page_cu]]/[[page_nb]]
		  </page_footer>
		</page> -->
<!-- </center> -->
</body>
</html>



