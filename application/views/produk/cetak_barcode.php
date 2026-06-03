
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title> </title>
	
	
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
	
	.invoice-box{
		max-width:150px;
		margin:auto;
		padding:1px;
		border:1px solid #fff;
		/*box-shadow:0 0 10px rgba(0, 0, 0, .15);*/
		font-size:10px;
		line-height:24px;
		font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
		color:#555;
	}
	</style>
</head>

<body>
	<div class="invoice-box">
		<?php $prod = $this->db->query("SELECT barcode, barcode_img, nama FROM produk where barcode = '".$_GET['barcode']."' LIMIT 1 ") ?>
		<small><?php echo $prod->row()->nama ?></small>
		<img style="width:220px;height:100px;border-radius: 0px;" src="<?php echo base_url().$prod->row()->barcode_img ?> ">
		<!-- <img src="<?php echo base_url()?>barcodegen/html/image.php?filetype=PNG&dpi=72&scale=1&rotation=0&font_family=Arial.ttf&font_size=8&text=<?php echo $_GET['barcode'] ?>&thickness=30&checksum=&code=BCGcode128"> -->
	</div>
	</body>
</html>
