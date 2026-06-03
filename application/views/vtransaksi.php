<!-- <nav class="blue lighten-1">
  <div class="nav-wrapper">
    <a href="#" class="brand-logo" style="width: 90%;text-align: center;">HISTORY</a>
  </div>
</nav> -->
<div class="container" style="margin-bottom: 50px;">
  <div class="row" style="margin-bottom: 0px;">
    <div class="input-field col s12">
      <span class="new badge gray" data-badge-caption="<?php echo $data_cust->total_done; ?>/<?php echo $data_cust->total_customer; ?> Selesai (<?php echo $percent_done; ?>)"></span>
    </div>
  </div>
  <ul class="collection" style="cursor: pointer">
    <?php foreach ($list as $data) { ?>
      <li class="collection-item avatar" style="min-height: unset"  onclick="window.open('<?php echo base_url() ?>customer/detail_customer?customer=<?php echo $data->customer; ?>&no_faktur=<?php echo $data->no_faktur; ?>','_self')">
        <img src="<?php echo base_url(); ?>img/file_1509157371.png"" alt="" class="circle">
        <span class="title"><?php echo $data->nama; ?></span>
        <p><small class="date_list"> Tgl Catat : <?php echo $data->tgl_catat; ?></small></p>
        <a class="secondary-content">
          <?php if ($data->is_lunas == 0) { ?>
          <span class="new badge orange" data-badge-caption="belum"></span>
          <?php }else{ ?>
          <span class="new badge green" data-badge-caption="lunas"></span>
          <?php } ?>
        </a>
      </li>
    <?php } ?>
  </ul>
      <a class="modal-trigger btn-floating btn-large waves-effect waves-light" href="#modal_filter" style="bottom: 60px;z-index: 999;position: fixed;right: 20px;">
        <i class="large material-icons">filter_list</i>
      </a>
</div>

<div id="modal_filter" class="modal modal-fixed-footer" style="overflow: unset;max-height: 400px;">
  <div class="modal-content" style="overflow: unset;">
    <form class="col s12" method="get" action="<?php echo base_url(); ?>transaksi">
      <div class="row" style="margin: 0px;">
        <div class="input-field col s12">
          <label for="filter_limit">Tampilkan Data</label><br>
        </div>
        <div class="input-field col s12">
          <select class="browser-default" name="filter_limit" id="filter_limit">
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="-">Semua</option>
          </select>
        </div>
      </div>
      <div class="row" style="margin: 0px;">
        <div class="input-field col s12">
          <label for="filter_limit">Urut Berdasarkan</label><br>
        </div>
        <div class="input-field col s12">
          <select class="browser-default" id="filter_sort" name="filter_sort">
            <option value="nama">Nama</option>
            <option value="date">Tanggal</option>
          </select>
        </div>
      </div>
  </div>
  <div class="modal-footer">
    <div class="row">
      <div class="input-field col s6" style="margin: 0px;">
      </div>
      <div class="input-field col s12" style="margin: 0px;">
        <span><button class="waves-effect waves-light btn primary" type="submit" style="margin: 3px 0;">FILTER</button></span>
        <span><a class="waves-effect waves-light btn modal-action modal-close" type="button" href="#!" style="margin: 3px 0;">TUTUP</a></span>
      </div>
    </div>
  </div>
  </form>
</div>