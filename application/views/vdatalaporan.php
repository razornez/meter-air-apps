<?php
$my_id_sesion = $this->uri->segment(3);

$result = $this->db->query("SELECT *,pi.id_pekerjaan as pic_kerja , pe.nama as pegawai, pe.foto_def as foto_def, pe.foto_new as foto_new FROM project pro join pekerjaan p on pro.id_project = p.id_project join pic pi on p.id = pi.id_pekerjaan join pegawai pe on pi.id_pic = pe.id_pegawai where pro.id_project ='".$my_id_sesion."' group by pe.nama")->result();
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
  if ($row->foto_def == '' or $row->foto_def == 'NULL'){
    $row->foto_def = "/no_foto.jpg";
  }else{
    $row->foto_new = '/'.$row->foto_def;
  }

  if ($row->foto_new == '' or $row->foto_new == 'NULL'){
    $row->foto_new = base_url().'/img/foto/'.$row->foto_def;
  }else{
    $row->foto_new = base_url().'/img/foto/'.$row->foto_new;
  }
  echo $prefix . " {\n";
  echo '  "name": "' . $row->pegawai . '",' . "\n";
  $result2 = $this->db->query("select * from pic join pekerjaan on pic.id_pekerjaan = pekerjaan.id where id_project =".$my_id_sesion." and id_pic =".$row->id_pic."  ")->num_rows(); 
  echo '  "points": "' . round($result2, 4,PHP_ROUND_HALF_UP) . '",' . "\n";
  echo '  "color": "#FE' . rand(1000,9999) . '",' . "\n";
  echo '  "bullet": "' . $row->foto_new . '"' . "\n";
  echo " }";
  $prefix = ",\n";
}
echo "\n]";

?>