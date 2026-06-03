
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>Struk Pembayaran</title>
	
	
	<!-- Favicon -->
	<link rel="icon" href="/images/favicon.png" type="image/x-icon">
	
	
	<!-- Invoice styling -->
	<style>
	@page { margin: 0; }
	body{
		font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
		text-align:center;
		color:#777;
	}
	
	body h1{
		font-weight:300;
		margin-bottom:0px;
		padding-bottom:0px;
		color:#000;
	}
	
	body h3{
		font-weight:300;
		margin-top:10px;
		margin-bottom:20px;
		font-style:italic;
		color:#555;
	}
	
	body a{
		color:#06F;
	}
	
	.invoice-box{
		max-width:800px;
		margin:auto;
		padding:10px;
		border:1px solid #eee;
		box-shadow:0 0 10px rgba(0, 0, 0, .15);
		font-size:10px;
		line-height:24px;
		font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
		color:#555;
	}
	
	.invoice-box table{
		width:100%;
		line-height:inherit;
		text-align:left;
	}
	
	.invoice-box table td{
		padding:5px;
		vertical-align:top;
	}
	
	.invoice-box table tr td:nth-child(3){
		text-align:right;
	}
	
	.invoice-box table tr.top table td{
		padding-bottom:0px;
	}
	
	.invoice-box table tr.top table td.title{
		font-size:45px;
		line-height:15px;
		color:#333;
	}
	
	.invoice-box table tr.information table td{
		padding-bottom:40px;
	}
	
	.invoice-box table tr.heading td{
		background:#eee;
		border-bottom:1px solid #ddd;
		font-weight:bold;
	}
	
	.invoice-box table tr.details td{
		padding-bottom:20px;
	}
	
	.invoice-box table tr.item td{
		border-bottom:1px solid #eee;
	}
	
	.invoice-box table tr.item.last td{
		border-bottom:none;
	}
	
	.invoice-box table tr.total td:nth-child(2){
		border-top:2px solid #eee;
		font-weight:bold;
	}
	
	@media only screen and (max-width: 600px) {
		.invoice-box table tr.top table td{
			width:100%;
			display:block;
			text-align:center;
		}
		
		.invoice-box table tr.information table td{
			width:100%;
			display:block;
			text-align:center;
		}
	}
	</style>
</head>

