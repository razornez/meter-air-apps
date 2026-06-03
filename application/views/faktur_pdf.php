
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>A simple, clean, and responsive HTML invoice template</title>
	
	
	<!-- Favicon -->
	<link rel="icon" href="/images/favicon.png" type="image/x-icon">
	
	
	<!-- Invoice styling -->
	<style>
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
							<td style="width: 100px;padding-bottom: 0px;text-align: center;line-height: 52px;">
								<img src="http://desainlogo.com/files/2016/05/logowahanapersada.png" style="width:75px; max-width:300px;">
							</td>
							<td style="text-align: left;width: 300px;line-height: 15px;">
								<b>PT. Agung Jaya</b><br>
								Kp. Buniayu Kertamukti Haurwangi<br>
								Cianjur
							</td>
							<td style="width: 10px;"></td>
							<td style="line-height: 15px;">	
								<b style="font-weight: 100;">No. Faktur</b><br>
								<b>FA/AJ/18/05/001</b><br>
								<b style="font-weight: 100;">Jatuh Tempo</b><br>
								<b>COD Hari</b>
							</td>
							<td style="line-height: 15px;">	
								<b style="font-weight: 100;">Tgl. Faktur</b><br>
								<b>25 Apr 2018</b><br>
								<b style="font-weight: 100;">Tgl. Jatuh Tempo</b><br>
								<b>25 Apr 2018</b><br>
							</td>
						</tr>
					</table>
				</td>
			</tr>
			
		</table>
		<table cellpadding="0" cellspacing="0" style="border-bottom: 1px solid gray;">
			<tr style="line-height: 15px;font-weight: 700;">
				<td style="width: 70px;border-top: 1px solid gray;border-left: 1px solid gray;border-right: 1px solid gray;">
					Kode Barang
				</td>
				<td style="width: 180px;border-top: 1px solid gray;">
					Nama Barang
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;">
					Qty
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;width: 40px;">
					Sat
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;width: 80px;">
					Harga Satuan
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;width: 80px;">
					Diskon
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-right: 1px solid gray;width: 80px;">
					Jumlah
				</td>
			</tr>

			<tr style="line-height: 10px;">
				<td style="border-top: 1px solid gray;border-left: 1px solid gray;border-right: 1px solid gray;">
					Kode Barang
				</td>
				<td style="border-top: 1px solid gray;">
					Nama Barang
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;">
					Qty
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;">
					Sat
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;">
					Harga Satuan
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;">
					Diskon
				</td>
				<td style="text-align: right;border-top: 1px solid gray;border-left: 1px solid gray;border-right: 1px solid gray;">
					Jumlah
				</td>
			</tr>

			<tr style="line-height: 10px;">
				<td style="border-left: 1px solid gray;border-right: 1px solid gray;">
					Kode Barang
				</td>
				<td>
					Nama Barang
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					Qty
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					Sat
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					Harga Satuan
				</td>
				<td style="text-align: right;border-left: 1px solid gray;">
					Diskon
				</td>
				<td style="text-align: right;border-left: 1px solid gray;border-right: 1px solid gray;">
					Jumlah
				</td>
			</tr>

		</table>

		<table cellpadding="0" cellspacing="0" style="padding-top: 5px;">
			<tr  style="line-height: 15px;">
				<td style="width: 50px;">
					Terbilang
				</td>
				<td style="width: 400px;border: 1px solid gray;border-radius: 5px;">
					Dua Ratus Ribu Rupiah
				</td>
				<td style="width: 3px;"></td>
				<td style="text-align:left;">
					Sub total :<br>
					Discount :<br>
					PPN 10% :<br>
					Biaya Kirim :
				</td>
				<td style="text-align:right;">
					<b>100000</b><br>
					<b>0</b><br>
					<b>0</b><br>
					<b>100000</b><br>
				</td>
			</tr>
		</table>
		<table cellpadding="0" cellspacing="0">
			<tr>
				
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
