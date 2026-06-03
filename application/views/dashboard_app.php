<!DOCTYPE html>
<html lang="en">
<!-- Mirrored from www.urbanui.com/radiant/jquery/pages/layout/horizontal-menu-2.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 16 May 2018 01:19:36 GMT -->
<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title><?php echo $this->Mconfig->get_config()->row()->perusahaan ?> | Aplikasi Kasir</title>
  <!-- plugins:css -->
  <link rel="stylesheet" href="<?php echo base_url(); ?>vendors/iconfonts/mdi/css/materialdesignicons.min.css">
  <link rel="stylesheet" href="<?php echo base_url(); ?>vendors/iconfonts/puse-icons-feather/feather.css">
  <link rel="stylesheet" href="<?php echo base_url(); ?>vendors/css/vendor.bundle.base.css">
  <link rel="stylesheet" href="<?php echo base_url(); ?>vendors/css/vendor.bundle.addons.css">

  <link rel="stylesheet" href="<?php echo base_url(); ?>vendors/iconfonts/font-awesome/css/font-awesome.min.css">
  <link rel="stylesheet" href="<?php echo base_url(); ?>vendors/icheck/skins/all.css">

  <link rel="stylesheet" href="<?php echo base_url(); ?>css/style.css">
  <link rel="stylesheet" href="<?php echo base_url(); ?>css/css_plus.css">
  <script src="<?php echo base_url(); ?>vendors/js/vendor.bundle.base.js"></script>
  <script src="<?php echo base_url(); ?>vendors/js/vendor.bundle.addons.js"></script>
  <link rel="shortcut icon" href="<?php echo base_url(); ?>img/<?php echo $this->Mconfig->get_config()->row()->logo ?>" />
  <style type="text/css">
    .jsgrid input, .jsgrid select, .jsgrid textarea {
      font-size: 12px !important;
    }
  </style>
</head>

