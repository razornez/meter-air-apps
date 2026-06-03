<!DOCTYPE html>
<html lang="en">
<!-- Mirrored from www.urbanui.com/radiant/jquery/pages/layout/horizontal-menu-2.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 16 May 2018 01:19:36 GMT -->
<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title><?php echo $this->Mconfig->get_config()->row()->perusahaan ?> | Aplikasi Kasir</title>
  <!--Import Google Icon Font-->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link rel="stylesheet" href="<?php echo base_url(); ?>materialize/css/materialize.min.css" media="screen,projection">
  <link rel="stylesheet" href="<?php echo base_url(); ?>css/introjs.css">
  <script src="<?php echo base_url(); ?>js/intro.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <link href="<?php echo base_url(); ?>css/webcodecam.css" rel="stylesheet">
  <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
  <link rel="shortcut icon" href="<?php echo base_url(); ?>img/<?php echo $this->Mconfig->get_config()->row()->logo ?>" />
  <style type="text/css">
  .jsgrid input, .jsgrid select, .jsgrid textarea {
    font-size: 12px !important;
  }
  </style>
</head>

<body style="background: url('<?php echo base_url(); ?>img/bg_wallpaper.jpg');">
  <ul id="slide-out" class="sidenav">
    <li><div class="user-view">
      <div class="background">
        <img src="<?php echo base_url(); ?>img/user-bg.png" style="width:100%">
      </div>
      <a href="#user"><img class="circle" src="<?php echo base_url(); ?>img/<?php echo $this->session->userdata('foto'); ?>"></a>
      <a href="#name"><span class="white-text name"><?php echo $this->session->userdata('fullname') ?></span></a>
      <a href="#email"><span class="white-text email">Petugas</span></a>
    </div></li>
    <!-- <li><a href="#!"><i class="material-icons">cloud</i>First Link With Icon</a></li> -->
    <li><a class="waves-effect" href="<?php echo base_url(); ?>user/edit">Lihat Profil</a></li>
    <li><div class="divider"></div></li>
    <!-- <li><a class="subheader">Subheader</a></li> -->
    <li><a class="waves-effect" href="<?php echo base_url(); ?>login/logout">Logout</a></li>
  </ul>
  <?php echo $content ?>

<ul id="tabs-swipe-demo" class="tabs" style="bottom: 0px;position: fixed;border-top: 1px solid #cecece;z-index: 9999999999">
  <li class="tab col s3" id="tab_scan" onclick="window.open('<?php echo base_url(); ?>home','_self')"><a class="active blue-text text-darken-2"><i class="material-icons">settings_overscan</i></a></li>
  <li class="tab col s3" id="tab_history" onclick="window.open('<?php echo base_url(); ?>transaksi','_self')"><a class="blue-text text-darken-2"><i class="material-icons">format_list_numbered</i></a></li>
  <li class="tab col s3" id="tab_profile" onclick="window.open('<?php echo base_url(); ?>user/edit','_self')"><a class="blue-text text-darken-2"><i class="material-icons">account_circle</i></a></li>
</ul>

<!-- <script type="text/javascript" src="<?php echo base_url(); ?>js/filereader.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/qrcodelib.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/webcodecamjs.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/main.js"></script> -->
<script src="<?php echo base_url(); ?>materialize/js/materialize.min.js"></script>

<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    var elems = document.querySelectorAll('.sidenav');
    var elems_tabs = document.querySelectorAll('.tabs');
    var navbar_instances = M.Sidenav.init(elems);
    var tab_instances = M.Tabs.init(elems_tabs);
  });
</script>
</body>


<!-- Mirrored from www.urbanui.com/radiant/jquery/pages/layout/horizontal-menu-2.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 16 May 2018 01:19:36 GMT -->
</html>
