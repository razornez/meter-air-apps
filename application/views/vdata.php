<?php
            $result = $this->db->query("SELECT *, MONTHNAME(tanggal) as tanggal FROM saw_sesion where jumlah_alternatif IS NOT NULL and YEAR(tanggal) = '".date('Y')."' order by tanggal desc limit 5")->result();
            // Print out rows
            foreach ( $result as $row ) {
              //echo $row->nama . ' | ' . $row->tanggal . ' | ' .$row->jumlah_alternatif . "n";
            }
            $prefix = '';
            echo "[\n";
            foreach ( $result as $row ) {
              echo $prefix . " {\n";
              echo '  "tanggal": "' . $row->tanggal . '",' . "\n";
              echo '  "nama": "' . $row->nama . '",' . "\n";
              echo '  "jumlah": ' . $row->jumlah_alternatif . ',' . "\n";
              echo '  "color": "' . $row->color . '"' . "\n";
              echo " }";
              $prefix = ",\n";
            }
            echo "\n]";

            ?>