<body class="horizontal-menu-2">
  <div class="container-scroller">
    <nav class="navbar horizontal-layout-2 col-lg-12 col-12 p-0 d-flex flex-row align-items-start">
      <div class="container">
        <div class="text-center navbar-brand-wrapper d-flex align-items-top justify-content-center">
        </div>
        <div class="navbar-menu-wrapper d-flex align-items-center pr-0">
          <ul class="navbar-nav ml-auto dropdown-menus">
            <li class="nav-item dropdown">
              <?php echo $this->Mconfig->get_config()->row()->perusahaan ?>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#" data-toggle="dropdown">
                <i class="mdi mdi-bell-outline"></i>
                <span class="count bg-success">3</span>
              </a>
              <div class="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
                <a class="dropdown-item py-3">
                  <p class="mb-0 font-weight-medium float-left">3 Produk stok paling sedikit
                  </p>
                  <span class="badge badge-pill badge-inverse-info float-right">View all</span>
                </a>
                <div class="dropdown-divider"></div>
                <?php foreach ($this->MstokMasuk->getAll_lowstok() as $data_stok) { ?>
                <a class="dropdown-item preview-item">
                  <div class="preview-thumbnail">
                    <div class="preview-icon bg-inverse-success">
                      <i class="mdi mdi-alert-circle-outline mx-0"></i>
                    </div>
                  </div>
                  <div class="preview-item-content">
                    <h6 class="preview-subject font-weight-normal text-dark mb-1"><?php echo $data_stok->produk ?></h6>
                    <p class="font-weight-light small-text mb-0">
                      Sisa <?php echo $data_stok->stok.' '.$data_stok->satuan ?>
                    </p>
                  </div>
                </a>
                <div class="dropdown-divider"></div>
                <?php } ?>
              </div>
            </li>
          </ul>
          <button type="button" class="navbar-toggler d-block d-md-none" style="display:none !important;"><i class="mdi mdi-menu"></i></button>
        </div>
      </div>
    </nav>
    <div class="container-fluid page-body-wrapper">
      <div class="main-panel">
      <div class="content-wrapper" style="padding: 5px;">
        <div class="container mt-4" style="margin-top: 0px !important;">
          <div class="main-panel">
            <div class="row">
              <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 grid-margin stretch-card">
                <div class="card card-statistics">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="highlight-icon bg-light mr-3">
                        <i class="mdi mdi-cube text-success icon-lg"></i>
                      </div>
                      <div class="wrapper">
                        <p class="card-text mb-0">total Pendapatan</p>
                        <div class="fluid-container">
                          <h4 class="card-title mb-0">Rp. <?php echo $pendapatan ?>
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 grid-margin stretch-card">
                <div class="card card-statistics">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="highlight-icon bg-light mr-3">
                        <i class="mdi mdi-briefcase-check text-primary icon-lg"></i>
                      </div>
                      <div class="wrapper">
                        <p class="card-text mb-0">Total Penjualan</p>
                        <div class="fluid-container">
                          <h3 class="card-title mb-0"><?php echo $penjualan ?></h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 grid-margin stretch-card">
                <div class="card card-statistics">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="highlight-icon bg-light mr-3">
                        <i class="mdi mdi-account-multiple text-danger icon-lg"></i>
                      </div>
                      <div class="wrapper">
                        <p class="card-text mb-0">Total Laba</p>
                        <div class="fluid-container">
                          <h4 class="card-title mb-0">Rp. <?php echo $semua_laba ?></h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-3 col-lg-3 col-md-3 col-sm-6 grid-margin stretch-card">
                <div class="card card-statistics">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="highlight-icon bg-light mr-3">
                        <i class="mdi mdi-airballoon text-info icon-lg"></i>
                      </div>
                      <div class="wrapper">
                        <p class="card-text mb-0">Total Produk</p>
                        <div class="fluid-container">
                          <h3 class="card-title mb-0"><?php echo $produk ?></h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4 col-sm-6 grid-margin stretch-card">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Penjualan terakhir</h5>
                    <?php foreach ($penjualan_terakhir->result() as $penjualan) { 
                      if ($penjualan->foto != '-'){
                        $foto_prod = 'img/produk/'.$penjualan->foto;
                      }else{
                        $foto_prod = 'img/No-image-found.jpg';
                      }
                      ?>
                    <div class="d-flex align-items-start pt-1">
                      <img src="<?php echo base_url().$foto_prod ?>" alt="brand logo" style="width:45px;">
                      <div class="wrapper w-100 pl-3">
                        <div class="d-flex align-items-center justify-content-between">
                          <span class="badge badge-info badge-lg mb-2">Rp. <?php echo number_format($penjualan->total) ?></span>
                          <span class="text-gray text-small"><?php echo $penjualan->tanggal ?></span>
                        </div>
                        <p><?php echo $penjualan->produk ?></p>
                      </div>
                    </div>
                    <?php } ?>
                  </div>
                </div>
              </div>
              <div class="col-md-4 col-sm-6 grid-margin stretch-card">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Penjualan Hari ini vs kemarin</h5>
                    <div class="row border-bottom pb-3 mb-3">
                      <div class="mb-4" id="hari_ini"></div>
                      <div class="mb-4" id="hari_kemarin"></div>

                      <script type="text/javascript">
                        var g1, g2, gg1, g7, g8, g9, g10;

                        window.onload = function() {
                          var g1 = new JustGage({
                            id: "hari_ini",
                            value: <?php echo $penjualan_hari_ini->hari_ini ?>,
                            min: 0,
                            max: 500,
                            title: "Hari ini",
                            label: "terjual"
                          });

                          var g2 = new JustGage({
                            id: "hari_kemarin",
                            value: <?php echo $penjualan_kemarin->hari_kemarin ?>,
                            min: 0,
                            max: 500,
                            title: "Kemarin",
                            label: "terjual"
                          });


                          setInterval(function() {
                            g1.refresh(<?php echo $penjualan_hari_ini->hari_ini ?>);
                          }, 2500);
                        };

                      </script>
                      <div class="col-12 mt-3">
                        <div class="d-flex align-items-end">
                          <h1 class="display-4 font-weight-semibold mb-0">Rp. <?php echo number_format($laba_hari_ini) ?></h1>
                          <h5 class="ml-3 mb-2">Laba hari ini</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 grid-margin stretch-card">
                <div class="card">
                  <div class="card-body">
                    <h5 class="card-title">Produk Terlaris</h5>
                    <div class="w-75 mx-auto">
                    </div>
                    <div id="c3-pie-chart"></div>
                    <script type="text/javascript">
                      var c3PieChart = c3.generate({
                        bindto: '#c3-pie-chart',
                        data: 

                        {
                          columns: 
                          <?php 
                          $prefix = '';
                          echo "[\n";
                          foreach ( $produk_terlaris->result() as $row ) {
                            echo $prefix . " [\n";
                            echo '"'.$row->nama.'",'.$row->total_jual;
                            echo " ]";
                            $prefix = ",\n";
                          }
                          echo "\n],";
                          ?>
                          type: 'pie',
                          onclick: function(d, i) {
                            console.log("onclick", d, i);
                          },
                          onmouseover: function(d, i) {
                            console.log("onmouseover", d, i);
                          },
                          onmouseout: function(d, i) {
                            console.log("onmouseout", d, i);
                          }
                        },
                        color: {
                          pattern: ['#1976D2', '#512DA8', '#0097A7', '#388E3C', '#E65100', '#D84315']
                        },
                        padding: {
                          top: 0,
                          right: 0,
                          bottom: 30,
                          left: 0,
                        }
                      });
                </script>
              </div>
            </div>
          </div>
        </div>
    <div class="row">
      <div class="col-12 grid-margin">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Penjualan Bulan ini</h5>
            <div id="morris-line-examples"></div>
            <script type="text/javascript">
              $(function() {
                'use strict';
                if ($('#morris-line-examples').length) {
                  Morris.Line({
                    element: 'morris-line-examples',
                    lineColors: ['#1976D2', '#303F9F', '#512DA8', '#0288D1', '#0097A7', '#00796B', '#388E3C', '#76FF03', '#E65100', '#D84315'],

                    data: 
                    <?php 
                    $prefix = '';
                    echo "[\n";
                    foreach ( $bulan_ini->result() as $row ) {
                      echo $prefix . " {\n";
                      echo 'b: '."'".$row->tanggal."'".',';
                      echo 'a:'.$row->total;
                      echo " }";
                      $prefix = ",\n";
                    }
                    echo "\n],";
                    ?>
                    xkey: 'b',
                    ykeys: ['a'],
                    labels: ['Rp. ']
                  });
                }
              });
            </script>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
    <footer class="footer">
      <div class="container-fluid clearfix">
        <span class="text-muted d-block text-center text-sm-left d-sm-inline-block">Copyright © 2018 <a href="https://www.facebook.com/razornez" target="_blank">Razornez</a>. All rights reserved.</span>
        <span class="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">Hand-crafted & made with <i class="mdi mdi-heart text-danger"></i></span>
      </div>
    </footer>
    </div>
    </div>
    </div>

    <script src="<?php echo base_url(); ?>js/off-canvas.js"></script>
    <script src="<?php echo base_url(); ?>js/hoverable-collapse.js"></script>
    <script src="<?php echo base_url(); ?>js/misc.js"></script>
    <script src="<?php echo base_url(); ?>js/settings.js"></script>
    <script src="<?php echo base_url(); ?>js/todolist.js"></script>
    <script src="<?php echo base_url(); ?>js/toastDemo.js"></script>
    <script src="<?php echo base_url(); ?>js/base.js"></script>

    <script src="<?php echo base_url(); ?>js/file-upload.js"></script>
    <script src="<?php echo base_url(); ?>js/iCheck.js"></script>
    <script src="<?php echo base_url(); ?>js/typeahead.js"></script>
    <script src="<?php echo base_url(); ?>js/select2.js"></script>
    <script src="<?php echo base_url(); ?>js/data-table.js"></script>
    <script src="<?php echo base_url(); ?>js/modal-demo.js"></script>
    <script src="<?php echo base_url(); ?>js/jquery-file-upload.js"></script>
    <script src="<?php echo base_url(); ?>js/dropify.js"></script>
    <script src="<?php echo base_url(); ?>js/dashboard.js"></script>
    <script src="<?php echo base_url(); ?>js/horizontal-menu.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script> -->
  </body>
</html>
