<div class="main-panel">
  <div class="row">
    <div class="col-12 grid-margin">
      <div class="card">
        <div class="card-body">
        <?php echo $this->session->flashdata('pesan');?>
          <h4 class="card-title">Filter laporan yang akan ditampilkan</h4>
          <form action="<?php echo base_url(). 'laporan/filter'; ?>" method="post" enctype="multipart/form-data">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Dari Tanggal</label>
                  <div class="col-sm-9">
                    <input type="date" class="form-control" name="filter_tgl_awal" value="<?php echo $this->input->post('filter_tgl_awal') == '' ? '2018-05-01' : $this->input->post('filter_tgl_awal') ?>">
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">s/d</label>
                  <div class="col-sm-9">
                    <input type="date" class="form-control" name="filter_tgl_akhir" value="<?php echo $this->input->post('filter_tgl_akhir') == '' ? date('Y-m-d') : $this->input->post('filter_tgl_akhir') ?>">
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Produk</label>
                  <div class="col-sm-9">
                    <select name="filter_produk" class="js-example-basic-single" style="width:100%">
                      <?php foreach ($dataproduk as $data) { ?>
                        <option value="<?php echo $data->nama ?>"><?php echo $data->nama == 't.produk' ? 'Semua' : $data->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
              </div>
              <!-- <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Customer</label>
                  <div class="col-sm-9">
                    <select name="filter_customer" class="js-example-basic-single" style="width:100%">
                      <?php foreach ($datacustomer as $data) { ?>
                        <option value="<?php echo $data->id ?>"><?php echo $data->nama == 'c.customer' ? 'Semua' : $data->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
              </div> -->
              <div class="col-md-6" style="display:none;">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Customer</label>
                  <div class="col-sm-9">
                    <select name="filter_customer" class="js-example-basic-single" style="width:100%">
                      <option value="f.customer">--Semua--</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Supplier</label>
                  <div class="col-sm-9">
                    <select  name="filter_supplier" class="js-example-basic-single" style="width:100%">
                      <option value="s.supplier">--Semua--</option>
                      <?php foreach ($datasupplier as $data) { ?>
                        <option value="<?php echo $data->id ?>"><?php echo $data->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
              </div> -->
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Urutkan</label>
                  <div class="col-sm-9">
                    <select name="filter_urut" class="js-example-basic-single" style="width:100%">
                      <option value="f.tanggal desc">Tanggal terbaru</option>
                        <option value="f.total desc">Total terbesar</option>
                        <option value="f.total asc">Total terkecil</option>
                        <option value="f.no_faktur asc">No Faktur</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label"> </label>
                  <div class="col-sm-9">
                    <button type="submit" class="btn btn-info btn-fw"><i class="mdi mdi-sort"></i>Filter Laporan</button>
                    <button type="button" data-toggle="modal" href="#myModalFilter" class="btn btn-primary btn-fw"><i class="mdi mdi-download"></i>Print Laporan</button>
                    <a href="<?=base_url()?>transaksi/clear" onclick="return confirm('Anda akan menghapus semua data transaksi, yakin ?')" class="btn btn-icons btn-danger" title="hapus semua data transaksi" style="color:#fff"><i class="mdi mdi-database"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal hide" id="myModalFilter">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel-3">Print Laporan</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <form action="<?php echo base_url(). 'laporan/laporan_pdf'; ?>" method="post" enctype="multipart/form-data">
            <div class="col-12 grid-margin">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Dari</label>
                  <div class="col-sm-9">
                    <input type="date" class="form-control" name="pop_filter_tgl_awal" value="<?php echo $this->input->post('filter_tgl_awal') == '' ? '2018-05-01' : $this->input->post('filter_tgl_awal') ?>">
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">s/d</label>
                  <div class="col-sm-9">
                    <input type="date" class="form-control" name="pop_filter_tgl_akhir" value="<?php echo $this->input->post('filter_tgl_akhir') == '' ? date('Y-m-d') : $this->input->post('filter_tgl_akhir') ?>">
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Produk</label>
                  <div class="col-sm-9">
                    <select name="pop_filter_produk" class="js-example-basic-single" style="width:100%;font-size:10px;">
                      <?php foreach ($dataproduk as $data) { ?>
                        <option value="<?php echo $data->nama ?>"><?php echo $data->nama == 't.produk' ? 'Semua' : $data->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
              </div>
             <!--  <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Customer</label>
                  <div class="col-sm-9">
                    <select name="pop_filter_customer" class="js-example-basic-single" style="width:100%">
                      <?php foreach ($datacustomer as $data) { ?>
                        <option value="<?php echo $data->id ?>"><?php echo $data->nama == 'c.customer' ? 'Semua' : $data->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
              </div> -->
              <div class="col-md-6" style="display:none;">
                <div class="form-group row">
                  <label class="col-sm-2 col-form-label">Customer</label>
                  <div class="col-sm-9">
                    <select name="pop_filter_customer" class="js-example-basic-single" style="width:100%">
                      <option value="f.customer">--Semua--</option>
                    </select>
                  </div>
                </div>
              </div>
              <!-- <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Supplier</label>
                  <div class="col-sm-9">
                    <select  name="filter_supplier" class="js-example-basic-single" style="width:100%">
                      <option value="s.supplier">--Semua--</option>
                      <?php foreach ($datasupplier as $data) { ?>
                        <option value="<?php echo $data->id ?>"><?php echo $data->nama ?></option>
                      <?php } ?>
                    </select>
                  </div>
                </div>
              </div> -->
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group row">
                  <label class="col-sm-3 col-form-label">Urutkan</label>
                  <div class="col-sm-9">
                    <select name="pop_filter_urut" class="js-example-basic-single" style="width:100%">
                      <option value="f.tanggal desc">Tanggal terbaru</option>
                        <option value="f.total desc">Total terbesar</option>
                        <option value="f.total asc">Total terkecil</option>
                        <option value="f.no_faktur asc">No Faktur</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit" class="btn btn-success">Print</button>
              <button type="button" class="btn btn-light" data-dismiss="modal">Cancel</button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
    <?php 
      $tgl_awal = date_create($this->input->post('filter_tgl_awal'));
      $tgl_akhir = date_create($this->input->post('filter_tgl_akhir'));
      $awal = date_format($tgl_awal, 'd M Y');
      $akhir = date_format($tgl_akhir, 'd M Y');
    ?>
    <div class="col-lg-12 grid-margin stretch-card">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Laporan Penjualan dari tanggal <?php echo $awal == date('d M Y') ? '1 Mei 2018' : $awal ?><?php echo ' s/d ' ?><?php echo $akhir == date('d M Y') ? ' Sekarang ' : $akhir ?><?php echo $this->input->post('filter_produk') == 't.produk' ? ' Semua produk' : $this->input->post('filter_produk') ?></h5>
          <p class="card-description"><code><?php echo $datalaporan->num_rows() ?> data ditemukan</code> </p>
          <div id="js-grid-sortable" class="jsgrid" style="position: relative; height: 500px; width: 100%;">
            <div class="jsgrid-grid-header jsgrid-header-scrollbar">
              <table class="jsgrid-table">
                <tr class="jsgrid-header-row">
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 50px;">No</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 100px;">Tanggal</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 100px;">Faktur</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 250px;">Produk</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 70px;">Subtotal</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 70px;">Diskon</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 70px;">Ongkir</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 100px;">Total</th>
                  <th class="jsgrid-header-cell jsgrid-align-right" style="width: 80px;"> </th>
                </tr>
              </table>
            </div>
            <div class="jsgrid-grid-body" style="height: 454px;">
              <table class="jsgrid-table">
                <?php
                if(empty($datalaporan)){ ?>
                  <tr>
                    <td>Data tidak ditemukan</td>
                  </tr>
                <?php }else{
                if(!$jlhpage){         //ini untuk menangani penomoran agar otomatis menyesuaikan dengan paging
                  $no=1;
                }else{$no=$jlhpage;}
                foreach ($datalaporan->result() as $data) { ?>
                  <tbody>
                    <tr class="jsgrid-row">
                      <td class="jsgrid-cell jsgrid-align-right" style="width: 50px;"><?php echo $no++ ?></td>
                      <td class="jsgrid-cell" style="width: 100px;"><?php echo $data->tgl_mod ?></td>
                      <td class="jsgrid-cell" style="width: 100px;"><?php echo $data->no_faktur ?></td>
                      <td class="jsgrid-cell" style="width: 250px;">
                        <div>
                          <table class="table" style="pointer-events:none;">
                            <tbody>
                              <?php 
                              $data_produk = $this->db->query("SELECT * from transaksi t where faktur = '".$data->no_faktur."' ")->result();
                              foreach ($data_produk as $prod) { 
                                ?>
                                <tr>
                                  <td style="width:30px;font-size: 0.65rem;border: none;padding: 5px;border-radius: 0px;margin-bottom: 2px;text-align: center" class="badge badge-inverse-primary badge-pill" >
                                    <?php echo $prod->quantity ?>
                                  </td>
                                  <td style="font-size:12px;border: none;padding: 1px;"><?php echo $prod->produk ?></td>
                                  <td style="font-size:12px;text-align:right;border: none;padding: 1px;"><?php echo number_format($prod->total) ?></td>
                                </tr>
                              <?php } ?>
                            </tbody>
                          </table>
                        </div>
                      </td>
                      <td class="jsgrid-cell jsgrid-align-right" style="width: 70px;"><?php echo number_format($data->f_subtotal) ?></td>
                      <td class="jsgrid-cell jsgrid-align-right" style="width: 70px;"><?php echo number_format($data->f_diskon) ?></td>
                      <td class="jsgrid-cell jsgrid-align-right" style="width: 70px;"><?php echo number_format($data->f_biaya_kirim) ?></td>
                      <td class="jsgrid-cell jsgrid-align-right" style="width: 100px;"><?php echo number_format($data->f_total) ?></td>
                      <td class="jsgrid-cell jsgrid-align-right" style="width: 80px;">
                      <?php if($data->customer != '-'){ ?>
                        <a onClick="window.open('<?php echo base_url().'transaksi/faktur_custom?faktur='.$data->no_faktur ?>').window.print()" style="cursor:pointer;"><label class="badge badge-info" style="cursor: pointer;">faktur</label></a>
                        <a data-toggle="modal" href="#modalDelete<?=$data->id?>"><label class="badge badge-danger" style="cursor:pointer;" title="hapus transaksi">x</label></a>
                      <?php }else{ ?>
                        <a onClick="window.open('<?php echo base_url().'transaksi/faktur?faktur='.$data->no_faktur ?>').window.print()" style="cursor:pointer;"><label class="badge badge-info" style="cursor: pointer;">faktur</label></a>
                        <a data-toggle="modal" href="#modalDelete<?=$data->id?>"><label class="badge badge-danger" style="cursor:pointer;"title="hapus transaksi">x</label></a>
                      <?php } ?>

                      <div class="modal hide" id="modalDelete<?=$data->id?>">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="exampleModalLabel-3">Hapus Transaksi dengan faktur <?php echo $data->no_faktur ?></h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                              </button>
                            </div>
                            <form action="<?=base_url()?>transaksi/delete_lap?faktur=<?=$data->no_faktur?>" method="post">
                              <div class="modal-body">
                                <p>Data akan dihapus permanen, Apakah yakin akan menghapus ?</p>
                              </div>
                              <div class="modal-footer">
                              <button type="submit" class="btn btn-success">Hapus</button>
                                <button type="button" class="btn btn-light" data-dismiss="modal">Batal</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>

                      </td>
                    </tr>
                  <?php }} ?>
                  <tr class="jsgrid-row">
                    <td class="jsgrid-cell jsgrid-align-right" colspan="6" style="width: 70px;font-weight: 700;"> Total :</td>
                    <td class="jsgrid-cell jsgrid-align-right" colspan="3" style="width: 100px;font-weight: 700;"><?php echo number_format($total_all) ?></td>
                  </tr>
                  <tr class="jsgrid-row">
                    <td class="jsgrid-cell jsgrid-align-right" colspan="6" style="width: 70px;font-weight: 700;"> Laba :</td>
                    <td class="jsgrid-cell jsgrid-align-right" colspan="3" style="width: 100px;font-weight: 700;"><?php echo number_format($laba_all) ?></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  </div>