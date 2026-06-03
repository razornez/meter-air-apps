<?php
$my_id_sesion = $this->uri->segment(3);
$result = $this->db->query("SELECT (select count(id) from pekerjaan where tgl_done < tanggal_selesai and id_project = ".$my_id_sesion.") as cepat, (select count(id) from pekerjaan where tgl_done > tanggal_selesai and id_project = ".$my_id_sesion.") as over, (select count(id) from pekerjaan where tgl_done = tanggal_selesai and id_project = ".$my_id_sesion.") as tepat from pekerjaan where id_project = ".$my_id_sesion." limit 1")->result();
            // All good?
if ( !$result ) {
            // Nope
  $message  = 'Invalid query: ' . mysql_error() . "n";
  $message .= 'Whole query: ';
  die( $message );
}

            // Print out rows
foreach ( $result as $row ) {
              //echo $row->nama . ' | ' . $row->tanggal . ' | ' .$row->jumlah_alternatif . "n";
}
$prefix = '';
echo "[\n";
foreach ( $result as $row ) {
  echo $prefix . " {\n";
  echo '  "title": "Tepat Waktu",' . "\n";
  echo '  "value": "' . $row->tepat . '"' . "\n";
  echo " }";
  $prefix = ",\n";
  echo $prefix . " {\n";
  echo '  "title": "Mundur",' . "\n";
  echo '  "value": "' . $row->over . '"' . "\n";
  echo " }";
  $prefix = ",\n";
  echo $prefix . " {\n";
  echo '  "title": "Lebih Cepat",' . "\n";
  echo '  "value": "' . $row->cepat . '"' . "\n";
  echo " }";
  $prefix = ",\n";
}
echo "\n]";

?>