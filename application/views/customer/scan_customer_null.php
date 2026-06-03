<script type="text/javascript" src="<?php echo base_url(); ?>webcam-take/webcam.min.js"></script>
<style>
#my_camera{
 width: 280px;
 height: 240px;
 border: unset;
 /*border: 1px solid #c1c1c1;*/
}
#imageprev{
  margin-top: 10px;
  width: 140px;
  height: 120px;
}
.row {
  margin-bottom: 0px;
}
.modal.modal-fixed-footer .modal-content {
  padding: 10px;
}
.modal.modal-fixed-footer {
  height: 45%;
}
</style>
<!-- <nav class="blue lighten-1">
  <div class="nav-wrapper">
    <a href="#" class="brand-logo" style="width: 90%;text-align: center;">ID : <?php echo $this->uri->segment(3) ?></a>
  </div>
</nav> -->
<div class="container" style="margin-bottom: 50px;">
  <div class="row">
      <div class="row">
        <div class="input-field col s12">
          <center><label for="meter_lama">Data tidak ditemukan</label><center>
        </div>
      </div>
      <div class="row">
        <div class="input-field col s12">
          <a class="waves-effect waves-light btn" href="<?php echo base_url(); ?>home" style="width: 100%">Kembali</a>
        </div>
      </div>
  </div>
</div>