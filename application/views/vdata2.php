<?php
$result = $this->db->query("SELECT jenis_kelamin, sum(jenis_kelamin='L') as male, sum(jenis_kelamin='P') as female FROM alternatif")->result();
if ( !$result ) {
  $message  = 'Invalid query: ' . mysql_error() . "n";
  $message .= 'Whole query: ';
  die( $message );
}

$prefix = '';
echo "[\n";
foreach ( $result as $row ) {
  echo $prefix . " {\n";
  echo '  "title": "Laki-laki",' . "\n";
  echo '  "value": "' . $row->male . '"' . "\n";
  echo " }";
  $prefix = ",\n";
  echo $prefix . " {\n";
  echo '  "title": "Perempuan",' . "\n";
  echo '  "value": "' . $row->female . '"' . "\n";
  echo " }";
  $prefix = ",\n";
}
echo "\n]";

?>