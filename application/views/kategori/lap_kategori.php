<!-- silakan desain dengan menggunakan CSS -->
<style type="text/css">
body{
	margin: 10px 100px 100px 100px;
}
@page {
    size: auto;   /* auto is the initial value */
    margin: 0mm;  /* this affects the margin in the printer settings */
}
</style>
<html>
<body>
	<br>
	<h4 style="margin: 0px !important; text-align:center;">DATA DIVISI</h4><hr><br><br>
	<table border="0.5" cellpadding="0" cellspacing="0">
		<tr>    
			<th style='width:20px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>No</th>    
			<th style='width:170px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>Nama</th>
		</tr>
		<?php 
		$no=1;
		foreach($lap_divisi->result() as $data) {
			echo "<tr>";       
			echo "<td style='width:20px;text-align:right;padding:5px;font-size:10px;'>".$no++."</td>";
			echo "<td style='width:170px;text-align:left;padding:5px;font-size:10px;'>".$data->nama."</td>";           
			echo "</tr>";        			
		}
		?>
	</table><br><br>
	    <!-- <page>
		  <page_footer>
		    [[page_cu]]/[[page_nb]]
		  </page_footer>
		</page> -->
		<!-- </center> -->
	</body>
	</html>



