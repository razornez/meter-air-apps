<style type="text/css">
  .table td, .jsgrid .jsgrid-table td, .table th, .jsgrid .jsgrid-table th {
    padding: 10px;
  }
  .material-switch > input[type="checkbox"] {
    display: none;   
  }

  .material-switch > label {
    cursor: pointer;
    height: 0px;
    position: relative; 
    width: 40px;  
  }

  .material-switch > label::before {
    background: rgb(0, 0, 0);
    box-shadow: inset 0px 0px 10px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    content: '';
    height: 16px;
    margin-top: -8px;
    position:absolute;
    opacity: 0.3;
    transition: all 0.4s ease-in-out;
    width: 40px;
  }
  .material-switch > label::after {
    background: rgb(255, 255, 255);
    border-radius: 16px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
    content: '';
    height: 24px;
    left: -4px;
    margin-top: -8px;
    position: absolute;
    top: -4px;
    transition: all 0.3s ease-in-out;
    width: 24px;
  }
  .material-switch > input[type="checkbox"]:checked + label::before {
    background: inherit;
    opacity: 0.5;
  }
  .material-switch > input[type="checkbox"]:checked + label::after {
    background: inherit;
    left: 20px;
  }
</style>
<div class="main-panel">
  <div class="row">
    <div class="col-md-12 d-flex align-items-stretch grid-margin">
      <div class="row flex-grow">
        <div class="col-12 stretch-card" style="padding-top: 5px;">
          <div class="card">
            <div class="card-body">
              <h4 class="card-title"><i class="fa fa-cogs"></i>&nbsp&nbsp Konfigurasi</h4>
              <?php echo $this->session->flashdata('pesan');?>
              <form action="<?php echo base_url(). 'config/update_aksi'; ?>" method="post" enctype="multipart/form-data">
                <div class="form-group">
                  <label class="col-md-4 control-label label-produk">Perusahaan</label>
                  <div class="col-md-12">
                    <input id="id_config" name="id_config" type="hidden" value="<?php echo $dataconfig->id ?>">
                    <input id="perusahaan" name="perusahaan" type="text" value="<?php echo $dataconfig->perusahaan ?>" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-6 control-label label-produk">Logo Perusahaan</label>
                  <div class="col-md-12">
                    <img style="width:100px;" id="blah" src="<?php echo base_url().'img/'.$dataconfig->logo ?>" alt="your image" /><br><br>
                    <div class="col-lg-4 grid-margin stretch-card">
                      <input type="file" name="foto" class="dropify" />
                    </div>
                  </div>
                </div><br>
                <div class="form-group">
                  <label class="col-md-4 control-label label-produk">Telp</label>
                  <div class="col-md-12">
                    <input id="telp" name="telp" type="number" value="<?php echo $dataconfig->telp ?>" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-4 control-label label-produk">Alamat</label>
                  <div class="col-md-12">
                    <input id="alamat" name="alamat" type="text" value="<?php echo $dataconfig->alamat ?>" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-4 control-label label-produk">Link Aplikasi</label>
                  <div class="col-md-12">
                    <input id="link_app" name="link_app" type="text" value="<?php echo $dataconfig->link_app ?>" class="form-control" required>
                  </div>
                </div>
                <div class="form-group">
                  <label class="col-md-4 control-label label-produk">Lisensi</label>
                  <div class="col-md-12">
                    <input id="lisensi" name="lisensi" type="text" value="<?php echo $dataconfig->lisensi ?>" class="form-control" readonly>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_supplier" class="form-check-input" <?php echo $dataconfig->show_supplier == 1 ? 'checked' : null; ?>>
                        Aktifkan Menu Supplier
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_stok_masuk" class="form-check-input" <?php echo $dataconfig->show_stok_masuk == 1 ? 'checked' : null; ?>>
                        Aktifkan Menu Stok Masuk
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_stok_keluar" class="form-check-input" <?php echo $dataconfig->show_stok_keluar == 1 ? 'checked' : null; ?>>
                        Aktifkan Menu Stok Keluar
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group" style="display: none;">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_laporan_stok" class="form-check-input" <?php echo $dataconfig->show_laporan_stok == 1 ? 'checked' : null; ?>>
                        Aktifkan Menu Laporan Stok
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_customer" class="form-check-input" <?php echo $dataconfig->show_customer== 1 ? 'checked' : null; ?>>
                        Memakai Data Customer
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group" style="display: none;">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_ukuran" class="form-check-input" <?php echo $dataconfig->show_ukuran == 1 ? 'checked' : null; ?>>
                        Memakai Ukuran Produk
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_opsi_all" class="form-check-input" <?php echo $dataconfig->show_opsi_all == 1 ? 'checked' : null; ?>>
                        Aktifkan Kolom diskon/ppn/ongkir/jth tempo di Halaman transaksi
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <div class="col-md-12">
                    <div class="form-check form-check-flat">
                      <label class="form-check-label">
                      <input type="checkbox" name="show_alert_delete" class="form-check-input" <?php echo $dataconfig->show_alert_delete == 1 ? 'checked' : null; ?>>
                        Aktifkan pop up konfirmasi ketika menghapus data transaksi pada daftar belanja
                      <i class="input-helper"></i></label>
                    </div>
                  </div>
                </div>
                <div class="form-group" style="display: none;">
                  <label class="col-md-4 control-label label-produk">Jenis Faktur</label>
                  <div class="col-md-12">
                    <select class="form-control" name="jenis_faktur" id="jenis_faktur" style="font-size: 12px;">
                      <option value="1">Besar</option>
                      <option value="0">Kecil</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn btn-small btn-success">Simpan</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
