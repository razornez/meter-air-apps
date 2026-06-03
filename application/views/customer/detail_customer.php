<div class="base_url" hidden><?php echo base_url(); ?></div>
<!-- <nav class="blue lighten-1">
  <div class="nav-wrapper">
    <a href="#" class="brand-logo" style="width: 90%;text-align: center;">DETAIL</a>
  </div>
</nav> -->
<div class="container" style="margin: 10px 15px 50px 15px;width: auto;">
  <div class="card">
    <div class="card-content" style="padding: 15px">
      <div class="row" style="margin-top: 10px;margin: 0px;">
        <div class="col s4">
          <center><img class="circle" src="<?php echo base_url(); ?>img/file_1509157371.png" style="border: 1px solid #ffffff1f;"><center>
        </div>
        <div class="col s8">
          <p><?php echo $data->nama; ?></p>
          <small><b>Alamat :</b> <?php echo $data->alamat; ?></small><br>
          <small><b>Telp/Wa :</b> <?php echo $data->telp; ?></small><br>
          <small><b>Status :</b> <?php echo $data->status == 1 ? '<span style="float:unset" class="new badge" data-badge-caption="">aktif</span>' : '<span style="float:unset" class="new badge red" data-badge-caption="">block</span>' ?> </small><br>
        </div>
      </div>
    </div>
    <div class="card-tabs">
      <ul class="tabs tabs-fixed-width">
        <li class="tab"><a class="active" href="#test4">Tagihan</a></li>
        <li class="tab"><a href="#test5">Riwayat</a></li>
        <li class="tab"><a href="#test6">Detail</a></li>
      </ul>
    </div>
    <div class="card-content grey lighten-4">
      <div id="test4"><!-- //TAGIHAN -->
        <?php if (!empty($riwayat[0])){ ?>
        <div class="row list_title">
          <div class="col s5">
            Rekening Air :&nbsp;
          </div>
          <div class="col s7 right_list">
            <?php echo "Rp " . number_format($riwayat[0]->subtotal,0,',','.'); ?> <small>(<?php echo $riwayat[0]->quantity; ?> m3)</small>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s5">
            Denda :&nbsp;
          </div>
          <div class="col s7 right_list">
            <?php echo "Rp " . number_format($riwayat[0]->denda,0,',','.'); ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s5">
            Beban :&nbsp;
          </div>
          <div class="col s7 right_list">
            <?php echo "Rp " . number_format($riwayat[0]->beban,0,',','.'); ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s5">
            Tgl Catat :&nbsp;
          </div>
          <div class="col s7 right_list">
            <?php echo date('d M Y H:i:s', strtotime($riwayat[0]->tanggal)); ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s5">
            <b>Total :&nbsp;</b>
          </div>
          <div class="col s7 right_list">
            <b><?php echo "Rp " . number_format($riwayat[0]->total,0,',','.'); ?></b>
          </div>
        </div>
        <br>
        <div class="row list_title">
          <div class="col s12">
            <?php if ($riwayat[0]->is_lunas == 1){ ?>
            <td><span class="new badge green left" data-badge-caption="Lunas" style="margin:0px;"></span></td>
            <?php }else{ ?>
            <span class="new badge orange left" data-badge-caption="Belum lunas / Konfirmasi pembayaran" style="margin:0px;"></span>
            <?php } ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s7">
            <small>Batas waktu pembayaran</small>
          </div>
          <div class="col s5 right_list">
            <small><b><?php echo date('d M Y', strtotime($riwayat[0]->tgl_jth_tempo)); ?></b></small>
          </div>
        </div>
        <?php }else{ ?>
          Data tidak ditemukan
        <?php } ?>
      </div>
      <div id="test5"><!-- //RIWAYAT -->
        <!-- <h6>Riwayat Pengecekan</h6  > -->
        <?php if (!empty($riwayat[0])){ ?>
        <table>
        <thead>
          <tr>
              <th style="min-width:10px;text-align:left;">No</th>
              <th style="min-width:70px;text-align:left;">Tanggal</th>
              <th style="min-width:100px;">Total</th>
              <th>Mtr</th>
              <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <?php 
          $riwayat2 = $this->Mcustomer->getListCustomer('B1502200001', '100', 'date', $data->id, '-', '-');
          $no=1;foreach ($riwayat2 as $riwayat) { ?>
          <tr>
            <td><?php echo $no++ ?></td>
            <td><small><?php echo date('d M Y', strtotime($riwayat->tgl_jatuh_tempo)); ?></small></td>
            <td><small><?php echo "Rp " . number_format($riwayat->total,0,',','.'); ?> (<?php echo $riwayat->quantity; ?> m3)</small></td>
            <td><small><a class="modal-trigger" href="#modal1" onclick="setImgToModal('https://bumdeskiangroke.com/pdam-android/img/foto_meter/<?php echo $riwayat->foto_meter ?>')"><?php echo $riwayat->mtr_last; ?></a></small></td>
            <?php if ($riwayat->is_lunas == 1){ ?>
            <td><span class="new badge green" data-badge-caption="Lunas"></span></td>
            <?php }else{ ?>
            <td><span class="new badge orange" data-badge-caption="Belum"></span></td>
            <?php } ?>
          </tr>
        <?php } ?>
        </tbody>
      </table>
      <?php }else{ ?>
      Data tidak ditemukan
      <?php } ?>
      </div>
      <div id="test6"><!-- //DETAIL -->
        <div class="row list_title">
          <div class="col s3">
            Nama 
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->nama; ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s3">
            ID  
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->id; ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s3">
            Alamat 
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->alamat.', '.$data->kota; ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s3">
            RT / RW
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->rt.' / '.$data->rw; ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s3">
            Telp/Wa  
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->telp; ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s3">
            Tipe
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->tipe; ?>
          </div>
        </div>
        <div class="row list_title">
          <div class="col s3">
            Registrasi
          </div>
          <div class="col s1">
            : 
          </div>
          <div class="col s8">
            <?php echo $data->tgl_daftar; ?>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div id="modal1" class="modal modal-fixed-footer" style="max-height: 300px;max-width: 300px;">
  <div class="modal-content">
    <div class="modal-body" id="content_img">
      <img style="width:100%;border-radius:50%;" src="#">
    </div>
  </div>
  <div class="modal-footer">
    <button type="button" href="#!" class="modal-close btn btn-light" data-dismiss="modal">Close</button>
  </div>
</div>
<script language="JavaScript">
  function setImgToModal(url){
    document.querySelector('#content_img').innerHTML = `<img style="width:100%;max-height: 300px;" src="`+url+`">`;
    $("#myModalShowImg").modal();
  }
</script>