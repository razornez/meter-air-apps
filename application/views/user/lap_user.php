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
	<h4 style="margin: 0px !important; text-align:center;">DATA USER</h4><hr><br><br>
	<table border="0.5" cellpadding="0" cellspacing="0">
		<tr>    
			<th style='width:20px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>No</th>    
			<th style='width:140px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>Username</th>
			<th style='width:170px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>Fullname</th>
			<th style='width:85px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>Aktif</th>
			<th style='width:115px;text-align:center;padding-top:5px;padding-bottom:5px;font-size:medium;'>Last Login</th>
		</tr>
		<?php 
		$no=1;
		foreach($lap_user->result() as $data) {
			$data->is_active == 'on' ? $data->is_active = 'Aktif' : $data->is_active = 'Nonaktif';   		      
			echo "<tr>";       
			echo "<td style='width:20px;text-align:right;padding:5px;font-size:10px;'>".$no++."</td>";
			echo "<td style='width:140px;text-align:left;padding:5px;font-size:10px;'>".$data->username."</td>";           
			echo "<td style='width:170px;text-align:left;padding:5px;font-size:10px;'>".$data->fullname."</td>";     
			echo "<td style='width:85px;text-align:left;padding:5px;font-size:10px;'>".$data->is_active."</td>";     
			echo "<td style='width:115px;text-align:left;padding:5px;font-size:10px;'>".$data->last_login."</td>";     
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



