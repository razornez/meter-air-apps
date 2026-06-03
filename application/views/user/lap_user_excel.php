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
header("Content-Disposition: attachment; filename=Laporan Daftar User.xls");
echo "<h4 style='margin: 0px !important; text-align:center;'>Laporan Daftar User</h4><br>"; 
echo "<table border='1' cellpadding='0' cellspacing='0'>"; 
	    echo "<tr>";     
		    echo "<th style='width:40px;text-align:center;padding-top:5px;padding-bottom:5px;'>No</th>";     
		    echo "<th style='width:140px;text-align:center;padding-top:5px;padding-bottom:5px;'>Username</th>";     
		    echo "<th style='width:170px;text-align:center;padding-top:5px;padding-bottom:5px;'>Fullname</th>";     
		    echo "<th style='width:85px;text-align:center;padding-top:5px;padding-bottom:5px;'>Aktif</th>";
		    echo "<th style='width:115px;text-align:center;padding-top:5px;padding-bottom:5px;'>Last Login</th>";; 
	    echo "</tr>"; 
	    if( ! empty($lap_user)){    
	    	$no = 1;    
		    foreach($lap_user->result() as $data) {
		    $data->is_active == 'on' ? $data->is_active = 'Aktif' : $data->is_active = 'Nonaktif';
		    echo "<tr>";       
		    echo "<td style='width:40px;text-align:right;padding:5px;font-size:10px;'>".$no++."</td>";
			echo "<td style='width:140px;text-align:left;padding:5px;font-size:10px;'>".$data->username."</td>";
			echo "<td style='width:170px;text-align:left;padding:5px;font-size:10px;'>".$data->fullname."</td>";     
			echo "<td style='width:85px;text-align:left;padding:5px;font-size:10px;'>".$data->is_active."</td>";     
			echo "<td style='width:115px;text-align:left;padding:5px;font-size:10px;'>".$data->last_login."</td>";  
		    echo "</tr>";           
			}
		}
		?>
	    </table>
	    <!-- <page>
		  <page_footer>
		    [[page_cu]]/[[page_nb]]
		  </page_footer>
		</page> -->
<!-- </center> -->
</body>
</html>



