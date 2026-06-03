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
header("Content-Disposition: attachment; filename=Laporan Daftar Divisi.xls");
echo "<h4 style='margin: 0px !important; text-align:center;'>Laporan Daftar Divisi</h4><br>"; 
echo "<table border='1' cellpadding='0' cellspacing='0'>"; 
	    echo "<tr>";     
		    echo "<th style='width:40px;text-align:center;padding-top:5px;padding-bottom:5px;'>No</th>";     
		    echo "<th style='width:170px;text-align:center;padding-top:5px;padding-bottom:5px;'>Nama</th>";
	    echo "</tr>"; 
	    if( ! empty($lap_divisi)){    
	    	$no = 1;    
		    foreach($lap_divisi->result() as $data) {
		    echo "<tr>";       
		    echo "<td style='width:40px;text-align:right;padding:5px;font-size:10px;'>".$no++."</td>";
			echo "<td style='width:170px;text-align:left;padding:5px;font-size:10px;'>".$data->nama."</td>";   
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