<body>
	<!-- <h1>A simple, clean, and responsive HTML invoice template</h1>
	<h3>Because sometimes, all you need is something simple.</h3>
	Find the code on <a href="https://github.com/sparksuite/simple-html-invoice-template">GitHub</a>. Licensed under the <a href="http://opensource.org/licenses/MIT" target="_blank">MIT license</a>.<br><br><br> -->
	
	<div class="invoice-box">
		<table cellpadding="0" cellspacing="0">
			<tr class="top">
				<td colspan="2">
					<table>
						<tr>
							<td style="width: 100px;padding-bottom: 0px;text-align: center;line-height: 12px;">
								<img src="<?php echo base_url().'img/'.$this->Mconfig->get_config()->row()->logo ?>" style="width:75px; max-width:300px;">
							</td>
							<td style="text-align: left;width: 400px;">
								<b><?php echo $this->Mconfig->get_config()->row()->perusahaan ?></b><br>
								<?php echo $this->Mconfig->get_config()->row()->alamat ?>
							</td>
							<td style="width: 10px;"></td>
							<td>
								<b style="font-size: 25px;text-decoration: underline;">FAKTUR</b><br>
								Nama Sopir : Mobil Sendiri<br>
							</td>
						</tr>
					</table>
					<table>
						<tr>
							<td style="width: 100px;">
								Kepada :
							</td>
							<td style="text-align: left;width: 300px;border: 1px solid gray;border-radius: 5px;line-height: 12px;">
								<b><?php echo $faktur->row()->customer ?></b><br>
								<?php echo $faktur->row()->alamat ?><br>
								<?php echo $faktur->row()->kota ?>
							</td>
							<td style="width: 10px;"></td>
							<td style="line-height: 12px;">	
								<b style="font-weight: 100;">No. Faktur</b><br>
								<b><?php echo $faktur->row()->no_faktur ?></b><br>
								<b style="font-weight: 100;">Jatuh Tempo</b><br>
								<b>COD Hari</b>
							</td>
							<td style="line-height: 12px;">	
								<b style="font-weight: 100;">Tgl. Faktur</b><br>
								<b><?php echo date('d M Y') ?></b><br>
								<b style="font-weight: 100;">Tgl. Jatuh Tempo</b><br>
								<b><?php $jatuhtempo = date_create($faktur->row()->jatuh_tempo); echo date_format($jatuhtempo, 'd M Y') != '' ? '-' : date_format($jatuhtempo, 'd M Y') ?></b><br>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			
		</table>
		<table cellpadding="0" cellspacing="0" style="border-bottom: 1px solid gray;">
			<tr style="line-height: 15px;font-weight: 700;">
				<td style="width: 150px;border-top: 1px solid gray;border-left: 1px solid gray;border-right: 1px solid gray;border-bottom: 1px solid gray;">
					Kode Barang
				</td>
				<td style="width: 200px;border-top: 1px solid gray;border-bottom: 1px solid gray;">
					Nama Barang
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-bottom: 1px solid gray;">
					Qty
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-bottom: 1px solid gray;">
					Sat
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-bottom: 1px solid gray;">
					Harga Satuan
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-bottom: 1px solid gray;">
					Diskon
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-right: 1px solid gray;border-bottom: 1px solid gray;">
					Jumlah
				</td>
			</tr>
			<?php 
			if( ! empty($faktur)){    
	    	$no = 1;    
		    foreach($faktur->result() as $data) {
		    if($data->quantity == ''){$data->quantity = 0;}
		    if($data->diskon == ''){$data->diskon = 0;}
		    ?>
			<tr style="line-height: 10px;">
				<td style="width: 150px;border-left: 1px solid gray;border-right: 1px solid gray;">
					<?php echo $data->barcode ?>
				</td>
				<td style="width: 200px;">
					<?php echo $data->produk ?>
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					<?php echo $data->quantity ?>
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					<?php echo $data->satuan ?>
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					<?php echo number_format($data->harga_jual) ?>
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					<?php echo number_format($data->diskon) ?>
				</td>
				<td style="text-align: right;border-left: 1px solid gray;border-right: 1px solid gray;">
					<?php echo number_format($data->total) ?>
				</td>
			</tr>
			<?php }} ?>

		</table>

		<table cellpadding="0" cellspacing="0" style="padding-top: 5px;">
			<tr  style="line-height: 15px;">
				<td style="width: 150px;">
					Terbilang
				</td>
				<td style="width: 350px;border: 1px solid gray;border-radius: 5px;">
					<?php echo $terbilang; ?>
				</td>
				<td style="width: 3px;"></td>
				<td style="text-align:left;">
					Sub total :<br>
					Discount <?php if ($data->diskon_tipe == 'rp'){echo 'Rp. ';}else{ echo '('.($data->diskon_all / $data->subtotal * 100).' '.$data->diskon_tipe.')';} ?> :<br>
					PPN :<br>
					Biaya Kirim :<br>
					Total Faktur :
				</td>
				<td style="text-align:right;">
					<b><?php echo number_format($data->subtotal) ?></b><br>
					<b><?php echo number_format($data->diskon_all) ?></b><br>
					<b><?php echo number_format($data->ppn).' %' ?></b><br>
					<b><?php echo number_format($data->biaya_kirim) ?></b><br>
					<b><?php echo number_format($data->total_all) ?></b><br>
				</td>
			</tr>
		</table>
		<table cellpadding="0" cellspacing="0">
			<tr>
				<td style="width: 150px;">
				</td>
				<td style="width: 250px;padding-bottom: 25px;text-align: center;">
					Diterima Oleh
				</td>
				<td style="width: 250px;text-align: center;">
					Hormat Kami
				</td>
				<td style="width: 250px;">
					Keterangan :<br>
				</td>
			</tr>
			<tr>
				<td style="width: 150px;">
				</td>
				<td style="width: 250px;text-decoration-line: overline;text-align: center;">
					Nama Jelas & Cap Toko
				</td>
				<td style="width: 250px;text-align: center;">
					__________________
				</td>
				<td style="width: 250px;">
				</td>
			</tr>
		</table>
	</div>
	</body>
</html>
